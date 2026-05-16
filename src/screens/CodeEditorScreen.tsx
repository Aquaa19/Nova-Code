// src/screens/CodeEditorScreen.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { FileTabBar } from '../features/editor/components/FileTabBar';
import { WebViewEditor, WebViewEditorHandle } from '../features/editor/components/WebViewEditor';
import { QuickNavDrawer } from '../features/editor/components/QuickNavDrawer';
import { IconButton } from '../components/buttons/IconButton';
import { FloatingActionButton } from '../components/buttons/FloatingActionButton';
import { AppText } from '../components/typography/AppText';
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
    .replace(/\r/g, '')                                    // carriage returns
    .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '')   // OSC (title, cwd, vte hooks)
    .replace(/\x1b\[[\x30-\x3f]*[\x20-\x2f]*[\x40-\x7e]/g, '') // CSI incl. ?2004h/l
    .replace(/\x1b[@-_]/g, '')                             // C1 control codes
    .replace(/\x1b[^\[\]]/g, '')                           // bare ESC + char
    .replace(/\x1b/g, '');                                 // any remaining ESC

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

  // Global State
  const { openFiles, activeIndex, markUnsaved, markSaved, setActiveIndex, closeFile } = useEditorStore();
  const { currentProject } = useProjectStore();
  const { fontSize, autosaveEnabled } = useSettingsStore();
  const { openFileAtPath } = useFileOpen();

  // ── Terminal State — owned HERE, passed as props ──
  const [consoleVisible, setConsoleVisible] = useState(false);
  const [terminalStatus, setTerminalStatus] = useState('Ready');
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  const activeFile = openFiles[activeIndex];
  const activeFileRef = useRef(activeFile);
  activeFileRef.current = activeFile;

  // ── sendInput / sendFile refs (prevent TDZ closure bug) ──
  const sendInputRef = useRef<((data: string) => void) | null>(null);
  const sendFileRef = useRef<((filename: string, content: string) => void) | null>(null);

  // ── Terminal output handler ──
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
      console.log('[Nova] onUploadAck: sending command:', command.trim());
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

  // Populate refs after hook returns (avoids TDZ)
  sendInputRef.current = sendInput;
  sendFileRef.current = sendFile;

  // Handle file paths from navigation
  useEffect(() => {
    if (route.params?.filePath) {
      openFileAtPath(route.params.filePath);
      navigation.setParams({ filePath: undefined });
    }
  }, [route.params?.filePath, openFileAtPath, navigation]);

  // Load file content into editor
  useEffect(() => {
    if (!activeFile) return;
    FileService.readFile(activeFile.path)
      .then(content => {
        setEditorContent(content);
        editorRef.current?.setContent(content);
      })
      .catch(() => Alert.alert('Error', 'Failed to read file contents.'));
  }, [activeFile?.path]);

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

  // Derived state for FAB logic
  const isUnsaved = activeFile?.unsaved ?? false;

  // ── Run: clear terminal, show console, then connect ──
  const handleRun = useCallback(() => {
    if (!isConnected) {
      setTerminalLines([]);
      setTerminalStatus('Connecting...');
      setConsoleVisible(true);
      // connect() after state flush — setTimeout(0) ensures render commits first
      setTimeout(() => connect(), 0);
    } else {
      setConsoleVisible(true);
      setTerminalLines(prev => addRawOutput(prev, '\n[Nova Code] Re-using existing session.\n'));
    }
  }, [isConnected, connect]);

  const handleTerminalInput = useCallback((data: string) => {
    sendInput(data);
  }, [sendInput]);

  const handleStopProcess = useCallback(() => {
    disconnect();
  }, [disconnect]);

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

  return (
    <ScreenContainer withHeader withBottomTabs backgroundVariant="editor">
      <AppHeader
        title={activeFile ? activeFile.path.split('/').pop() : 'Nova Code'}
        leftIcon="menu"
        onLeftPress={() => setIsDrawerOpen(true)}
        centerComponent={renderLayoutToggles()}
        rightIcon="magnify"
        onRightPress={() => {}}
        variant="transparent"
      />
      <View style={styles.editorContainer}>
        {openFiles.length > 0 && (
          <FileTabBar
            tabs={openFiles}
            activeIndex={activeIndex}
            onTabPress={setActiveIndex}
            onCloseTab={closeFile}
          />
        )}

        {activeFile ? (
          <WebViewEditor
            ref={editorRef}
            initialContent={editorContent}
            language={activeFile.language}
            fontSize={fontSize}
            onContentChange={() => {
              markUnsaved(activeFile.path);
              triggerAutosave();
            }}
          />
        ) : (
          <View style={styles.emptyState}>
            <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant}>
              No file open. Select a file from the explorer.
            </AppText>
          </View>
        )}
      </View>

      {activeFile && (
        <View style={styles.fabStack}>
          {/* Save button — only shown when autosave is OFF */}
          {!autosaveEnabled && (
            <FloatingActionButton
              icon="content-save"
              onPress={handleSave}
              color={isUnsaved ? theme.colors.primaryFixed : 'rgba(255,255,255,0.2)'}
              disabled={!isUnsaved}
              position="bottom-right"
            />
          )}
          {/* Play / Stop button */}
          <FloatingActionButton
            icon={isConnected ? 'stop' : 'play'}
            onPress={isConnected ? handleStopProcess : handleRun}
            disabled={!isConnected && !autosaveEnabled && isUnsaved}
            color={
              isConnected
                ? theme.colors.error
                : (!autosaveEnabled && isUnsaved)
                  ? 'rgba(255,255,255,0.15)'
                  : undefined
            }
            position="bottom-right"
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
  editorContainer: { flex: 1 },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.radius.md,
    padding: 2,
  },
  toggleBtn: { paddingHorizontal: 8 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fabStack: {
    position: 'absolute',
    right: theme.spacing.gutter,
    bottom: theme.spacing.gutter + theme.spacing.bottomTabHeight,
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
});