// src/store/useProjectStore.ts

import { create } from 'zustand';
import { storage } from '../storage/mmkv';

export interface Project {
  name: string;
  path: string;
  language: string;
  lastOpened: number; // timestamp
}

export interface ProjectSession {
  activeFilePath: string;
  cursorLine: number;
  cursorCol: number;
}

interface ProjectStore {
  currentProject: Project | null;
  recentProjects: Project[];
  setCurrentProject: (project: Project) => void;
  addRecentProject: (project: Project) => void;
  fileTreeCache: Record<string, string[]>; // path → children paths
  setFileTreeCache: (path: string, children: string[]) => void;
  
  // Session tracking for Req 3
  projectSessions: Record<string, ProjectSession>;
  saveProjectSession: (projectPath: string, session: ProjectSession) => void;
}

// Load initial state synchronously from MMKV
const initialRecentProjects = JSON.parse(storage.getString('recentProjects') ?? '[]');
const initialProjectSessions = JSON.parse(storage.getString('projectSessions') ?? '{}');

export const useProjectStore = create<ProjectStore>(set => ({
  currentProject: null,
  recentProjects: initialRecentProjects,
  setCurrentProject: project => set({ currentProject: project }),
  addRecentProject: project => set(s => {
    // Keep max 10 projects, move recently opened to the top
    const updated = [project, ...s.recentProjects.filter(p => p.path !== project.path)].slice(0, 10);
    storage.set('recentProjects', JSON.stringify(updated));
    return { recentProjects: updated };
  }),
  fileTreeCache: {},
  setFileTreeCache: (path, children) => set(s => ({
    fileTreeCache: { ...s.fileTreeCache, [path]: children },
  })),
  projectSessions: initialProjectSessions,
  saveProjectSession: (projectPath, session) => set(s => {
    const updatedSessions = { ...s.projectSessions, [projectPath]: session };
    storage.set('projectSessions', JSON.stringify(updatedSessions));
    return { projectSessions: updatedSessions };
  }),
}));