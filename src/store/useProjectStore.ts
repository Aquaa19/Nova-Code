// src/store/useProjectStore.ts

import { create } from 'zustand';
import { storage } from '../storage/mmkv';

interface Project {
  name: string;
  path: string;
  language: string;
  lastOpened: number; // timestamp
}

interface ProjectStore {
  currentProject: Project | null;
  recentProjects: Project[];
  setCurrentProject: (project: Project) => void;
  addRecentProject: (project: Project) => void;
  fileTreeCache: Record<string, string[]>; // path → children paths
  setFileTreeCache: (path: string, children: string[]) => void;
}

export const useProjectStore = create<ProjectStore>(set => ({
  currentProject: null,
  recentProjects: JSON.parse(storage.getString('recentProjects') ?? '[]'),
  setCurrentProject: project => set({ currentProject: project }),
  addRecentProject: project => set(s => {
    const updated = [project, ...s.recentProjects.filter(p => p.path !== project.path)].slice(0, 10);
    storage.set('recentProjects', JSON.stringify(updated));
    return { recentProjects: updated };
  }),
  fileTreeCache: {},
  setFileTreeCache: (path, children) => set(s => ({
    fileTreeCache: { ...s.fileTreeCache, [path]: children },
  })),
}));