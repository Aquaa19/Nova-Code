import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { AppText } from '../../../components/typography/AppText';
import { CodeLine } from './CodeLine';
import { theme } from '../../../theme';

interface CodeEditorViewProps {
  codeLines: string[];
  activeLine?: number;
  showLineNumbers?: boolean;
}

export const CodeEditorView: React.FC<CodeEditorViewProps> = ({
  codeLines,
  activeLine,
  showLineNumbers = true,
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScrollView horizontal contentContainerStyle={styles.horizontalContent}>
        <View style={styles.codeArea}>
          {codeLines.map((line, index) => {
            const lineNumber = index + 1;
            const isActive = activeLine === lineNumber;
            return (
              <CodeLine
                key={lineNumber}
                lineNumber={showLineNumbers ? lineNumber : undefined}
                content={line}
                active={isActive}
              />
            );
          })}
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surfaceContainerLowest, // editor background
  },
  content: {
    paddingVertical: theme.spacing.s4,
    minHeight: '100%',
  },
  horizontalContent: {
    minWidth: '100%',
  },
  codeArea: {
    paddingRight: theme.spacing.s16, // room for FAB
  },
});
