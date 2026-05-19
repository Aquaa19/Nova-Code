// src/screens/CodeEditorScreen.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Alert, AppState, AppStateStatus, Keyboard, ActivityIndicator, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { FileTabBar } from '../features/editor/components/FileTabBar';
import { WebViewEditor, WebViewEditorHandle } from '../features/editor/components/WebViewEditor';
import { QuickNavDrawer } from '../features/editor/components/QuickNavDrawer';
import { IconButton } from '../components/buttons/IconButton';
import { FloatingActionButton } from '../components/buttons/FloatingActionButton';
import { AppText } from '../components/typography/AppText';
import { GlassCard } from '../components/cards/GlassCard';
import { theme } from '../theme';

// Services & Hooks
import { FileService } from '../services/FileService';
import { useEditorStore } from '../store/useEditorStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useProjectStore } from '../store/useProjectStore';
import { useFileOpen } from '../features/editor/hooks/useFileOpen';
import { useAutosave } from '../features/editor/hooks/useAutosave';
import { InteractiveConsole } from '../features/terminal/components/InteractiveConsole';
import { useTerminalEngine } from '../features/terminal/hooks/useTerminalEngine';

// ── PTY output cleaner ──
function addRawOutput(prev: string[], raw: string): string[] {
  const clean = raw
    .replace(/\r/g, '')
    .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '')
    .replace(/\x1b\[[\x30-\x3f]*[\x20-\x2f]*[\x40-\x7e]/g, '')
    .replace(/\x1b[@-_]/g, '')
    .replace(/\x1b[^\[\]]/g, '')
    .replace(/\x1b/g, '');

  if (!clean.trim()) return prev;

  const lines = clean.split('\n');
  const next = [...prev];
  if (next.length === 0) return lines;
  next[next.length - 1] += lines[0];
  for (let i = 1; i < lines.length; i++) next.push(lines[i]);
  return next;
}

export const CodeEditorScreen: React.FC<any> = ({ route, navigation }) => {
  const editorRef = useRef<WebViewEditorHandle>(null);

  const [editorContent, setEditorContent] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);

  // ── Keyboard & Search State ──
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [searchMatchCount, setSearchMatchCount] = useState(0);
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);

  // Global State
  const { openFiles, activeIndex, markUnsaved, markSaved, setActiveIndex, closeFile, updateCursor } = useEditorStore();
  const { currentProject, saveProjectSession } = useProjectStore();
  const settings = useSettingsStore(); // Full settings object to dynamically pass to webview
  const { openFileAtPath } = useFileOpen();

  const [consoleVisible, setConsoleVisible] = useState(false);
  const [terminalStatus, setTerminalStatus] = useState('Ready');
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  const activeFile = openFiles[activeIndex];
  const activeFileRef = useRef(activeFile);
  activeFileRef.current = activeFile;

  const sendInputRef = useRef<((data: string) => void) | null>(null);
  const sendFileRef = useRef<((filename: string, content: string) => void) | null>(null);

  const appendLine = useCallback((raw: string) => {
    setTerminalLines(prev => addRawOutput(prev, raw));
  }, []);

  const { connect, disconnect, sendInput, sendFile, isConnected } = useTerminalEngine({
    onOutput: appendLine,
    onUploadAck: (filename) => {
      const file = activeFileRef.current;
      if (!file) return;
      const command =
        file.language === 'python'   ? `python3 ${filename}\n`
        : file.language === 'javascript' ? `node ${filename}\n`
        : file.language === 'java'   ? `javac ${filename} && java ${filename.replace('.java', '')}\n`
        : file.language === 'c'      ? `gcc ${filename} -o prog && ./prog\n`
        : file.language === 'cpp'    ? `g++ ${filename} -o prog && ./prog\n`
        :                              `echo "Unsupported language"\n`;
      setTerminalLines(prev => [...prev, `Running: ${command.trim()}`]);
      sendInputRef.current?.(command);
    },
    onConnected: () => {
      setTerminalStatus('Running...');
      const file = activeFileRef.current;
      if (!file) {
        setTerminalLines(prev => [...prev, 'No file open to run.']);
        return;
      }
      const fileName = file.path.split('/').pop() ?? 'main';
      setTerminalLines(prev => [...prev, `Uploading ${fileName}...`]);
      FileService.readFile(file.path)
        .then(content => sendFileRef.current?.(fileName, content))
        .catch(() => setTerminalLines(prev => [...prev, 'Failed to read file.']));
    },
    onDisconnected: () => {
      setTerminalStatus('Disconnected');
      setTerminalLines(prev => [...prev, '', '[Nova Engine] Session closed.']);
    },
    onError: (err) => {
      setTerminalStatus('Error');
      setTerminalLines(prev => [...prev, '', `[Nova Engine] Error: ${err}`]);
    },
  });

  sendInputRef.current = sendInput;
  sendFileRef.current = sendFile;

  // ── Keyboard Listeners ──
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // ── Sync Settings Dynamically ──
  useEffect(() => {
    editorRef.current?.setTheme?.(settings.theme);
    editorRef.current?.setFontSize?.(settings.fontSize);
    editorRef.current?.setWordWrap?.(settings.wordWrap);
    editorRef.current?.setLineNumbers?.(settings.lineNumbers);
    editorRef.current?.setTabSize?.(settings.tabWidth);
  }, [settings.theme, settings.fontSize, settings.wordWrap, settings.lineNumbers, settings.tabWidth]);

  // Handle Search Input
  useEffect(() => {
    if (isSearchActive) {
      editorRef.current?.setSearchQuery?.(searchQuery, replaceQuery, false);
    } else {
      editorRef.current?.setSearchQuery?.('', '', false);
    }
  }, [searchQuery, replaceQuery, isSearchActive]);

  const handleSave = useCallback(async () => {
    if (!activeFile) return;
    try {
      const content = await editorRef.current?.getContent();
      if (content !== undefined) {
        await FileService.writeFile(activeFile.path, content);
        markSaved(activeFile.path);
      }
    } catch (e) {
      Alert.alert('Save Error', 'Could not write to file.');
    }
  }, [activeFile, markSaved]);

  const { triggerAutosave } = useAutosave(
    editorRef.current ? () => editorRef.current!.getContent() : null,
    activeFile?.path ?? null
  );

  // Background Autosave Guard
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/)) {
        if (activeFile?.unsaved) {
          handleSave();
        }
      }
    });
    return () => subscription.remove();
  }, [activeFile, handleSave]);

  // Session Persistence
  useEffect(() => {
    if (currentProject && activeFile) {
      saveProjectSession(currentProject.path, {
        activeFilePath: activeFile.path,
        cursorLine: activeFile.cursorLine || 1,
        cursorCol: activeFile.cursorCol || 1,
      });
    }
  }, [currentProject, activeFile?.path, activeFile?.cursorLine, activeFile?.cursorCol, saveProjectSession]);

  // Handle file paths from navigation
  useEffect(() => {
    if (route.params?.filePath) {
      openFileAtPath(route.params.filePath);
      navigation.setParams({ filePath: undefined });
    }
  }, [route.params?.filePath, openFileAtPath, navigation]);

  // Load file content into editor & Restore Cursor
  useEffect(() => {
    if (!activeFile) return;
    if (activeFile.isBinary) {
      setEditorContent('');
      return;
    }
    setIsFileLoading(true);
    FileService.readFile(activeFile.path)
      .then(content => {
        setEditorContent(content);
        editorRef.current?.setContent(content);
        if (activeFile.cursorLine && activeFile.cursorCol) {
          setTimeout(() => {
            editorRef.current?.setCursor?.(activeFile.cursorLine, activeFile.cursorCol);
          }, 150);
        }
      })
      .catch(() => Alert.alert('Error', 'Failed to read file contents.'))
      .finally(() => setIsFileLoading(false));
  }, [activeFile?.path, activeFile?.isBinary]);

  // Unsaved Changes Guards
  const checkUnsavedBeforeAction = useCallback((action: () => void) => {
    if (activeFile?.unsaved && !settings.autosaveEnabled) {
      Alert.alert(
        'Unsaved Changes',
        `Do you want to save the changes to ${activeFile.path.split('/').pop()}?`,
        [
          { text: 'Save', onPress: async () => { await handleSave(); action(); } },
          { text: 'Discard', style: 'destructive', onPress: () => { markSaved(activeFile.path); action(); } },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      action();
    }
  }, [activeFile, settings.autosaveEnabled, handleSave, markSaved]);

  const handleTabSwitch = useCallback((index: number) => {
    if (index !== activeIndex) {
      checkUnsavedBeforeAction(() => setActiveIndex(index));
    }
  }, [activeIndex, checkUnsavedBeforeAction, setActiveIndex]);

  const handleCloseTab = useCallback((path: string) => {
    const fileToClose = openFiles.find(f => f.path === path);
    if (fileToClose?.unsaved && !settings.autosaveEnabled) {
      Alert.alert(
        'Unsaved Changes',
        `Do you want to save the changes to ${path.split('/').pop()}?`,
        [
          { text: 'Save', onPress: async () => { 
              if (path === activeFile?.path) await handleSave(); 
              closeFile(path); 
            } 
          },
          { text: 'Discard', style: 'destructive', onPress: () => closeFile(path) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      closeFile(path);
    }
  }, [openFiles, activeFile, settings.autosaveEnabled, handleSave, closeFile]);

  const handleRun = useCallback(() => {
    if (!isConnected) {
      setTerminalLines([]);
      setTerminalStatus('Connecting...');
      setConsoleVisible(true);
      setTimeout(() => connect(), 0);
    } else {
      setConsoleVisible(true);
      setTerminalLines(prev => addRawOutput(prev, '\n[Nova Code] Re-using existing session.\n'));
    }
  }, [isConnected, connect]);

  const handleTerminalInput = useCallback((data: string) => sendInput(data), [sendInput]);
  const handleStopProcess = useCallback(() => disconnect(), [disconnect]);

  const isUnsaved = activeFile?.unsaved ?? false;

  const renderLayoutToggles = () => (
    <View style={styles.toggleGroup}>
      <IconButton
        icon="dock-left"
        size={20}
        onPress={() => setIsDrawerOpen(!isDrawerOpen)}
        active={isDrawerOpen}
        style={styles.toggleBtn}
      />
      <IconButton
        icon="dock-bottom"
        size={20}
        onPress={() => setConsoleVisible(!consoleVisible)}
        active={consoleVisible}
        style={styles.toggleBtn}
      />
    </View>
  );

  const AccessoryBtn = ({ icon, label, onPress }: { icon?: string, label?: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.accessoryBtn} onPress={onPress}>
      {icon ? <MaterialCommunityIcons name={icon} size={20} color={theme.colors.onSurface} /> : <AppText variant="labelSm">{label}</AppText>}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer withHeader withBottomTabs backgroundVariant="editor">
      <AppHeader
        title={activeFile ? activeFile.path.split('/').pop() : 'Nova Code'}
        leftIcon="menu"
        onLeftPress={() => setIsDrawerOpen(true)}
        centerComponent={renderLayoutToggles()}
        rightIcon={activeFile && !activeFile.isBinary ? (isSearchActive ? 'close' : 'magnify') : undefined}
        onRightPress={() => setIsSearchActive(!isSearchActive)}
        variant="transparent"
      />
      
      <View style={styles.editorContainer}>
        {openFiles.length > 0 && (
          <FileTabBar
            tabs={openFiles}
            activeIndex={activeIndex}
            onTabPress={handleTabSwitch}
            onCloseTab={handleCloseTab}
          />
        )}

        {isSearchActive && activeFile && !activeFile.isBinary && (
          <GlassCard style={styles.searchContainer} padding="s2">
            <View style={styles.searchRow}>
              <View style={styles.searchInputWrapper}>
                <MaterialCommunityIcons name="magnify" size={16} color="rgba(255,255,255,0.4)" style={styles.searchIcon} />
                <TextInput 
                  style={styles.searchInput} 
                  value={searchQuery} 
                  onChangeText={setSearchQuery} 
                  placeholder="Find..." 
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  autoCapitalize="none"
                />
              </View>
              <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.matchCount}>
                {searchMatchCount > 0 ? `${searchMatchIndex} of ${searchMatchCount}` : 'No results'}
              </AppText>
              <IconButton icon="chevron-up" size={18} onPress={() => editorRef.current?.searchPrev()} />
              <IconButton icon="chevron-down" size={18} onPress={() => editorRef.current?.searchNext()} />
            </View>
            <View style={[styles.searchRow, { marginTop: 8 }]}>
              <View style={styles.searchInputWrapper}>
                <MaterialCommunityIcons name="find-replace" size={16} color="rgba(255,255,255,0.4)" style={styles.searchIcon} />
                <TextInput 
                  style={styles.searchInput} 
                  value={replaceQuery} 
                  onChangeText={setReplaceQuery} 
                  placeholder="Replace with..." 
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  autoCapitalize="none"
                />
              </View>
              <IconButton icon="replace" size={18} onPress={() => editorRef.current?.searchReplace()} />
              <IconButton icon="swap-horizontal" size={18} onPress={() => editorRef.current?.searchReplaceAll()} />
            </View>
          </GlassCard>
        )}

        {activeFile ? (
          activeFile.isBinary ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="file-hidden" size={48} color={theme.colors.onSurfaceVariant} style={{ marginBottom: 16 }} />
              <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant}>Binary file — cannot edit</AppText>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <WebViewEditor
                ref={editorRef}
                initialContent={editorContent}
                language={activeFile.language}
                fontSize={settings.fontSize}
                theme={settings.theme}
                wordWrap={settings.wordWrap}
                lineNumbers={settings.lineNumbers}
                tabSize={settings.tabWidth}
                onContentChange={() => {
                  markUnsaved(activeFile.path);
                  triggerAutosave();
                }}
                onCursorChange={(line, col) => updateCursor(activeFile.path, line, col)}
                onSearchResults={(count, index) => {
                  setSearchMatchCount(count);
                  setSearchMatchIndex(index);
                }}
              />
              {isFileLoading && (
                <View style={styles.loaderOverlay}>
                  <ActivityIndicator size="large" color={theme.colors.primaryFixed} />
                </View>
              )}
            </View>
          )
        ) : (
          <View style={styles.emptyState}>
            <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant}>
              No file open. Select a file from the explorer.
            </AppText>
          </View>
        )}

        {/* Keyboard Accessory Bar */}
        {isKeyboardVisible && activeFile && !activeFile.isBinary && (
          <View style={styles.accessoryBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accessoryContent}>
              <AccessoryBtn icon="keyboard-tab" onPress={() => editorRef.current?.insertText(' '.repeat(settings.tabWidth))} />
              <AccessoryBtn icon="undo" onPress={() => editorRef.current?.undo()} />
              <AccessoryBtn icon="redo" onPress={() => editorRef.current?.redo()} />
              <AccessoryBtn icon="comment-text-outline" onPress={() => editorRef.current?.toggleComment()} />
              <AccessoryBtn icon="arrow-left" onPress={() => editorRef.current?.moveCursor('left')} />
              <AccessoryBtn icon="arrow-right" onPress={() => editorRef.current?.moveCursor('right')} />
              <AccessoryBtn icon="arrow-up" onPress={() => editorRef.current?.moveCursor('up')} />
              <AccessoryBtn icon="arrow-down" onPress={() => editorRef.current?.moveCursor('down')} />
              <AccessoryBtn label="{ }" onPress={() => editorRef.current?.insertText('{}')} />
              <AccessoryBtn label="[ ]" onPress={() => editorRef.current?.insertText('[]')} />
              <AccessoryBtn label="( )" onPress={() => editorRef.current?.insertText('()')} />
              <AccessoryBtn label="< >" onPress={() => editorRef.current?.insertText('<>')} />
              <AccessoryBtn label=";" onPress={() => editorRef.current?.insertText(';')} />
              <AccessoryBtn label="=" onPress={() => editorRef.current?.insertText('=')} />
              <AccessoryBtn label='"' onPress={() => editorRef.current?.insertText('""')} />
              <AccessoryBtn label="'" onPress={() => editorRef.current?.insertText("''")} />
            </ScrollView>
          </View>
        )}
      </View>

      {activeFile && !activeFile.isBinary && (
        <View style={styles.fabStack}>
          {!settings.autosaveEnabled && (
            <FloatingActionButton
              icon="content-save"
              onPress={handleSave}
              color={isUnsaved ? theme.colors.primaryFixed : 'rgba(255,255,255,0.2)'}
              disabled={!isUnsaved}
              position="none"
            />
          )}
          <FloatingActionButton
            icon={isConnected ? 'stop' : 'play'}
            onPress={isConnected ? handleStopProcess : handleRun}
            disabled={!isConnected && !settings.autosaveEnabled && isUnsaved}
            color={isConnected ? theme.colors.error : (!settings.autosaveEnabled && isUnsaved) ? 'rgba(255,255,255,0.15)' : undefined}
            position="none"
          />
        </View>
      )}

      <QuickNavDrawer
        visible={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeFilePath={activeFile?.path}
        onFileSelect={(path) => {
          checkUnsavedBeforeAction(() => {
            openFileAtPath(path);
            setIsDrawerOpen(false);
          });
        }}
      />

      <InteractiveConsole
        visible={consoleVisible}
        onClose={() => setConsoleVisible(false)}
        status={terminalStatus}
        isExecuting={isConnected}
        onInput={handleTerminalInput}
        onStop={handleStopProcess}
        lines={terminalLines}
        onClear={() => setTerminalLines([])}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  editorContainer: { flex: 1, position: 'relative' },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.radius.md,
    padding: 2,
  },
  toggleBtn: { paddingHorizontal: 8 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17, 19, 28, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(20, 24, 38, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    color: theme.colors.onSurface,
    paddingVertical: 6,
    ...theme.typography.bodySm,
  },
  matchCount: { marginHorizontal: 8, opacity: 0.6, width: 50, textAlign: 'center' },
  accessoryBar: {
    backgroundColor: '#1e2132',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 6,
  },
  accessoryContent: { paddingHorizontal: 4 },
  accessoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabStack: {
    position: 'absolute',
    right: theme.spacing.gutter,
    bottom: theme.spacing.gutter + theme.spacing.bottomTabHeight,
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
});