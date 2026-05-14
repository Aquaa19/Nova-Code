import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { BottomTabBar } from '../components/navigation/BottomTabBar';
import { SplitPaneLayout } from '../features/files/components/SplitPaneLayout';
import { ProjectHeaderCard } from '../features/files/components/ProjectHeaderCard';
import { FileTree, FileNode } from '../features/files/components/FileTree';
import { CodeEditorView } from '../features/editor/components/CodeEditorView';

const MOCK_FILE_TREE: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    path: '/src',
    isDirectory: true,
    isExpanded: true,
    children: [
      { id: 'App.tsx', name: 'App.tsx', path: '/src/App.tsx', isDirectory: false },
      { id: 'index.ts', name: 'index.ts', path: '/src/index.ts', isDirectory: false },
    ],
  },
  { id: 'package.json', name: 'package.json', path: '/package.json', isDirectory: false },
];

const NAV_ITEMS = [
  { id: 'code', label: 'Code', icon: 'code-braces' },
  { id: 'files', label: 'Files', icon: 'folder-outline' },
  { id: 'search', label: 'Search', icon: 'magnify' },
  { id: 'packages', label: 'Packages', icon: 'package-variant' },
  { id: 'terminal', label: 'Terminal', icon: 'console' },
];

export const FileExplorerScreen: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>();

  const renderLeftPane = () => (
    <View style={styles.leftPaneContent}>
      <ProjectHeaderCard
        projectName="NovaCode"
        projectPath="~/Projects/NovaCode"
      />
      <FileTree
        nodes={MOCK_FILE_TREE}
        selectedId={selectedNodeId}
        onToggle={() => {}}
        onPress={(node) => setSelectedNodeId(node.id)}
      />
    </View>
  );

  const renderRightPane = () => (
    <View style={styles.rightPaneContent}>
      {/* Show a preview or empty state */}
      <CodeEditorView codeLines={['// Select a file to preview']} showLineNumbers={false} />
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
