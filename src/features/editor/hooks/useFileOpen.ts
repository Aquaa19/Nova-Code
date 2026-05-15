// src/features/editor/hooks/useFileOpen.ts

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { FileService } from '../../../services/FileService';
import { useEditorStore } from '../../../store/useEditorStore';

export function useFileOpen() {
  const { openFile, openFiles } = useEditorStore();

  const openFileAtPath = useCallback(async (path: string) => {
    // Don't re-read if already open in a tab, just switch to it
    const existingIndex = openFiles.findIndex(f => f.path === path);
    if (existingIndex !== -1) {
      useEditorStore.getState().setActiveIndex(existingIndex);
      return;
    }

    const fileName = path.split('/').pop() ?? '';
    const language = FileService.getLanguage(fileName);
    
    try {
      // Pre-check file size to protect WebView memory
      const stat = await FileService.stat(path);
      if (stat.size > 500_000) { // 500 KB limit warning
        Alert.alert(
          'Large File Warning',
          'This file is quite large. Opening it might affect device performance.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Anyway', 
              onPress: () => openFile({ path, language, unsaved: false, cursorLine: 0, cursorCol: 0 }) 
            }
          ]
        );
        return;
      }

      openFile({ path, language, unsaved: false, cursorLine: 0, cursorCol: 0 });
    } catch (e) {
      Alert.alert('Error', `Could not read file properties: ${e}`);
    }
  }, [openFile, openFiles]);

  return { openFileAtPath };
}