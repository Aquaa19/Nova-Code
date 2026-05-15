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
    const exists = await RNFS.exists(PROJECTS_ROOT);
    if (!exists) {
      await RNFS.mkdir(PROJECTS_ROOT);
    }
  }

  async readDir(path: string): Promise<FileNode[]> {
    const items = await RNFS.readDir(path);
    return items.map(item => ({
      name: item.name,
      path: item.path,
      isDirectory: item.isDirectory(),
      size: item.size,
      mtime: item.mtime ?? new Date(), // Fallback to current time if undefined
      extension: item.name.includes('.') ? item.name.split('.').pop() ?? '' : '',
    })).sort((a, b) => {
      // Directories first, then alphabetical
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  async readFile(path: string): Promise<string> {
    return RNFS.readFile(path, 'utf8');
  }

  async writeFile(path: string, content: string): Promise<void> {
    return RNFS.writeFile(path, content, 'utf8');
  }

  async createFile(path: string): Promise<void> {
    return RNFS.writeFile(path, '', 'utf8');
  }

  async createDir(path: string): Promise<void> {
    return RNFS.mkdir(path);
  }

  async deleteFile(path: string): Promise<void> {
    return RNFS.unlink(path);
  }

  async rename(from: string, to: string): Promise<void> {
    return RNFS.moveFile(from, to);
  }

  async exists(path: string): Promise<boolean> {
    return RNFS.exists(path);
  }

  async copyFile(from: string, to: string): Promise<void> {
    return RNFS.copyFile(from, to);
  }

  async stat(path: string): Promise<RNFS.StatResult> {
    return RNFS.stat(path);
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