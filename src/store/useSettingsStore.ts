// src/store/useSettingsStore.ts

import { create } from 'zustand';
import { storage } from '../storage/mmkv';

export interface Settings {
  theme: 'dark' | 'light';
  fontSize: number;
  tabWidth: number;
  engineUrl: string;
  engineAuthToken: string;
  autosaveEnabled: boolean;
  autosaveDelayMs: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean; // Added line numbers setting
  // Git Profile
  gitAuthorName: string;
  gitAuthorEmail: string;
  gitPAT: string;
  lastUpdatedAt: number; // For cloud sync conflict resolution
  localUserId: string;
}

interface SettingsStore extends Settings {
  update: (partial: Partial<Settings>) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (val: boolean) => void;
}

const defaults: Settings = {
  theme: 'dark',
  fontSize: 14,
  tabWidth: 2,
  engineUrl: 'ws://192.168.0.152:3000',
  engineAuthToken: 'nova-super-secret-token',
  autosaveEnabled: true,
  autosaveDelayMs: 1000,
  wordWrap: true,
  minimap: false,
  lineNumbers: true, // Default to true
  gitAuthorName: '',
  gitAuthorEmail: '',
  gitPAT: '',
  lastUpdatedAt: 0,
  localUserId: '',
};

const persisted: Partial<Settings> = JSON.parse(storage.getString('settings') ?? '{}');
if (!persisted.localUserId) {
  persisted.localUserId = 'user-' + Math.random().toString(36).substring(2, 12);
  storage.set('settings', JSON.stringify({ ...persisted, localUserId: persisted.localUserId }));
}

export const useSettingsStore = create<SettingsStore>(set => ({
  ...defaults,
  ...persisted,
  hasUnsavedChanges: false,
  setHasUnsavedChanges: val => set({ hasUnsavedChanges: val }),
  update: partial => set(s => {
    const updated = { 
      ...s, 
      ...partial,
      lastUpdatedAt: partial.lastUpdatedAt !== undefined ? partial.lastUpdatedAt : Date.now()
    };
    const { update, setHasUnsavedChanges, hasUnsavedChanges, ...data } = updated;
    storage.set('settings', JSON.stringify(data));
    return updated;
  }),
}));