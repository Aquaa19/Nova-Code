import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { FileTabBar, FileTab } from '../features/editor/components/FileTabBar';
import { CodeEditorView } from '../features/editor/components/CodeEditorView';
import { FloatingActionButton } from '../components/buttons/FloatingActionButton';

const MOCK_TABS: FileTab[] = [
  { id: '1', name: 'App.tsx', icon: 'react' },
  { id: '2', name: 'index.ts', isDirty: true, icon: 'language-typescript' },
  { id: '3', name: 'styles.css', icon: 'language-css3' },
];

const MOCK_CODE_LINES = [
  'import React from "react";',
  'import { View, Text } from "react-native";',
  '',
  'export default function App() {',
  '  return (',
  '    <View>',
  '      <Text>Hello Nova Code!</Text>',
  '    </View>',
  '  );',
  '}',
];

const NAV_ITEMS = [
  { id: 'code', label: 'Code', icon: 'code-braces' },
  { id: 'files', label: 'Files', icon: 'folder-outline' },
  { id: 'search', label: 'Search', icon: 'magnify' },
  { id: 'packages', label: 'Packages', icon: 'package-variant' },
  { id: 'terminal', label: 'Terminal', icon: 'console' },
];

export const CodeEditorScreen: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState('1');

  return (
    <ScreenContainer withHeader withBottomTabs backgroundVariant="editor">
      <AppHeader
        title="Nova Code"
        leftIcon="menu"
        rightIcon="magnify"
        variant="transparent"
      />
      <View style={styles.editorContainer}>
        <FileTabBar
          tabs={MOCK_TABS}
          activeTabId={activeTabId}
          onTabPress={setActiveTabId}
          onCloseTab={() => {}}
        />
        <CodeEditorView
          codeLines={MOCK_CODE_LINES}
          activeLine={4}
          showLineNumbers={true}
        />
      </View>
      <FloatingActionButton
        icon="play"
        onPress={() => console.log('Run code')}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  editorContainer: {
    flex: 1,
  },
});
