// src/features/editor/hooks/useAutosave.ts

import { useEffect, useRef } from 'react';
import { FileService } from '../../../services/FileService';
import { useEditorStore } from '../../../store/useEditorStore';
import { useSettingsStore } from '../../../store/useSettingsStore';

export function useAutosave(
  currentPath: string | null,
) {
  const { markSaved } = useEditorStore();
  const { autosaveEnabled, autosaveDelayMs } = useSettingsStore();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const currentPathRef = useRef(currentPath);
  const latestContentRef = useRef<string>('');
  const hasUnsavedChangesRef = useRef<boolean>(false);

  // Keep path ref updated
  currentPathRef.current = currentPath;

  // Flush function to write pending changes immediately
  const flushSave = async (path: string, content: string) => {
    if (!path) return;
    try {
      await FileService.writeFile(path, content);
      markSaved(path);
    } catch (e) {
      console.warn('[Autosave] flush failed:', e);
    }
  };

  // Re-arm or flush when path or settings change
  useEffect(() => {
    const prevPath = currentPathRef.current;
    
    return () => {
      // Cleanup: if there are pending unsaved changes for the active file when switching, write them immediately!
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      if (hasUnsavedChangesRef.current && prevPath) {
        hasUnsavedChangesRef.current = false;
        flushSave(prevPath, latestContentRef.current);
      }
    };
  }, [currentPath, autosaveEnabled, autosaveDelayMs]);

  const triggerAutosave = (content: string) => {
    latestContentRef.current = content;
    hasUnsavedChangesRef.current = true;
    
    if (!autosaveEnabled) return;
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      const path = currentPathRef.current;
      if (!path) return;
      try {
        hasUnsavedChangesRef.current = false;
        await FileService.writeFile(path, content);
        markSaved(path);
      } catch (e) {
        console.warn('[Autosave] failed:', e);
      }
    }, autosaveDelayMs);
  };

  return { triggerAutosave, flushSave };
}