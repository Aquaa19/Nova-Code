// src/store/useTerminalStore.ts

import { create } from 'zustand';

export type TerminalOutputType = 'stdout' | 'stderr' | 'system' | 'input';

export interface TerminalLine {
  id: string;
  type: TerminalOutputType;
  text: string;
  timestamp: number;
}

interface TerminalStore {
  lines: TerminalLine[];
  isExecuting: boolean;
  selectedRuntime: { language: string; version: string } | null;
  addLine: (line: Omit<TerminalLine, 'id' | 'timestamp'>) => void;
  clearLines: () => void;
  setExecuting: (v: boolean) => void;
  setRuntime: (rt: { language: string; version: string }) => void;
}

export const useTerminalStore = create<TerminalStore>(set => ({
  lines: [],
  isExecuting: false,
  selectedRuntime: null,
  addLine: line => set(s => ({
    lines: [...s.lines, { ...line, id: Math.random().toString(36), timestamp: Date.now() }],
  })),
  clearLines: () => set({ lines: [] }),
  setExecuting: isExecuting => set({ isExecuting }),
  setRuntime: selectedRuntime => set({ selectedRuntime }),
}));