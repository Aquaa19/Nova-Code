// src/features/files/components/FileTreeItem.tsx

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../../../components/typography/AppText';
import { theme } from '../../../theme';
import { FileNode } from '../../../services/FileService';
import { getFileIcon } from '../utils/fileIcons';

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  isExpanded: boolean;
  selected?: boolean; // Kept for your existing selection styling
  onPress: () => void;
  onLongPress: () => void;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = React.memo(({
  node,
  depth,
  isExpanded,
  selected = false,
  onPress,
  onLongPress,
}) => {
  // Pull the dynamic icon and color based on extension/directory status
  const { icon, color } = getFileIcon(node.extension, node.isDirectory, isExpanded);
  
  // Keep your existing depth spacing logic
  const paddingLeft = theme.spacing.s2 + (depth * theme.spacing.s4);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.container,
        { paddingLeft },
        selected && styles.selected,
        pressed && !selected && styles.pressed,
      ]}
    >
      <View style={styles.iconContainer}>
        {node.isDirectory ? (
          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-down' : 'chevron-right'}
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
        ) : (
          <View style={{ width: 16 }} /> // Placeholder for alignment
        )}
      </View>
      
      {/* Dynamic File/Folder Icon */}
      <MaterialCommunityIcons name={icon} size={18} color={color} style={styles.fileIcon} />
      
      <AppText
        variant="bodyMd"
        color={selected ? theme.colors.primaryFixed : theme.colors.onSurface}
        numberOfLines={1}
        style={styles.label}
      >
        {node.name}
      </AppText>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: theme.spacing.s4,
    minHeight: 36,
  },
  selected: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  pressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconContainer: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  fileIcon: {
    marginRight: 8,
  },
  label: {
    flex: 1,
  },
});