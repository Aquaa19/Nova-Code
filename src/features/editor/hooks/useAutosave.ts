// src/features/editor/hooks/useAutosave.ts

import { useEffect, useRef } from 'react';
import { FileService } from '../../../services/FileService';
import { useEditorStore } from '../../../store/useEditorStore';
import { useSettingsStore } from '../../../store/useSettingsStore';

export function useAutosave(
  getContent: (() => Promise<string>) | null,
  currentPath: string | null,
) {
  const { markSaved } = useEditorStore();
  const { autosaveIntervalMs } = useSettingsStore();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!getContent || !currentPath) return;

    timer.current = setInterval(async () => {
      try {
        const content = await getContent();
        await FileService.writeFile(currentPath, content);
        markSaved(currentPath);
      } catch (e) {
        console.warn('Autosave failed:', e);
      }
    }, autosaveIntervalMs);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [getContent, currentPath, autosaveIntervalMs, markSaved]);
}