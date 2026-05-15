// src/features/files/components/ProjectHeaderCard.tsx

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
  onSwitchProject?: () => void; // New prop for Phase 2.2
}

export const ProjectHeaderCard: React.FC<ProjectHeaderCardProps> = ({
  projectName,
  projectPath,
  onAddFile,
  onAddFolder,
  onSwitchProject,
}) => {
  return (
    <GlassCard padding="s4" style={styles.container}>
      <View style={styles.content}>
        
        {/* Left Side: Now tappable to switch projects */}
        <TouchableOpacity 
          style={styles.info} 
          onPress={onSwitchProject} 
          activeOpacity={onSwitchProject ? 0.7 : 1}
          disabled={!onSwitchProject}
        >
          <View style={styles.titleRow}>
            <AppText variant="headlineMd" numberOfLines={1} style={styles.projectName}>
              {projectName}
            </AppText>
            {onSwitchProject && (
              <MaterialCommunityIcons 
                name="chevron-down" 
                size={20} 
                color={theme.colors.onSurface} 
              />
            )}
          </View>
          <CodeText color={theme.colors.onSurfaceVariant} numberOfLines={1} style={styles.path}>
            {projectPath}
          </CodeText>
        </TouchableOpacity>

        {/* Right Side: File/Folder actions */}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectName: {
    flexShrink: 1,
    marginRight: 4,
  },
  path: {
    marginTop: theme.spacing.s1,
  },
  actions: {
    flexDirection: 'row',
  },
});