import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CodeText } from '../../../components/typography/CodeText';
import { theme } from '../../../theme';

interface CodeLineProps {
  lineNumber?: number;
  content: string;
  active?: boolean;
}

export const CodeLine: React.FC<CodeLineProps> = ({
  lineNumber,
  content,
  active = false,
}) => {
  // Very simplified static syntax highlighting placeholder
  return (
    <View style={[styles.container, active && styles.activeContainer]}>
      {lineNumber !== undefined && (
        <View style={styles.lineNumberContainer}>
          <CodeText
            color={active ? theme.colors.primaryFixed : theme.colors.outlineVariant}
            style={styles.lineNumber}
          >
            {lineNumber.toString().padStart(3, ' ')}
          </CodeText>
        </View>
      )}
      <View style={styles.contentContainer}>
        <CodeText color={active ? theme.colors.onSurface : theme.colors.onSurfaceVariant}>
          {content || ' '}
        </CodeText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 2,
    minHeight: 24,
  },
  activeContainer: {
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.primaryFixed,
  },
  lineNumberContainer: {
    width: 48,
    alignItems: 'flex-end',
    paddingRight: theme.spacing.s3,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.05)',
  },
  lineNumber: {
    opacity: 0.8,
  },
  contentContainer: {
    paddingLeft: theme.spacing.s3,
    flex: 1,
  },
});
