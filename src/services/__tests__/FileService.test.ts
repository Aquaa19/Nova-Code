// src/services/__tests__/FileService.test.ts

import { FileService, PROJECTS_ROOT } from '../FileService';
import RNFS from 'react-native-fs';

jest.mock('react-native-fs', () => ({
  ExternalDirectoryPath: '/mock/external/dir',
  exists: jest.fn(),
  mkdir: jest.fn(),
  readDir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
  moveFile: jest.fn(),
  copyFile: jest.fn(),
  stat: jest.fn(),
}));

describe('FileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('should create PROJECTS_ROOT if it does not exist', async () => {
      (RNFS.exists as jest.Mock).mockResolvedValue(false);
      (RNFS.mkdir as jest.Mock).mockResolvedValue(undefined);

      await FileService.init();

      expect(RNFS.exists).toHaveBeenCalledWith(PROJECTS_ROOT);
      expect(RNFS.mkdir).toHaveBeenCalledWith(PROJECTS_ROOT);
    });

    it('should not create PROJECTS_ROOT if it already exists', async () => {
      (RNFS.exists as jest.Mock).mockResolvedValue(true);

      await FileService.init();

      expect(RNFS.exists).toHaveBeenCalledWith(PROJECTS_ROOT);
      expect(RNFS.mkdir).not.toHaveBeenCalled();
    });

    it('should propagate errors with descriptive logging when mkdir fails', async () => {
      (RNFS.exists as jest.Mock).mockResolvedValue(false);
      const fsError = new Error('Disk full');
      (RNFS.mkdir as jest.Mock).mockRejectedValue(fsError);

      await expect(FileService.init()).rejects.toThrow(
        'Failed to initialize projects directory: Disk full'
      );
    });
  });

  describe('readDir', () => {
    it('should return sorted FileNodes (directories first, then alphabetically by name)', async () => {
      const mockItems: any[] = [
        {
          name: 'zebra.js',
          path: '/mock/zebra.js',
          isDirectory: () => false,
          size: 100,
          mtime: new Date('2026-05-22'),
        },
        {
          name: 'apple.js',
          path: '/mock/apple.js',
          isDirectory: () => false,
          size: 200,
          mtime: new Date('2026-05-22'),
        },
        {
          name: 'banana_dir',
          path: '/mock/banana_dir',
          isDirectory: () => true,
          size: 0,
          mtime: new Date('2026-05-22'),
        },
        {
          name: 'avocado_dir',
          path: '/mock/avocado_dir',
          isDirectory: () => true,
          size: 0,
          mtime: new Date('2026-05-22'),
        },
      ];

      (RNFS.readDir as jest.Mock).mockResolvedValue(mockItems);

      const result = await FileService.readDir('/mock');

      expect(result).toHaveLength(4);
      // Sorting order check:
      // Directories first: avocado_dir, banana_dir
      // Then files: apple.js, zebra.js
      expect(result[0].name).toBe('avocado_dir');
      expect(result[0].isDirectory).toBe(true);
      expect(result[1].name).toBe('banana_dir');
      expect(result[1].isDirectory).toBe(true);
      expect(result[2].name).toBe('apple.js');
      expect(result[2].isDirectory).toBe(false);
      expect(result[2].extension).toBe('js');
      expect(result[3].name).toBe('zebra.js');
      expect(result[3].isDirectory).toBe(false);
    });

    it('should handle readDir errors and wrap them in a user-friendly message', async () => {
      (RNFS.readDir as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      await expect(FileService.readDir('/unauthorized')).rejects.toThrow(
        'Failed to read directory at /unauthorized.'
      );
    });
  });

  describe('readFile / writeFile / delete / rename', () => {
    it('should successfully read file content', async () => {
      (RNFS.readFile as jest.Mock).mockResolvedValue('const test = true;');

      const content = await FileService.readFile('/mock/test.js');
      expect(content).toBe('const test = true;');
      expect(RNFS.readFile).toHaveBeenCalledWith('/mock/test.js', 'utf8');
    });

    it('should throw correct error when readFile fails', async () => {
      (RNFS.readFile as jest.Mock).mockRejectedValue(new Error('Read failed'));
      await expect(FileService.readFile('/mock/test.js')).rejects.toThrow(
        'Failed to read file. It might be deleted, unreadable, or missing permissions.'
      );
    });

    it('should write file content successfully', async () => {
      (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);
      await FileService.writeFile('/mock/test.js', 'test');
      expect(RNFS.writeFile).toHaveBeenCalledWith('/mock/test.js', 'test', 'utf8');
    });

    it('should delete items successfully', async () => {
      (RNFS.unlink as jest.Mock).mockResolvedValue(undefined);
      await FileService.deleteFile('/mock/test.js');
      expect(RNFS.unlink).toHaveBeenCalledWith('/mock/test.js');
    });
  });

  describe('getLanguage', () => {
    it('should map standard file extensions to language IDs', () => {
      expect(FileService.getLanguage('main.py')).toBe('python');
      expect(FileService.getLanguage('App.tsx')).toBe('typescript');
      expect(FileService.getLanguage('index.js')).toBe('javascript');
      expect(FileService.getLanguage('Main.java')).toBe('java');
      expect(FileService.getLanguage('style.css')).toBe('css');
      expect(FileService.getLanguage('no-extension')).toBe('plaintext');
      expect(FileService.getLanguage('config.json')).toBe('json');
    });
  });
});
