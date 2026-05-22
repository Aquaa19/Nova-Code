// src/features/search/services/__tests__/SearchService.test.ts

import { SearchService } from '../SearchService';
import { FileService } from '../../../../services/FileService';

jest.mock('../../../../services/FileService', () => ({
  FileService: {
    readDir: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe('SearchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('indexProject and searchFilenames', () => {
    it('should recursively scan paths and exclude node_modules and hidden folders', async () => {
      // Mock FileService.readDir layout:
      // /project:
      //   - src (dir)
      //   - .git (dir - should exclude)
      //   - node_modules (dir - should exclude)
      //   - package.json (file)
      // /project/src:
      //   - index.ts (file)
      
      (FileService.readDir as jest.Mock).mockImplementation((path: string) => {
        if (path === '/project') {
          return Promise.resolve([
            { name: 'src', path: '/project/src', isDirectory: true },
            { name: '.git', path: '/project/.git', isDirectory: true },
            { name: 'node_modules', path: '/project/node_modules', isDirectory: true },
            { name: 'package.json', path: '/project/package.json', isDirectory: false },
          ]);
        }
        if (path === '/project/src') {
          return Promise.resolve([
            { name: 'index.ts', path: '/project/src/index.ts', isDirectory: false },
          ]);
        }
        return Promise.resolve([]);
      });

      await SearchService.indexProject('/project');

      expect(FileService.readDir).toHaveBeenCalledWith('/project');
      expect(FileService.readDir).toHaveBeenCalledWith('/project/src');
      expect(FileService.readDir).not.toHaveBeenCalledWith('/project/.git');
      expect(FileService.readDir).not.toHaveBeenCalledWith('/project/node_modules');

      // Test fuzzy filename search
      const matches = SearchService.searchFilenames('index');
      expect(matches).toHaveLength(1);
      expect(matches[0].fileName).toBe('index.ts');
      expect(matches[0].filePath).toBe('/project/src/index.ts');
      expect(matches[0].type).toBe('filename');
    });

    it('should return empty filename array if query is empty or service is not indexed yet', () => {
      const matches = SearchService.searchFilenames('');
      expect(matches).toEqual([]);
    });
  });

  describe('searchContent', () => {
    it('should scan index, batch requests, escape regex special characters, and trigger onMatch / onComplete', async () => {
      // Mock indexed files list from previous test run
      (FileService.readFile as jest.Mock).mockImplementation((path: string) => {
        if (path === '/project/package.json') {
          return Promise.resolve('{\n  "name": "nova-code",\n  "version": "1.0.0"\n}');
        }
        if (path === '/project/src/index.ts') {
          return Promise.resolve('import React from "react";\nconsole.log("nova app");');
        }
        return Promise.resolve('');
      });

      const matches: any[] = [];
      const onMatch = jest.fn((m) => matches.push(m));
      const onComplete = jest.fn();

      // Search for the word "nova"
      const searchPromise = SearchService.searchContent('nova', onMatch, onComplete);

      // Fast-forward setTimeouts in batch processing yield loops
      jest.runAllTimers();

      await searchPromise;

      expect(onComplete).toHaveBeenCalled();
      expect(onMatch).toHaveBeenCalledTimes(2);

      // Find package.json match in results (order-independent)
      const packageJsonMatch = matches.find(m => m.fileName === 'package.json');
      expect(packageJsonMatch).toEqual(
        expect.objectContaining({
          filePath: '/project/package.json',
          lineNumber: 2,
          lineContent: '"name": "nova-code",',
          type: 'content',
        })
      );

      // Find index.ts match in results (order-independent)
      const indexTsMatch = matches.find(m => m.fileName === 'index.ts');
      expect(indexTsMatch).toEqual(
        expect.objectContaining({
          filePath: '/project/src/index.ts',
          lineNumber: 2,
          lineContent: 'console.log("nova app");',
          type: 'content',
        })
      );
    });

    it('should escape special regex characters safely', async () => {
      (FileService.readFile as jest.Mock).mockResolvedValue('const test = val ?? "default";');

      const onMatch = jest.fn();
      const onComplete = jest.fn();

      // Search for "??" which contains special regex characters
      const searchPromise = SearchService.searchContent('??', onMatch, onComplete);
      jest.runAllTimers();
      await searchPromise;

      expect(onMatch).toHaveBeenCalledWith(
        expect.objectContaining({
          lineContent: 'const test = val ?? "default";',
        })
      );
    });

    it('should terminate and trigger onComplete immediately if query is empty', async () => {
      const onMatch = jest.fn();
      const onComplete = jest.fn();

      await SearchService.searchContent('', onMatch, onComplete);

      expect(onMatch).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
