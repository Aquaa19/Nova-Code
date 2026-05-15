import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { GlassCard } from './GlassCard';
import { AppText } from '../typography/AppText';
import { CodeText } from '../typography/CodeText';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

interface CodeSnippetCardProps {
  fileName: string;
  path: string;
  code: string;
  onPress: () => void;
}

export const CodeSnippetCard: React.FC<CodeSnippetCardProps> = ({
  fileName,
  path,
  code,
  onPress,
}) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
    <GlassCard padding="s0" style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="file-code-outline" size={16} color={theme.colors.onSurfaceVariant} />
        <AppText variant="labelXs" color={theme.colors.onSurface} style={styles.fileName}>
          {fileName}
        </AppText>
        <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} numberOfLines={1} style={styles.path}>
          {path}
        </AppText>
      </View>
      <ScrollView horizontal style={styles.codeContainer} contentContainerStyle={styles.codeContent}>
        <CodeText>{code}</CodeText>
      </ScrollView>
    </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  fileName: {
    marginLeft: theme.spacing.s2,
    marginRight: theme.spacing.s2,
  },
  path: {
    flex: 1,
  },
  codeContainer: {
    maxHeight: 200,
  },
  codeContent: {
    padding: theme.spacing.s3,
  },
});
