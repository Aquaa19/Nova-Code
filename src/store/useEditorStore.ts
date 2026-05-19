// src/store/useEditorStore.ts

import { create } from 'zustand';

export interface OpenFile {
  path: string;
  language: string;
  unsaved: boolean;
  cursorLine: number;
  cursorCol: number;
  isBinary?: boolean; // Protect editor from parsing buffers/images
}

interface EditorStore {
  openFiles: OpenFile[];
  activeIndex: number;
  openFile: (file: OpenFile) => void;
  closeFile: (path: string) => void;
  setActiveIndex: (index: number) => void;
  markUnsaved: (path: string) => void;
  markSaved: (path: string) => void;
  updateCursor: (path: string, line: number, col: number) => void;
  clearFiles: () => void;
}

export const useEditorStore = create<EditorStore>(set => ({
  openFiles: [],
  activeIndex: 0,
  openFile: file => set(s => {
    const existingIndex = s.openFiles.findIndex(f => f.path === file.path);
    if (existingIndex !== -1) {
      return { activeIndex: existingIndex };
    }
    return {
      openFiles: [...s.openFiles, file],
      activeIndex: s.openFiles.length,
    };
  }),
  closeFile: path => set(s => {
    const closedIndex = s.openFiles.findIndex(f => f.path === path);
    if (closedIndex === -1) return s;

    const nextFiles = s.openFiles.filter(f => f.path !== path);
    let nextIndex = s.activeIndex;

    if (closedIndex < s.activeIndex) {
      nextIndex--;
    } else if (closedIndex === s.activeIndex && nextIndex >= nextFiles.length) {
      nextIndex = Math.max(0, nextFiles.length - 1);
    }

    return { openFiles: nextFiles, activeIndex: nextIndex };
  }),
  setActiveIndex: activeIndex => set({ activeIndex }),
  markUnsaved: path => set(s => ({
    openFiles: s.openFiles.map(f => f.path === path ? { ...f, unsaved: true } : f),
  })),
  markSaved: path => set(s => ({
    openFiles: s.openFiles.map(f => f.path === path ? { ...f, unsaved: false } : f),
  })),
  updateCursor: (path, line, col) => set(s => ({
    openFiles: s.openFiles.map(f => f.path === path ? { ...f, cursorLine: line, cursorCol: col } : f),
  })),
  clearFiles: () => set({ openFiles: [], activeIndex: 0 }),
}));