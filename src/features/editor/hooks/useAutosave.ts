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
  const { autosaveEnabled, autosaveDelayMs } = useSettingsStore();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const getContentRef = useRef(getContent);
  const currentPathRef = useRef(currentPath);

  // Keep refs current so the timeout always uses the latest values
  getContentRef.current = getContent;
  currentPathRef.current = currentPath;

  // Re-arm the debounce timer whenever the path or settings change
  useEffect(() => {
    if (!autosaveEnabled || !getContent || !currentPath) return;

    // Clear any pending save when file switches
    if (timer.current) clearTimeout(timer.current);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [currentPath, autosaveEnabled, autosaveDelayMs, getContent]);

  // Exposed trigger — call this on every content change
  const triggerAutosave = () => {
    if (!autosaveEnabled) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const path = currentPathRef.current;
      const fn = getContentRef.current;
      if (!path || !fn) return;
      try {
        const content = await fn();
        await FileService.writeFile(path, content);
        markSaved(path);
      } catch (e) {
        console.warn('[Autosave] failed:', e);
      }
    }, autosaveDelayMs);
  };

  return { triggerAutosave };
}