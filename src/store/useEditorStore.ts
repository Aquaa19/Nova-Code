// src/store/useEditorStore.ts

import { create } from 'zustand';

export interface OpenFile {
  path: string;
  language: string;
  unsaved: boolean;
  cursorLine: number;
  cursorCol: number;
}

interface EditorStore {
  openFiles: OpenFile[];
  activeIndex: number;
  openFile: (file: OpenFile) => void;
  closeFile: (path: string) => void;
  setActiveIndex: (index: number) => void;
  markUnsaved: (path: string) => void;
  markSaved: (path: string) => void;
}

export const useEditorStore = create<EditorStore>(set => ({
  openFiles: [],
  activeIndex: 0,
  openFile: file => set(s => ({
    openFiles: s.openFiles.find(f => f.path === file.path)
      ? s.openFiles
      : [...s.openFiles, file],
    activeIndex: s.openFiles.findIndex(f => f.path === file.path) === -1
      ? s.openFiles.length
      : s.openFiles.findIndex(f => f.path === file.path),
  })),
  closeFile: path => set(s => {
    const next = s.openFiles.filter(f => f.path !== path);
    return { openFiles: next, activeIndex: Math.max(0, s.activeIndex - 1) };
  }),
  setActiveIndex: activeIndex => set({ activeIndex }),
  markUnsaved: path => set(s => ({
    openFiles: s.openFiles.map(f => f.path === path ? { ...f, unsaved: true } : f),
  })),
  markSaved: path => set(s => ({
    openFiles: s.openFiles.map(f => f.path === path ? { ...f, unsaved: false } : f),
  })),
}));