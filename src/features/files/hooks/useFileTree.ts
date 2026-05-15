// src/features/files/hooks/useFileTree.ts

import { useState, useCallback } from 'react';
import { FileService, FileNode } from '../../../services/FileService';

export function useFileTree(rootPath: string) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [nodeChildren, setNodeChildren] = useState<Record<string, FileNode[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChildren = useCallback(async (path: string) => {
    if (nodeChildren[path]) return; // Already loaded
    setLoading(true);
    try {
      const children = await FileService.readDir(path);
      setNodeChildren(prev => ({ ...prev, [path]: children }));
    } catch (e) {
      setError(`Failed to read: ${path}`);
    } finally {
      setLoading(false);
    }
  }, [nodeChildren]);

  const toggleExpand = useCallback(async (path: string) => {
    const next = new Set(expandedPaths);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
      await loadChildren(path);
    }
    setExpandedPaths(next);
  }, [expandedPaths, loadChildren]);

  // Force a refresh of a specific directory (useful after rename/delete/new file)
  const refreshPath = useCallback(async (path: string) => {
    try {
      const children = await FileService.readDir(path);
      setNodeChildren(prev => ({ ...prev, [path]: children }));
    } catch (e) {
      console.warn('Failed to refresh path', e);
    }
  }, []);

  return { expandedPaths, nodeChildren, loading, error, toggleExpand, loadChildren, refreshPath };
}