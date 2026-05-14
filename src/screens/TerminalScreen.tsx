import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { BottomTabBar } from '../components/navigation/BottomTabBar';
import { TerminalView } from '../features/terminal/components/TerminalView';
import { KeyboardAccessoryBar } from '../features/terminal/components/KeyboardAccessoryBar';
import { TerminalEntry } from '../features/terminal/components/TerminalOutputRow';

const NAV_ITEMS = [
  { id: 'code', label: 'Code', icon: 'code-braces' },
  { id: 'files', label: 'Files', icon: 'folder-outline' },
  { id: 'search', label: 'Search', icon: 'magnify' },
  { id: 'packages', label: 'Packages', icon: 'package-variant' },
  { id: 'terminal', label: 'Terminal', icon: 'console' },
];

const ACCESSORY_KEYS = [
  { id: 'tab', label: 'TAB', icon: 'keyboard-tab' },
  { id: 'up', label: 'UP', icon: 'arrow-up' },
  { id: 'down', label: 'DOWN', icon: 'arrow-down' },
  { id: 'ctrl-c', label: 'CTRL+C' },
];

const INITIAL_ENTRIES: TerminalEntry[] = [
  { id: '1', type: 'command', content: 'npm start', prompt: '~/project $' },
  { id: '2', type: 'output', content: '> nova-code@1.0.0 start\n> react-native start' },
  { id: '3', type: 'output', content: 'Starting Metro Bundler...' },
];

export const TerminalScreen: React.FC<{ onNavigate?: (id: string) => void }> = ({ onNavigate }) => {
  const [entries, setEntries] = useState<TerminalEntry[]>(INITIAL_ENTRIES);

  const handleCommand = (cmd: string) => {
    const newEntry: TerminalEntry = {
      id: Date.now().toString(),
      type: 'command',
      content: cmd,
      prompt: '~/project $',
    };
    setEntries((prev) => [...prev, newEntry]);
    
    // Mocking an immediate response
    setTimeout(() => {
      setEntries((prev) => [
        ...prev,
        { id: Date.now().toString(), type: 'output', content: `Command not found: ${cmd}` }
      ]);
    }, 300);
  };

  return (
    <ScreenContainer withHeader withBottomTabs backgroundVariant="terminal">
      <AppHeader title="Terminal" variant="transparent" />
      <View style={styles.terminalContainer}>
        <TerminalView
          entries={entries}
          onCommandSubmit={handleCommand}
        />
      </View>
      <KeyboardAccessoryBar
        keys={ACCESSORY_KEYS}
        onKeyPress={() => {}}
      />
      <BottomTabBar
        items={NAV_ITEMS}
        activeId="terminal"
        onTabPress={onNavigate || (() => {})}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  terminalContainer: {
    flex: 1,
    marginBottom: 8,
  },
});
