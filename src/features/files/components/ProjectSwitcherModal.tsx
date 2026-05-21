// src/features/files/components/ProjectSwitcherModal.tsx

import React from 'react';
import { Modal, View, StyleSheet, FlatList, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../../../components/typography/AppText';
import { GlassPanel } from '../../../components/panels/GlassPanel';
import { GlassCard } from '../../../components/cards/GlassCard';
import { theme } from '../../../theme';
import { useProjectStore, Project } from '../../../store/useProjectStore';

interface ProjectSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  onCloseWorkspace: () => void;
  onCreateProject: () => void;
  onCloneRepository: () => void;
}

export const ProjectSwitcherModal: React.FC<ProjectSwitcherModalProps> = ({
  visible,
  onClose,
  onSelectProject,
  onCloseWorkspace,
  onCreateProject,
  onCloneRepository,
}) => {
  const { recentProjects, currentProject } = useProjectStore();

  const renderProject = ({ item }: { item: Project }) => {
    const isCurrent = currentProject?.path === item.path;

    return (
      <Pressable onPress={() => onSelectProject(item)} style={styles.projectItem}>
        <GlassCard padding="s3" style={[styles.card, isCurrent && styles.cardActive]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons 
              name="folder-text-outline" 
              size={20} 
              color={isCurrent ? theme.colors.primaryFixed : theme.colors.onSurface} 
            />
            <AppText 
              variant="bodyMd" 
              color={isCurrent ? theme.colors.primaryFixed : theme.colors.onSurface}
              style={styles.cardTitle}
              numberOfLines={1}
            >
              {item.name}
            </AppText>
            <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.langBadge}>
              {item.language}
            </AppText>
          </View>
          <AppText variant="codeSm" color={theme.colors.onSurfaceVariant} numberOfLines={1}>
            {item.path}
          </AppText>
        </GlassCard>
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <GlassPanel style={styles.panel}>
          <AppText variant="headlineMd" style={styles.title}>Switch Project</AppText>

          {recentProjects.length === 0 ? (
            <AppText color={theme.colors.onSurfaceVariant} style={styles.emptyText}>
              No recent projects found. Create one to get started!
            </AppText>
          ) : (
            <FlatList
              data={recentProjects}
              keyExtractor={item => item.path}
              renderItem={renderProject}
              showsVerticalScrollIndicator={false}
              style={styles.list}
              contentContainerStyle={{ gap: theme.spacing.s2 }}
            />
          )}

          <View style={styles.footer}>
            <View style={styles.leftActions}>
              <Pressable 
                style={[styles.button, styles.closeWorkspaceBtn]} 
                onPress={onCloseWorkspace}
              >
                <MaterialCommunityIcons name="close-box-outline" size={18} color={theme.colors.error} />
                <AppText variant="bodyMd" color={theme.colors.error} style={{ marginLeft: 6 }}>
                  Close
                </AppText>
              </Pressable>
            </View>

            <View style={styles.actionRow}>
              <Pressable 
                style={[styles.button, styles.cloneRepoBtn]} 
                onPress={() => {
                  onClose();
                  onCloneRepository();
                }}
              >
                <MaterialCommunityIcons name="git" size={18} color={theme.colors.primaryFixed} />
                <AppText variant="bodyMd" color={theme.colors.primaryFixed} style={{ marginLeft: 6 }}>
                  Clone Repo
                </AppText>
              </Pressable>

              <Pressable 
                style={[styles.button, styles.createProjectBtn]} 
                onPress={() => {
                  onClose();
                  onCreateProject();
                }}
              >
                <MaterialCommunityIcons name="plus-box-outline" size={18} color={theme.colors.primaryFixed} />
                <AppText variant="bodyMd" color={theme.colors.primaryFixed} style={{ marginLeft: 6 }}>
                  New Project
                </AppText>
              </Pressable>

              <Pressable style={styles.button} onPress={onClose}>
                <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant}>Cancel</AppText>
              </Pressable>
            </View>
          </View>

        </GlassPanel>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: theme.spacing.gutter,
  },
  panel: {
    padding: theme.spacing.gutter,
    maxHeight: '80%',
  },
  title: {
    marginBottom: theme.spacing.s4,
  },
  emptyText: {
    paddingVertical: theme.spacing.s4,
    textAlign: 'center',
  },
  list: {
    maxHeight: 400,
  },
  projectItem: {
    width: '100%',
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardActive: {
    borderColor: theme.colors.primaryFixedDim,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s1,
  },
  cardTitle: {
    flex: 1,
    marginLeft: theme.spacing.s2,
    marginRight: theme.spacing.s2,
  },
  langBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    textTransform: 'uppercase',
  },
  footer: {
    marginTop: theme.spacing.s4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeWorkspaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s3,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  createProjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s3,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    marginRight: theme.spacing.s2,
  },
  cloneRepoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s3,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    marginRight: theme.spacing.s2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s2,
    borderRadius: theme.radius.sm,
  },
});