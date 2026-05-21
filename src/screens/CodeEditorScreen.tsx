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
import { useTerminalStore } from '../store/useTerminalStore';
import { useFileOpen } from '../features/editor/hooks/useFileOpen';
import { useAutosave } from '../features/editor/hooks/useAutosave';
import { InteractiveConsole } from '../features/terminal/components/InteractiveConsole';
import { useRunWorkflow } from '../features/terminal/hooks/useRunWorkflow';

export const CodeEditorScreen: React.FC<any> = ({ route, navigation }) => {
  const editorRef = useRef<WebViewEditorHandle>(null);

  const [editorContent, setEditorContent] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);

  // Keyboard & Search State
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [searchMatchCount, setSearchMatchCount] = useState(0);
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);

  // Global State
  const { openFiles, activeIndex, markUnsaved, markSaved, setActiveIndex, closeFile, updateCursor } = useEditorStore();
  const { currentProject, saveProjectSession } = useProjectStore();
  const settings = useSettingsStore();
  const { openFileAtPath } = useFileOpen();
  const { sessionId } = useTerminalStore();

  const activeFile = openFiles[activeIndex];

  // ── Run Workflow Integration ──
  const {
    runProjectOrFile,
    stopRun,
    sendInput,
    consoleVisible,
    setConsoleVisible,
    terminalLines,
    outputLines,
    setTerminalLines,
    terminalStatus,
    isConnected,
    isNetworkError,
    requiresInteractiveTab,
  } = useRunWorkflow(editorRef, activeFile, markSaved);

  // Placeholder — handleRunProject and handleRunCurrent are defined after handleSave below

  // Keyboard Listeners
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // Sync Settings Dynamically
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
    }
  }, [searchQuery, replaceQuery, isSearchActive]);

  const handleSave = useCallback(async () => {
    if (!activeFile) return;
    try {
      const content = await editorRef.current?.getContent();
      if (content !== undefined) {
        await FileService.writeFile(activeFile.path, content);
        markSaved(activeFile.path);

        // Auto-sync file changes to execution sandbox if session is running
        if (sessionId) {
          const httpUrl = settings.engineUrl.replace('ws://', 'http://').replace('wss://', 'https://');
          const filename = activeFile.path.split('/').pop() || '';
          fetch(`${httpUrl}/sessions/${sessionId}/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': settings.engineAuthToken,
            },
            body: JSON.stringify({ filename, content }),
          }).catch(e => console.warn('[Sync] failed to upload save to sandbox:', e));
        }
      }
    } catch (e) {
      Alert.alert('Save Error', 'Could not write to file.');
    }
  }, [activeFile, markSaved, sessionId, settings.engineUrl, settings.engineAuthToken]);

  const [isFormatting, setIsFormatting] = useState(false);

  const handleFormatCode = async () => {
    if (!activeFile || activeFile.language !== 'python') return;
    if (!currentProject) return;

    try {
      setIsFormatting(true);
      await handleSave();
      
      const httpUrl = settings.engineUrl.replace('ws://', 'http://').replace('wss://', 'https://');
      const filename = activeFile.path.replace(`${currentProject.path}/`, '');

      const res = await fetch(`${httpUrl}/sessions/${sessionId}/format`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': settings.engineAuthToken,
        },
        body: JSON.stringify({ filename, language: 'python' }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.error === 'Session not found' || res.status === 404) {
          useTerminalStore.getState().setSessionId(null);
        }
        throw new Error(errData.error || 'Server returned an error');
      }

      const data = await res.json();
      if (data.success && data.content) {
        setEditorContent(data.content);
        editorRef.current?.setContent(data.content);
        await FileService.writeFile(activeFile.path, data.content);
        markSaved(activeFile.path);
        Alert.alert('Format Complete', 'Python code formatted successfully.');
      } else {
        throw new Error('No formatted content returned.');
      }
    } catch (e: any) {
      Alert.alert('Formatting Error', e.message || 'Failed to format code.');
    } finally {
      setIsFormatting(false);
    }
  };

  const handleRunProject = useCallback(async () => {
    if (!currentProject) return;
    try {
      const files = await FileService.readDir(currentProject.path);
      
      // Node.js Custom Scripts Scanner
      const pkgFile = files.find(f => f.name === 'package.json');
      if (pkgFile) {
        try {
          const pkgContent = await FileService.readFile(pkgFile.path);
          const pkg = JSON.parse(pkgContent);
          
          if (pkg.scripts && Object.keys(pkg.scripts).length > 0) {
            const scriptKeys = Object.keys(pkg.scripts);
            
            const buttons: any[] = scriptKeys.map(key => ({
              text: `npm run ${key}`,
              onPress: () => {
                runProjectOrFile(pkgFile.path, 'javascript', `npm run ${key}`);
              }
            }));
            
            const entryPoints = ['index.html', 'main.py', 'index.js', 'Main.java', 'main.cpp', 'main.c'];
            const entryFile = files.find(f => entryPoints.includes(f.name));
            
            if (entryFile && entryFile.name !== 'package.json') {
              buttons.push({
                text: `Run direct (${entryFile.name})`,
                onPress: () => {
                  const lang = FileService.getLanguage(entryFile.name);
                  if (lang === 'html') {
                    handleSave().then(() => navigation.navigate('Preview'));
                  } else {
                    runProjectOrFile(entryFile.path, lang);
                  }
                }
              });
            }
            
            buttons.push({
              text: 'Cancel',
              style: 'cancel' as any,
              onPress: () => {}
            });
            
            Alert.alert(
              'Select Script',
              'Choose a script from package.json to run in the sandbox:',
              buttons,
              { cancelable: true }
            );
            return;
          }
        } catch (err) {
          console.warn('Failed to parse package.json scripts', err);
        }
      }

      const entryPoints = ['index.html', 'main.py', 'index.js', 'Main.java', 'main.cpp', 'main.c'];
      const entryFile = files.find(f => entryPoints.includes(f.name));

      if (entryFile) {
        const lang = FileService.getLanguage(entryFile.name);
        if (lang === 'html') {
          await handleSave();
          navigation.navigate('Preview');
        } else {
          runProjectOrFile(entryFile.path, lang);
        }
      } else if (activeFile) {
        if (activeFile.language === 'html') {
          await handleSave();
          navigation.navigate('Preview');
        } else {
          runProjectOrFile(activeFile.path, activeFile.language);
        }
      } else {
        Alert.alert('No Entry Point', 'No main entry file found and no file currently open.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to scan project directory.');
    }
  }, [currentProject, activeFile, runProjectOrFile, handleSave, navigation]);

  const handleRunCurrent = useCallback(async () => {
    if (activeFile?.language === 'html') {
      await handleSave();
      navigation.navigate('Preview');
      return;
    }
    if (!isConnected) {
      if (activeFile) {
        runProjectOrFile(activeFile.path, activeFile.language);
      }
    } else {
      setConsoleVisible(true);
      setTerminalLines(prev => [...prev, '\n[Nova Code] Re-using existing session.\n']);
    }
  }, [isConnected, activeFile, runProjectOrFile, setConsoleVisible, setTerminalLines, handleSave, navigation]);

  const { triggerAutosave } = useAutosave(
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

    // Check if we already have the content cached in the store
    if (activeFile.content !== undefined) {
      setEditorContent(activeFile.content);
      editorRef.current?.setContent(activeFile.content);
      if (activeFile.cursorLine && activeFile.cursorCol) {
        setTimeout(() => {
          editorRef.current?.setCursor?.(activeFile.cursorLine, activeFile.cursorCol);
        }, 150);
      }
      return;
    }

    setIsFileLoading(true);
    FileService.readFile(activeFile.path)
      .then(content => {
        // Cache the loaded content in the store
        useEditorStore.getState().updateContent(activeFile.path, content);
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

  // Unsaved Changes Guard and Tab Actions
  const handleTabSwitch = useCallback((index: number) => {
    if (index !== activeIndex) {
      editorRef.current?.clearErrorLine();
      setActiveIndex(index);
    }
  }, [activeIndex, setActiveIndex]);

  const handleCloseTab = useCallback((path: string) => {
    const fileToClose = openFiles.find(f => f.path === path);
    if (fileToClose?.unsaved && !settings.autosaveEnabled) {
      Alert.alert(
        'Unsaved Changes',
        `Do you want to save the changes to ${path.split('/').pop()}?`,
        [
          { text: 'Save', onPress: async () => { 
              if (path === activeFile?.path) {
                await handleSave(); 
              } else {
                if (fileToClose.content !== undefined) {
                  await FileService.writeFile(fileToClose.path, fileToClose.content);
                }
              }
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

  const isUnsaved = activeFile?.unsaved ?? false;

  const renderLayoutToggles = () => (
    <View style={styles.toggleGroup}>
      <IconButton icon="dock-left" size={20} onPress={() => setIsDrawerOpen(!isDrawerOpen)} active={isDrawerOpen} style={styles.toggleBtn} />
      <IconButton icon="dock-bottom" size={20} onPress={() => setConsoleVisible(!consoleVisible)} active={consoleVisible} style={styles.toggleBtn} />
      {activeFile?.language === 'python' && (
        <>
          <View style={styles.divider} />
          {isFormatting ? (
            <ActivityIndicator size="small" color={theme.colors.primaryFixed} style={{ paddingHorizontal: 8 }} />
          ) : (
            <IconButton icon="format-align-left" size={20} onPress={handleFormatCode} style={styles.toggleBtn} />
          )}
        </>
      )}
      <View style={styles.divider} />
      <IconButton icon="play-circle-outline" size={20} onPress={handleRunProject} style={styles.toggleBtn} />
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
                onContentChange={(content) => {
                  editorRef.current?.clearErrorLine();
                  markUnsaved(activeFile.path);
                  useEditorStore.getState().updateContent(activeFile.path, content);
                  triggerAutosave(content);
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
            onPress={isConnected ? stopRun : handleRunCurrent}
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
          openFileAtPath(path);
          setIsDrawerOpen(false);
        }}
      />

      <InteractiveConsole
        initialTab={requiresInteractiveTab ? 'terminal' : 'output'}
        visible={consoleVisible}
        onClose={() => setConsoleVisible(false)}
        status={terminalStatus}
        isExecuting={isConnected}
        isNetworkError={isNetworkError}
        onRetry={() => activeFile && runProjectOrFile(activeFile.path, activeFile.language)}
        onInput={(data) => sendInput(data)}
        onStop={stopRun}
        terminalLines={terminalLines}
        outputLines={outputLines}
        onClear={() => setTerminalLines([])}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  editorContainer: { flex: 1, position: 'relative' },
  toggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.radius.md,
    padding: 2,
  },
  toggleBtn: { paddingHorizontal: 8 },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 4,
  },
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