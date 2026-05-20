// src/store/useTerminalStore.ts

import { create } from 'zustand';

interface TerminalStore {
  isConnected: boolean;
  sessionId: string | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  setSessionId: (id: string | null) => void;
  setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
}

export const useTerminalStore = create<TerminalStore>(set => ({
  isConnected: false,
  sessionId: null,
  connectionStatus: 'disconnected',
  setSessionId: id => set({ sessionId: id }),
  setConnectionStatus: status => set({ connectionStatus: status, isConnected: status === 'connected' }),
}));