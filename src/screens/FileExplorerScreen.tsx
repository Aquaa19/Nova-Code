// src/screens/FileExplorerScreen.tsx

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { SplitPaneLayout } from '../features/files/components/SplitPaneLayout';
import { ProjectHeaderCard } from '../features/files/components/ProjectHeaderCard';
import { FileTree } from '../features/files/components/FileTree';
import { CodeEditorView } from '../features/editor/components/CodeEditorView';

// New imports for Phase 1.2 integration
import { FileService, PROJECTS_ROOT, FileNode } from '../services/FileService';
import { useProjectStore } from '../store/useProjectStore';

export const FileExplorerScreen: React.FC<any> = ({ navigation }) => {
  const [selectedPath, setSelectedPath] = useState<string>();
  const { currentProject } = useProjectStore();

  // Default to the main projects root if no specific project is open
  const rootPath = currentProject?.path ?? PROJECTS_ROOT;

  const handleFilePress = (node: FileNode) => {
    setSelectedPath(node.path);
    
    // Navigate to the Editor stack, passing the file path and detected language
    navigation.navigate('Editor', {
      screen: 'OpenFile',
      params: { 
        filePath: node.path, 
        language: FileService.getLanguage(node.name) 
      }
    });
  };

  const handleFileLongPress = (node: FileNode) => {
    // Stub for Context Menu (Rename, Delete, New File, etc.)
    Alert.alert(
      node.name,
      'Context actions will map to ActionSheetModal in a later polish pass.',
      [
        { text: 'Rename', onPress: () => console.log('Rename', node.path) },
        { text: 'Delete', onPress: () => console.log('Delete', node.path), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderLeftPane = () => (
    <View style={styles.leftPaneContent}>
      <ProjectHeaderCard
        projectName={currentProject?.name ?? "Nova Projects"}
        projectPath={rootPath}
      />
      <FileTree
        rootPath={rootPath}
        selectedPath={selectedPath}
        onFilePress={handleFilePress}
        onFileLongPress={handleFileLongPress}
      />
    </View>
  );

  const renderRightPane = () => (
    <View style={styles.rightPaneContent}>
      {/* Placeholder for tablet/landscape preview. 
        On standard mobile screens, tapping a file will jump to the Editor tab via navigation. 
      */}
      <CodeEditorView codeLines={['// Select a file to edit or preview']} showLineNumbers={false} />
    </View>
  );

  return (
    <ScreenContainer withHeader withBottomTabs>
      <AppHeader title="Files" />
      <View style={styles.content}>
        <SplitPaneLayout
          left={renderLeftPane()}
          right={renderRightPane()}
          leftWidth={40}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  leftPaneContent: {
    flex: 1,
    paddingRight: 16,
  },
  rightPaneContent: {
    flex: 1,
  },
});