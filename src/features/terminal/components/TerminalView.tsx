import React, { useRef } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { TerminalOutputRow, TerminalEntry } from './TerminalOutputRow';
import { TerminalPrompt } from './TerminalPrompt';
import { theme } from '../../../theme';

interface TerminalViewProps {
  entries: TerminalEntry[];
  promptStr?: string;
  onCommandSubmit: (command: string) => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  entries,
  promptStr = '~/project $',
  onCommandSubmit,
}) => {
  const listRef = useRef<FlatList>(null);

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TerminalOutputRow entry={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          <TerminalPrompt promptStr={promptStr} onSubmit={onCommandSubmit} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Terminal background
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  listContent: {
    padding: theme.spacing.s4,
  },
});
