// src/screens/FileExplorerScreen.tsx

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { SplitPaneLayout } from '../features/files/components/SplitPaneLayout';
import { ProjectHeaderCard } from '../features/files/components/ProjectHeaderCard';
import { FileTree } from '../features/files/components/FileTree';

import { FileService, PROJECTS_ROOT, FileNode } from '../services/FileService';
import { useProjectStore, Project } from '../store/useProjectStore';
import { useEditorStore } from '../store/useEditorStore';

// Modals & Drawers
import { ActionSheetModal, ActionItem } from '../components/modals/ActionSheetModal';
import { NewItemModal, NewItemMode } from '../components/modals/NewItemModal';
import { NewProjectModal } from '../features/files/components/NewProjectModal';
import { ProjectSwitcherModal } from '../features/files/components/ProjectSwitcherModal';
import { SourceControlDrawer } from '../features/files/components/SourceControlDrawer';
import { CloneRepositoryModal } from '../features/files/components/CloneRepositoryModal';

// Services & Types
import { ProjectService } from '../features/files/services/ProjectService';
import { ProjectTemplateType } from '../templates';
import { AppText } from '../components/typography';
import { theme } from '../theme';

export const FileExplorerScreen: React.FC<any> = ({ navigation }) => {
  const [selectedPath, setSelectedPath] = useState<string>();
  const { currentProject, setCurrentProject, addRecentProject } = useProjectStore();

  const rootPath = currentProject?.path ?? PROJECTS_ROOT;

  // Modal States
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [actionTarget, setActionTarget] = useState<FileNode | null>(null);

  const [newItemModalVisible, setNewItemModalVisible] = useState(false);
  const [newItemMode, setNewItemMode] = useState<NewItemMode>(null);
  const [newItemTargetDir, setNewItemTargetDir] = useState<string>('');
  const [newItemInitialValue, setNewItemInitialValue] = useState<string>('');

  const [newProjectModalVisible, setNewProjectModalVisible] = useState(false);
  const [projectSwitcherVisible, setProjectSwitcherVisible] = useState(false);
  const [sourceControlVisible, setSourceControlVisible] = useState(false);
  const [cloneModalVisible, setCloneModalVisible] = useState(false);

  // Trigger FileTree refresh
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setRefreshTrigger(prev => prev + 1);
    });
    return unsubscribe;
  }, [navigation]);

  const handleFilePress = (node: FileNode) => {
    setSelectedPath(node.path);
    navigation.navigate('Editor', {
      screen: 'OpenFile',
      params: { 
        filePath: node.path, 
        language: FileService.getLanguage(node.name) 
      }
    });
  };

  const handleFileLongPress = (node: FileNode) => {
    setActionTarget(node);
    setActionSheetVisible(true);
  };

  const openNewItemModal = (mode: NewItemMode, targetDir: string, initialValue: string = '') => {
    setNewItemMode(mode);
    setNewItemTargetDir(targetDir);
    setNewItemInitialValue(initialValue);
    setNewItemModalVisible(true);
  };

  const handleNewItemSubmit = async (value: string) => {
    try {
      if (newItemMode === 'rename' && actionTarget) {
        const parentPath = actionTarget.path.substring(0, actionTarget.path.lastIndexOf('/'));
        await FileService.rename(actionTarget.path, `${parentPath}/${value}`);
      } else if (newItemMode === 'file') {
        await FileService.createFile(`${newItemTargetDir}/${value}`);
      } else if (newItemMode === 'folder') {
        await FileService.createDir(`${newItemTargetDir}/${value}`);
      }
      
      setRefreshTrigger(prev => prev + 1);
    } catch (e) {
      Alert.alert('Error', `Failed to complete operation: ${e}`);
    } finally {
      setNewItemModalVisible(false);
      setActionTarget(null);
    }
  };

  const handleNewProjectSubmit = async (name: string, template: ProjectTemplateType) => {
    try {
      const newProject = await ProjectService.createProject(name, template);
      useEditorStore.getState().clearFiles();
      addRecentProject(newProject);
      setCurrentProject(newProject);
      setRefreshTrigger(prev => prev + 1);
      setNewProjectModalVisible(false);
    } catch (e) {
      Alert.alert('Error', `Failed to create project: ${e}`);
    }
  };

  const handleSwitchProject = (project: Project) => {
    const updatedProject = { ...project, lastOpened: Date.now() };
    useEditorStore.getState().clearFiles();
    addRecentProject(updatedProject);
    setCurrentProject(updatedProject);
    setProjectSwitcherVisible(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCloseWorkspace = () => {
    useEditorStore.getState().clearFiles();
    setCurrentProject(null as any); 
    setProjectSwitcherVisible(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDelete = (node: FileNode) => {
    Alert.alert(
      `Delete ${node.name}?`,
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await FileService.deleteFile(node.path);
              setRefreshTrigger(prev => prev + 1);
            } catch (e) {
              Alert.alert('Error', 'Could not delete item.');
            }
          }
        }
      ]
    );
  };

  const getContextMenuActions = (): ActionItem[] => {
    if (!actionTarget) return [];

    const targetDir = actionTarget.isDirectory 
      ? actionTarget.path 
      : actionTarget.path.substring(0, actionTarget.path.lastIndexOf('/'));

    return [
      {
        id: 'new-file',
        label: 'New File Here',
        icon: 'file-plus-outline',
        onPress: () => openNewItemModal('file', targetDir)
      },
      {
        id: 'new-folder',
        label: 'New Folder Here',
        icon: 'folder-plus-outline',
        onPress: () => openNewItemModal('folder', targetDir)
      },
      {
        id: 'rename',
        label: 'Rename',
        icon: 'pencil-outline',
        onPress: () => openNewItemModal('rename', actionTarget.path, actionTarget.name)
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: 'delete-outline',
        tone: 'danger',
        onPress: () => handleDelete(actionTarget)
      }
    ];
  };

  const renderLeftPane = () => (
    <View style={styles.leftPaneContent}>
      <ProjectHeaderCard
        projectName={currentProject?.name ?? "All Projects"}
        projectPath={rootPath}
        onSwitchProject={() => setProjectSwitcherVisible(true)}
        onAddFile={() => currentProject 
          ? openNewItemModal('file', rootPath) 
          : Alert.alert('Notice', 'Open a project first to create a file.')
        }
        onAddFolder={() => currentProject 
          ? openNewItemModal('folder', rootPath) 
          : setNewProjectModalVisible(true)
        }
      />
      <FileTree 
        rootPath={rootPath} 
        selectedPath={selectedPath}
        onFilePress={handleFilePress} 
        onFileLongPress={handleFileLongPress}
        refreshTrigger={refreshTrigger}
      />
    </View>
  );

  const renderRightPane = () => (
    <View style={[styles.rightPaneContent, { justifyContent: 'center', alignItems: 'center' }]}>
      <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant}>
        Select a file to preview
      </AppText>
    </View>
  );

  return (
    <ScreenContainer withHeader withBottomTabs>
      <AppHeader 
        title="Files" 
        rightIcon="source-branch" 
        onRightPress={() => setSourceControlVisible(true)} 
      />
      <View style={styles.content}>
        <SplitPaneLayout
          left={renderLeftPane()}
          right={renderRightPane()}
          leftWidth={40}
        />
      </View>

      {/* Overlays */}
      <ActionSheetModal
        visible={actionSheetVisible}
        actions={getContextMenuActions()}
        onDismiss={() => setActionSheetVisible(false)}
      />
      
      <NewItemModal
        visible={newItemModalVisible}
        mode={newItemMode}
        initialValue={newItemInitialValue}
        onSubmit={handleNewItemSubmit}
        onCancel={() => setNewItemModalVisible(false)}
      />

      <NewProjectModal
        visible={newProjectModalVisible}
        onClose={() => setNewProjectModalVisible(false)}
        onSubmit={handleNewProjectSubmit}
      />

      <ProjectSwitcherModal
        visible={projectSwitcherVisible}
        onClose={() => setProjectSwitcherVisible(false)}
        onSelectProject={handleSwitchProject}
        onCloseWorkspace={handleCloseWorkspace}
        onCreateProject={() => setNewProjectModalVisible(true)}
        onCloneRepository={() => setCloneModalVisible(true)}
      />

      <SourceControlDrawer
        visible={sourceControlVisible}
        onClose={() => setSourceControlVisible(false)}
        onGitActionComplete={() => setRefreshTrigger(prev => prev + 1)}
      />

      <CloneRepositoryModal
        visible={cloneModalVisible}
        onClose={() => setCloneModalVisible(false)}
        onCloneSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  leftPaneContent: {
    flex: 1,
    paddingRight: 16,
  },
  rightPaneContent: {
    flex: 1,
  },
});