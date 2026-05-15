// src/screens/CodeEditorScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { FileTabBar } from '../features/editor/components/FileTabBar';
import { WebViewEditor, WebViewEditorHandle } from '../features/editor/components/WebViewEditor';
import { QuickNavDrawer } from '../features/editor/components/QuickNavDrawer';
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
import { PistonService } from '../features/terminal/services/PistonService';
import { ConsoleBottomSheet } from '../features/terminal/components/ConsoleBottomSheet';

export const CodeEditorScreen: React.FC<any> = ({ route, navigation }) => {
  const editorRef = useRef<WebViewEditorHandle>(null);
  const [editorContent, setEditorContent] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Global State
  const { openFiles, activeIndex, markUnsaved, markSaved, setActiveIndex, closeFile } = useEditorStore();
  const { currentProject } = useProjectStore();
  const { fontSize } = useSettingsStore();
  const { openFileAtPath } = useFileOpen();
  
  // Console State
  const [consoleVisible, setConsoleVisible] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [stdin, setStdin] = useState('');

  const activeFile = openFiles[activeIndex];

  // 1. Intercept file paths sent via React Navigation
  useEffect(() => {
    if (route.params?.filePath) {
      openFileAtPath(route.params.filePath);
      // Clear the param so it doesn't re-trigger when switching tabs!
      navigation.setParams({ filePath: undefined });
    }
  }, [route.params?.filePath, openFileAtPath, navigation]);

  // 2. Load content from disk when the active tab changes
  useEffect(() => {
    if (!activeFile) return;
    
    FileService.readFile(activeFile.path)
      .then(content => {
        setEditorContent(content);
        // If the WebView is already mounted and ready, dispatch the new content
        editorRef.current?.setContent(content);
      })
      .catch(e => {
        Alert.alert('Error', 'Failed to read file contents.');
      });
  }, [activeFile?.path]);

  // 3. Manual Save Handler
  const handleSave = async () => {
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
  };

  // 4. Background Autosave (Triggered via Settings)
  useAutosave(
    editorRef.current ? () => editorRef.current!.getContent() : null,
    activeFile?.path ?? null
  );

  // 5. Code Execution
  const handleRun = async () => {
    if (!currentProject || !activeFile) {
      Alert.alert('Notice', 'You must have a project and file open to run code.');
      return;
    }

    // Ensure the current file is saved before running
    await handleSave();

    setConsoleVisible(true);
    setIsExecuting(true);
    setConsoleOutput('Running...\n');

    try {
      const result = await PistonService.executeProject(currentProject.path, activeFile.language, stdin);
      
      if (result.message) {
        setConsoleOutput(`Error: ${result.message}`);
      } else {
        const out = result.run.output || '';
        setConsoleOutput(out === '' ? '(No output)' : out);
      }
    } catch (e: any) {
      setConsoleOutput(`Failed to execute: ${e.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <ScreenContainer withHeader withBottomTabs backgroundVariant="editor">
      <AppHeader
        title={activeFile ? activeFile.path.split('/').pop() : 'Nova Code'}
        leftIcon="menu"
        onLeftPress={() => setIsDrawerOpen(true)}
        rightIcon="magnify"
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
            onContentChange={() => markUnsaved(activeFile.path)}
          />
        ) : (
          <View style={styles.emptyState}>
            <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant}>
              No file open. Select a file from the explorer.
            </AppText>
          </View>
        )}
      </View>

      {/* Execution Button */}
      {activeFile && (
        <FloatingActionButton
          icon="play"
          onPress={handleRun}
        />
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

      <ConsoleBottomSheet
        visible={consoleVisible}
        onClose={() => setConsoleVisible(false)}
        output={consoleOutput}
        isExecuting={isExecuting}
        stdin={stdin}
        setStdin={setStdin}
        onRun={handleRun}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  editorContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});