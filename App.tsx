import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CodeEditorScreen } from './src/screens/CodeEditorScreen';
import { FileExplorerScreen } from './src/screens/FileExplorerScreen';
import { GlobalSearchScreen } from './src/screens/GlobalSearchScreen';
import { PackageManagerScreen } from './src/screens/PackageManagerScreen';
import { TerminalScreen } from './src/screens/TerminalScreen';
import { theme } from './src/theme';

function App() {
  const [activeTab, setActiveTab] = useState('code');

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <AppContent activeTab={activeTab} onNavigate={setActiveTab} />
    </SafeAreaProvider>
  );
}

function AppContent({ activeTab, onNavigate }: { activeTab: string, onNavigate: (id: string) => void }) {
  let ScreenComponent = CodeEditorScreen;

  switch (activeTab) {
    case 'files':
      ScreenComponent = FileExplorerScreen;
      break;
    case 'search':
      ScreenComponent = GlobalSearchScreen;
      break;
    case 'packages':
      ScreenComponent = PackageManagerScreen;
      break;
    case 'terminal':
      ScreenComponent = TerminalScreen;
      break;
    case 'code':
    default:
      ScreenComponent = CodeEditorScreen;
      break;
  }

  return (
    <View style={styles.container}>
      <ScreenComponent onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default App;
