import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GlassCard } from '../../../components/cards/GlassCard';
import { AppText } from '../../../components/typography/AppText';
import { CodeText } from '../../../components/typography/CodeText';
import { IconButton } from '../../../components/buttons/IconButton';
import { theme } from '../../../theme';

interface ProjectHeaderCardProps {
  projectName: string;
  projectPath: string;
  onAddFile?: () => void;
  onAddFolder?: () => void;
}

export const ProjectHeaderCard: React.FC<ProjectHeaderCardProps> = ({
  projectName,
  projectPath,
  onAddFile,
  onAddFolder,
}) => {
  return (
    <GlassCard padding="s4" style={styles.container}>
      <View style={styles.content}>
        <View style={styles.info}>
          <AppText variant="headlineMd" numberOfLines={1}>{projectName}</AppText>
          <CodeText color={theme.colors.onSurfaceVariant} numberOfLines={1} style={styles.path}>
            {projectPath}
          </CodeText>
        </View>
        <View style={styles.actions}>
          <IconButton icon="file-plus-outline" size={20} onPress={onAddFile || (() => {})} />
          <View style={{ width: 4 }} />
          <IconButton icon="folder-plus-outline" size={20} onPress={onAddFolder || (() => {})} />
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.s4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    marginRight: theme.spacing.s4,
  },
  path: {
    marginTop: theme.spacing.s1,
  },
  actions: {
    flexDirection: 'row',
  },
});
