// src/features/editor/hooks/useFileOpen.ts

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { FileService } from '../../../services/FileService';
import { useEditorStore } from '../../../store/useEditorStore';

const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico',
  'bin', 'exe', 'dll', 'so', 'dylib', 'class', 'dex',
  'zip', 'tar', 'gz', '7z', 'rar', 'apk', 'aab', 'jar',
  'pdf', 'keystore', 'jks'
]);

export function useFileOpen() {
  const { openFile, openFiles } = useEditorStore();

  const openFileAtPath = useCallback(async (path: string) => {
    // Switch to tab if already open
    const existingIndex = openFiles.findIndex(f => f.path === path);
    if (existingIndex !== -1) {
      useEditorStore.getState().setActiveIndex(existingIndex);
      return;
    }

    const fileName = path.split('/').pop() ?? '';
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    const isBinary = BINARY_EXTENSIONS.has(ext);
    const language = isBinary ? 'binary' : FileService.getLanguage(fileName);
    
    try {
      const stat = await FileService.stat(path);
      
      // Prevent parsing large files unless explicitly approved (bypass for binaries as they render fallbacks)
      if (!isBinary && stat.size > 500_000) {
        Alert.alert(
          'Large File Warning',
          'This file is quite large. Opening it might affect device performance.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Anyway', 
              onPress: () => openFile({ path, language, unsaved: false, cursorLine: 0, cursorCol: 0, isBinary: false }) 
            }
          ]
        );
        return;
      }

      openFile({ path, language, unsaved: false, cursorLine: 0, cursorCol: 0, isBinary });
    } catch (e) {
      Alert.alert('Error', `Could not read file properties: ${e}`);
    }
  }, [openFile, openFiles]);

  return { openFileAtPath };
}