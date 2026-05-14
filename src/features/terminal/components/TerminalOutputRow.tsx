import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CodeText } from '../../../components/typography/CodeText';
import { theme } from '../../../theme';

export interface TerminalEntry {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  prompt?: string;
}

interface TerminalOutputRowProps {
  entry: TerminalEntry;
}

export const TerminalOutputRow: React.FC<TerminalOutputRowProps> = ({ entry }) => {
  if (entry.type === 'command') {
    return (
      <View style={styles.commandRow}>
        <CodeText color={theme.colors.primaryFixed} style={styles.prompt}>
          {entry.prompt || '>'}
        </CodeText>
        <CodeText color={theme.colors.onSurface} style={styles.content}>
          {entry.content}
        </CodeText>
      </View>
    );
  }

  const isError = entry.type === 'error';
  return (
    <View style={styles.outputRow}>
      <CodeText color={isError ? theme.colors.error : theme.colors.onSurfaceVariant} style={styles.content}>
        {entry.content}
      </CodeText>
    </View>
  );
};

const styles = StyleSheet.create({
  commandRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.s1,
  },
  outputRow: {
    marginBottom: theme.spacing.s2,
    paddingLeft: theme.spacing.s2,
  },
  prompt: {
    marginRight: theme.spacing.s2,
  },
  content: {
    flex: 1,
  },
});
