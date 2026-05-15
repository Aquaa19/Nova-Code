// src/features/files/components/FileTree.tsx

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FileTreeItem } from './FileTreeItem';
import { useFileTree } from '../hooks/useFileTree';
import { FileNode } from '../../../services/FileService';
import { AppText } from '../../../components/typography/AppText';

interface FileTreeProps {
  rootPath: string;
  selectedPath?: string; // Updated to match file paths instead of abstract IDs
  onFilePress: (node: FileNode) => void;
  onFileLongPress: (node: FileNode) => void;
  refreshTrigger?: number; // Listens for external file system changes
}

export const FileTree: React.FC<FileTreeProps> = ({
  rootPath,
  selectedPath,
  onFilePress,
  onFileLongPress,
  refreshTrigger = 0,
}) => {
  const { expandedPaths, nodeChildren, toggleExpand, loadChildren, refreshPath, error } = useFileTree(rootPath);

  // Load the root directory contents when the component mounts or path changes
  useEffect(() => {
    loadChildren(rootPath);
  }, [rootPath, loadChildren]);

  // Handle external refresh triggers (e.g., after creating/deleting a file)
  useEffect(() => {
    if (refreshTrigger > 0) {
      refreshPath(rootPath);
      // Refresh all currently expanded directories to keep the whole visible tree in sync
      expandedPaths.forEach(path => {
        refreshPath(path);
      });
    }
  }, [refreshTrigger, rootPath, expandedPaths, refreshPath]);

  // Flatten the dynamic dictionary into a single array for FlatList performance
  const flattenedData = useMemo(() => {
    const flatten = (nodesToFlatten: FileNode[], depth = 0): (FileNode & { depth: number })[] => {
      let result: (FileNode & { depth: number })[] = [];
      for (const node of nodesToFlatten) {
        result.push({ ...node, depth });
        
        // If it's an expanded directory, recursively append its loaded children
        if (node.isDirectory && expandedPaths.has(node.path)) {
          const children = nodeChildren[node.path];
          if (children) {
            result = result.concat(flatten(children, depth + 1));
          }
        }
      }
      return result;
    };

    // The root path itself isn't a rendered item, just the container for the first level
    return flatten(nodeChildren[rootPath] || []);
  }, [nodeChildren, expandedPaths, rootPath]);

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <AppText color="red">{error}</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={flattenedData}
        keyExtractor={(item) => item.path} // File paths are naturally unique keys
        renderItem={({ item }) => (
          <FileTreeItem
            node={item}
            depth={item.depth}
            isExpanded={expandedPaths.has(item.path)}
            selected={item.path === selectedPath}
            onPress={() => {
              if (item.isDirectory) {
                toggleExpand(item.path);
              } else {
                onFilePress(item);
              }
            }}
            onLongPress={() => onFileLongPress(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  }
});