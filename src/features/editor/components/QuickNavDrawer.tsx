// src/features/editor/components/QuickNavDrawer.tsx

import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { AppText } from '../../../components/typography/AppText';
import { GlassPanel } from '../../../components/panels/GlassPanel';
import { FileTree } from '../../files/components/FileTree';
import { FileNode, PROJECTS_ROOT } from '../../../services/FileService';
import { useProjectStore } from '../../../store/useProjectStore';
import { theme } from '../../../theme';

interface QuickNavDrawerProps {
  visible: boolean;
  onClose: () => void;
  onFileSelect: (path: string) => void;
  activeFilePath?: string;
}

export const QuickNavDrawer: React.FC<QuickNavDrawerProps> = ({
  visible,
  onClose,
  onFileSelect,
  activeFilePath,
}) => {
  const { currentProject } = useProjectStore();
  const rootPath = currentProject?.path ?? PROJECTS_ROOT;

  const handleFilePress = (node: FileNode) => {
    onFileSelect(node.path);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        <View style={styles.drawerContainer}>
          <GlassPanel style={styles.drawer}>
            <View style={styles.header}>
              <AppText variant="headlineMd" numberOfLines={1} style={styles.title}>
                {currentProject?.name ?? 'Files'}
              </AppText>
            </View>
            <FileTree
              rootPath={rootPath}
              selectedPath={activeFilePath}
              onFilePress={handleFilePress}
              onFileLongPress={() => {}} // No-op for quick nav
            />
          </GlassPanel>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  drawerContainer: {
    width: '75%',
    maxWidth: 320,
    height: '100%',
    padding: theme.spacing.s2,
  },
  drawer: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    padding: theme.spacing.s4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    color: theme.colors.primaryFixed,
  },
});
