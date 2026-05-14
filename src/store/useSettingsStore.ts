// src/store/useSettingsStore.ts

import { create } from 'zustand';
import { storage } from '../storage/mmkv';

interface Settings {
  theme: 'dark' | 'light';
  fontSize: number;
  tabWidth: number;
  pistonApiUrl: string;
  autosaveIntervalMs: number;
  wordWrap: boolean;
  minimap: boolean;
}

interface SettingsStore extends Settings {
  update: (partial: Partial<Settings>) => void;
}

const defaults: Settings = {
  theme: 'dark',
  fontSize: 14,
  tabWidth: 2,
  pistonApiUrl: 'https://emkc.org/api/v2/piston',
  autosaveIntervalMs: 30000,
  wordWrap: true,
  minimap: false,
};

const persisted: Partial<Settings> = JSON.parse(storage.getString('settings') ?? '{}');

export const useSettingsStore = create<SettingsStore>(set => ({
  ...defaults,
  ...persisted,
  update: partial => set(s => {
    const next = { ...s, ...partial };
    storage.set('settings', JSON.stringify(next));
    return next;
  }),
}));