// src/store/useSettingsStore.ts

import { create } from 'zustand';
import { storage } from '../storage/mmkv';

interface Settings {
  theme: 'dark' | 'light';
  fontSize: number;
  tabWidth: number;
  engineUrl: string;
  engineAuthToken: string;
  autosaveEnabled: boolean;
  autosaveDelayMs: number;
  wordWrap: boolean;
  minimap: boolean;
  // Git Profile
  gitAuthorName: string;
  gitAuthorEmail: string;
  gitPAT: string;
}

interface SettingsStore extends Settings {
  update: (partial: Partial<Settings>) => void;
}

const defaults: Settings = {
  theme: 'dark',
  fontSize: 14,
  tabWidth: 2,
  engineUrl: 'ws://192.168.1.100:3000',
  engineAuthToken: 'nova-super-secret-token',
  autosaveEnabled: true,
  autosaveDelayMs: 1000,
  wordWrap: true,
  minimap: false,
  gitAuthorName: '',
  gitAuthorEmail: '',
  gitPAT: '',
};

const persisted: Partial<Settings> = JSON.parse(storage.getString('settings') ?? '{}');

export const useSettingsStore = create<SettingsStore>(set => ({
  ...defaults,
  ...persisted,
  update: partial => set(s => {
    const updated = { ...s, ...partial };
    const { update, ...data } = updated;
    storage.set('settings', JSON.stringify(data));
    return updated;
  }),
}));