import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FileTreeItem } from './FileTreeItem';

export interface FileNode {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  isExpanded?: boolean;
  children?: FileNode[];
}

interface FileTreeProps {
  nodes: FileNode[];
  selectedId?: string;
  onToggle: (id: string) => void;
  onPress: (node: FileNode) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({
  nodes,
  selectedId,
  onToggle,
  onPress,
}) => {
  // Flatten tree for FlatList based on expanded state
  const flattenNodes = (nodesToFlatten: FileNode[], depth = 0): (FileNode & { depth: number })[] => {
    let result: (FileNode & { depth: number })[] = [];
    for (const node of nodesToFlatten) {
      result.push({ ...node, depth });
      if (node.isDirectory && node.isExpanded && node.children) {
        result = result.concat(flattenNodes(node.children, depth + 1));
      }
    }
    return result;
  };

  const flattenedData = flattenNodes(nodes);

  return (
    <View style={styles.container}>
      <FlatList
        data={flattenedData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FileTreeItem
            node={item}
            depth={item.depth}
            expanded={!!item.isExpanded}
            selected={item.id === selectedId}
            onToggle={() => onToggle(item.id)}
            onPress={() => onPress(item)}
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
});
