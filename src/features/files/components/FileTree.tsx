// src/features/files/components/FileTree.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FileTreeItem, GitBadgeProps } from './FileTreeItem';
import { useFileTree } from '../hooks/useFileTree';
import { FileNode } from '../../../services/FileService';
import { AppText } from '../../../components/typography/AppText';
import { GitService } from '../../../services/git/GitService';

interface FileTreeProps {
  rootPath: string;
  selectedPath?: string;
  onFilePress: (node: FileNode) => void;
  onFileLongPress: (node: FileNode) => void;
  refreshTrigger?: number;
}

export const FileTree: React.FC<FileTreeProps> = ({
  rootPath,
  selectedPath,
  onFilePress,
  onFileLongPress,
  refreshTrigger = 0,
}) => {
  const { expandedPaths, nodeChildren, toggleExpand, loadChildren, refreshPath, error } = useFileTree(rootPath);
  
  // Store mapped git statuses (Relative Path -> Badge Props)
  const [gitStatuses, setGitStatuses] = useState<Record<string, GitBadgeProps>>({});

  useEffect(() => {
    loadChildren(rootPath);
  }, [rootPath, loadChildren]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      refreshPath(rootPath);
      expandedPaths.forEach(path => {
        refreshPath(path);
      });
    }
  }, [refreshTrigger, rootPath, expandedPaths, refreshPath]);

  // NEW: Fetch and map Git statuses whenever tree updates
  useEffect(() => {
    const fetchGitStatus = async () => {
      try {
        const isRepo = await GitService.isRepo(rootPath);
        if (!isRepo) {
          setGitStatuses({});
          return;
        }

        const matrix = await GitService.status(rootPath);
        const newStatuses: Record<string, GitBadgeProps> = {};

        for (const row of matrix) {
          const [filepath, head, index, worktree] = row as [string, number, number, number];
          
          let badge: GitBadgeProps | undefined;
          
          // Matrix Logic mapped from Phase 6 specs
          if (head === 0 && index === 0 && worktree === 1) badge = { text: 'U', color: '#888888' }; // Untracked (Gray)
          else if (head === 0 && index === 2 && worktree === 2) badge = { text: 'A', color: '#4CAF50' }; // Added (Green)
          else if (head === 1 && index === 2 && worktree === 2) badge = { text: 'M', color: '#4CAF50' }; // Modified & Staged (Green)
          else if (head === 1 && index === 1 && worktree === 2) badge = { text: 'M', color: '#FF9800' }; // Modified (Orange)
          else if (head === 1 && index === 0 && worktree === 1) badge = { text: 'D', color: '#F44336' }; // Deleted (Red)
          else if (head === 1 && index === 0 && worktree === 0) badge = { text: 'D', color: '#F44336' }; // Deleted & Staged (Red)

          if (badge) {
            newStatuses[filepath] = badge;
          }
        }
        setGitStatuses(newStatuses);
      } catch (e) {
        setGitStatuses({});
      }
    };

    fetchGitStatus();
  }, [rootPath, refreshTrigger]);

  const flattenedData = useMemo(() => {
    const flatten = (nodesToFlatten: FileNode[], depth = 0): (FileNode & { depth: number })[] => {
      let result: (FileNode & { depth: number })[] = [];
      for (const node of nodesToFlatten) {
        result.push({ ...node, depth });
        
        if (node.isDirectory && expandedPaths.has(node.path)) {
          const children = nodeChildren[node.path];
          if (children) {
            result = result.concat(flatten(children, depth + 1));
          }
        }
      }
      return result;
    };

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
        keyExtractor={(item) => item.path}
        renderItem={({ item }) => {
          // Piston/Git expect relative paths, so we strip the rootPath prefix to match the gitStatus dictionary keys
          const relativePath = item.path.startsWith(rootPath)
            ? item.path.substring(rootPath.length + 1)
            : item.path;
          
          const badge = gitStatuses[relativePath];

          return (
            <FileTreeItem
              node={item}
              depth={item.depth}
              isExpanded={expandedPaths.has(item.path)}
              selected={item.path === selectedPath}
              gitBadge={badge}
              onPress={() => {
                if (item.isDirectory) {
                  toggleExpand(item.path);
                } else {
                  onFilePress(item);
                }
              }}
              onLongPress={() => onFileLongPress(item)}
            />
          );
        }}
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