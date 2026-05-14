import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../../../components/typography/AppText';
import { theme } from '../../../theme';

interface FileNodeData {
  id: string;
  name: string;
  isDirectory: boolean;
}

interface FileTreeItemProps {
  node: FileNodeData;
  depth: number;
  expanded: boolean;
  selected: boolean;
  onToggle: () => void;
  onPress: () => void;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({
  node,
  depth,
  expanded,
  selected,
  onToggle,
  onPress,
}) => {
  const getIcon = () => {
    if (node.isDirectory) {
      return expanded ? 'folder-open' : 'folder';
    }
    return 'file-document-outline'; // Could be enhanced with specific file type icons
  };

  const iconColor = node.isDirectory ? theme.colors.primaryFixedDim : theme.colors.onSurfaceVariant;
  const paddingLeft = theme.spacing.s2 + (depth * theme.spacing.s4);

  const handlePress = () => {
    if (node.isDirectory) {
      onToggle();
    } else {
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
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
            name={expanded ? 'chevron-down' : 'chevron-right'}
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
        ) : (
          <View style={{ width: 16 }} /> // Placeholder for alignment
        )}
      </View>
      
      <MaterialCommunityIcons name={getIcon()} size={18} color={iconColor} style={styles.fileIcon} />
      
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
};

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
