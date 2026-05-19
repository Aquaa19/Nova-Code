// src/services/FileService.ts

import RNFS from 'react-native-fs';

// Nova Code projects live here — never hardcode this elsewhere
export const PROJECTS_ROOT = `${RNFS.ExternalDirectoryPath}/NovaCode/projects`;

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  mtime: Date;
  extension: string;
}

class FileServiceClass {
  // Initialise projects directory on app start
  async init(): Promise<void> {
    try {
      const exists = await RNFS.exists(PROJECTS_ROOT);
      if (!exists) {
        await RNFS.mkdir(PROJECTS_ROOT);
      }
    } catch (error) {
      throw new Error(`Failed to initialize projects directory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async readDir(path: string): Promise<FileNode[]> {
    try {
      const items = await RNFS.readDir(path);
      return items.map(item => ({
        name: item.name,
        path: item.path,
        isDirectory: item.isDirectory(),
        size: item.size,
        mtime: item.mtime ?? new Date(),
        extension: item.name.includes('.') ? item.name.split('.').pop() ?? '' : '',
      })).sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      throw new Error(`Failed to read directory at ${path}.`);
    }
  }

  async readFile(path: string): Promise<string> {
    try {
      return await RNFS.readFile(path, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read file. It might be deleted, unreadable, or missing permissions.`);
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    try {
      await RNFS.writeFile(path, content, 'utf8');
    } catch (error) {
      throw new Error(`Failed to save file. Please check your storage space and permissions.`);
    }
  }

  async createFile(path: string): Promise<void> {
    try {
      await RNFS.writeFile(path, '', 'utf8');
    } catch (error) {
      throw new Error(`Failed to create file at ${path}.`);
    }
  }

  async createDir(path: string): Promise<void> {
    try {
      await RNFS.mkdir(path);
    } catch (error) {
      throw new Error(`Failed to create directory at ${path}.`);
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      await RNFS.unlink(path);
    } catch (error) {
      throw new Error(`Failed to delete item at ${path}.`);
    }
  }

  async rename(from: string, to: string): Promise<void> {
    try {
      await RNFS.moveFile(from, to);
    } catch (error) {
      throw new Error(`Failed to rename item to ${to}.`);
    }
  }

  async exists(path: string): Promise<boolean> {
    try {
      return await RNFS.exists(path);
    } catch (error) {
      throw new Error(`Failed to check existence of ${path}.`);
    }
  }

  async copyFile(from: string, to: string): Promise<void> {
    try {
      await RNFS.copyFile(from, to);
    } catch (error) {
      throw new Error(`Failed to copy file to ${to}.`);
    }
  }

  async stat(path: string): Promise<RNFS.StatResult> {
    try {
      return await RNFS.stat(path);
    } catch (error) {
      throw new Error(`Failed to get file properties for ${path}.`);
    }
  }

  // Detect language from file extension
  getLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    const map: Record<string, string> = {
      js: 'javascript', jsx: 'javascript',
      ts: 'typescript', tsx: 'typescript',
      py: 'python', java: 'java',
      cpp: 'cpp', c: 'c', cs: 'csharp',
      html: 'html', css: 'css',
      json: 'json', md: 'markdown',
      sh: 'shell', yaml: 'yaml', yml: 'yaml',
      rs: 'rust', go: 'go', rb: 'ruby',
      php: 'php', swift: 'swift', kt: 'kotlin',
    };
    return map[ext] ?? 'plaintext';
  }
}

export const FileService = new FileServiceClass();