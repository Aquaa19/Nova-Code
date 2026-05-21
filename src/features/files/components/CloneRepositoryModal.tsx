// src/features/files/components/CloneRepositoryModal.tsx

import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../../../components/typography/AppText';
import { GlassPanel } from '../../../components/panels/GlassPanel';
import { theme } from '../../../theme';
import { GitService } from '../../../services/git/GitService';
import { FileService, PROJECTS_ROOT } from '../../../services/FileService';
import { storage } from '../../../storage/mmkv';
import { useProjectStore, Project } from '../../../store/useProjectStore';
import { useEditorStore } from '../../../store/useEditorStore';
import { useSettingsStore } from '../../../store/useSettingsStore';

interface CloneRepositoryModalProps {
  visible: boolean;
  onClose: () => void;
  onCloneSuccess: () => void;
}

export const CloneRepositoryModal: React.FC<CloneRepositoryModalProps> = ({
  visible,
  onClose,
  onCloneSuccess,
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const settings = useSettingsStore();
  const [pat, setPat] = useState(settings.gitPAT || '');
  const [projectName, setProjectName] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const { addRecentProject, setCurrentProject } = useProjectStore();

  const handleClone = async () => {
    if (!repoUrl.trim()) {
      return Alert.alert('Error', 'Please enter a repository URL.');
    }
    if (!projectName.trim()) {
      return Alert.alert('Error', 'Please enter a local project name.');
    }

    const safeName = projectName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const projectPath = `${PROJECTS_ROOT}/${safeName}`;

    // Validate that project directory does not already exist
    const exists = await FileService.exists(projectPath);
    if (exists) {
      return Alert.alert('Error', `A directory named "${safeName}" already exists.`);
    }

    // Save PAT to Settings Store
    useSettingsStore.getState().update({ gitPAT: pat.trim() });

    setIsCloning(true);
    setProgressMsg('Initializing clone...');

    try {
      await GitService.clone(repoUrl.trim(), projectPath, (progress: any) => {
        if (progress.phase) {
          setProgressMsg(`${progress.phase}...`);
        }
      });

      // Auto-detect project language from cloned files
      let language = 'html';
      try {
        const files = await FileService.readDir(projectPath);
        const names = files.map(f => f.name.toLowerCase());
        if (names.includes('package.json')) {
          language = 'javascript';
        } else if (names.includes('requirements.txt') || files.some(f => f.name.endsWith('.py'))) {
          language = 'python';
        } else if (files.some(f => f.name.endsWith('.java'))) {
          language = 'java';
        } else if (files.some(f => f.name.endsWith('.cpp') || f.name.endsWith('.c'))) {
          language = 'cpp';
        }
      } catch (e) {
        // Fallback to html/unspecified
      }

      const newProject: Project = {
        name: safeName,
        path: projectPath,
        language,
        lastOpened: Date.now(),
      };

      // Clear open editor files to prevent stale references
      useEditorStore.getState().clearFiles();
      
      // Update store
      addRecentProject(newProject);
      setCurrentProject(newProject);

      Alert.alert('Success', 'Repository cloned successfully!');
      
      // Reset state and close modal
      setRepoUrl('');
      setProjectName('');
      onCloneSuccess();
      onClose();
    } catch (e: any) {
      Alert.alert('Clone Failed', e.message || 'An error occurred during clone.');
    } finally {
      setIsCloning(false);
      setProgressMsg('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <GlassPanel style={styles.panel}>
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <MaterialCommunityIcons name="git" size={24} color={theme.colors.primaryFixed} />
              <AppText variant="headlineMd" style={styles.title}>Clone Repository</AppText>
            </View>
            <Pressable onPress={onClose} disabled={isCloning}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurfaceVariant} />
            </Pressable>
          </View>

          {isCloning ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primaryFixed} />
              <AppText style={styles.progressText}>{progressMsg}</AppText>
            </View>
          ) : (
            <View style={styles.content}>
              <AppText variant="bodySm" color={theme.colors.onSurfaceVariant} style={styles.label}>
                Repository Git URL
              </AppText>
              <TextInput
                style={styles.input}
                value={repoUrl}
                onChangeText={(text) => {
                  setRepoUrl(text);
                  // Guess project name from URL if possible
                  if (text && !projectName) {
                    const parts = text.split('/');
                    const lastPart = parts[parts.length - 1];
                    if (lastPart) {
                      const name = lastPart.replace(/\.git$/, '');
                      setProjectName(name);
                    }
                  }
                }}
                placeholder="https://github.com/username/repo.git"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <AppText variant="bodySm" color={theme.colors.onSurfaceVariant} style={styles.label}>
                Local Folder Name
              </AppText>
              <TextInput
                style={styles.input}
                value={projectName}
                onChangeText={setProjectName}
                placeholder="my-project-name"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <AppText variant="bodySm" color={theme.colors.onSurfaceVariant} style={styles.label}>
                GitHub Token / Personal Access Token (PAT)
              </AppText>
              <TextInput
                style={styles.input}
                value={pat}
                onChangeText={setPat}
                placeholder="ghp_xxxxxxxxxxxx (Required for private repositories)"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />

              <View style={styles.buttonRow}>
                <Pressable style={styles.cancelButton} onPress={onClose}>
                  <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant}>Cancel</AppText>
                </Pressable>
                <Pressable style={styles.cloneButton} onPress={handleClone}>
                  <AppText variant="bodyMd" color={theme.colors.background}>Clone</AppText>
                </Pressable>
              </View>
            </View>
          )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s4,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: theme.spacing.s2,
  },
  content: {
    gap: theme.spacing.s2,
  },
  label: {
    marginTop: theme.spacing.s2,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.radius.sm,
    color: theme.colors.onSurface,
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s2,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.s3,
    marginTop: theme.spacing.s4,
  },
  cancelButton: {
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s2,
  },
  cloneButton: {
    backgroundColor: theme.colors.primaryFixed,
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s2,
    borderRadius: theme.radius.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.s5,
  },
  progressText: {
    marginTop: theme.spacing.s3,
    color: theme.colors.onSurfaceVariant,
  },
});
