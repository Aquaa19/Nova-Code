// src/features/terminal/services/__tests__/PistonService.test.ts

import { PistonService } from '../PistonService';
import { FileService } from '../../../../services/FileService';

jest.mock('../../../../services/FileService', () => ({
  FileService: {
    readDir: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe('PistonService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn() as any;
  });

  describe('executeProject', () => {
    it('should bundle files (sorting main/index to the top), construct correct payload, and return response', async () => {
      // Setup file structure inside mocked FileService:
      // /workspace:
      //   - src (dir)
      //   - package.json (file)
      // /workspace/src:
      //   - index.js (file)
      //   - helper.js (file)
      
      (FileService.readDir as jest.Mock).mockImplementation((path: string) => {
        if (path === '/workspace') {
          return Promise.resolve([
            { name: 'src', path: '/workspace/src', isDirectory: true },
            { name: 'package.json', path: '/workspace/package.json', isDirectory: false },
          ]);
        }
        if (path === '/workspace/src') {
          return Promise.resolve([
            { name: 'helper.js', path: '/workspace/src/helper.js', isDirectory: false },
            { name: 'index.js', path: '/workspace/src/index.js', isDirectory: false },
          ]);
        }
        return Promise.resolve([]);
      });

      (FileService.readFile as jest.Mock).mockImplementation((path: string) => {
        if (path === '/workspace/package.json') return Promise.resolve('{"name":"test"}');
        if (path === '/workspace/src/helper.js') return Promise.resolve('export const a = 1;');
        if (path === '/workspace/src/index.js') return Promise.resolve('console.log("hello");');
        return Promise.resolve('');
      });

      const mockApiResponse = {
        run: {
          stdout: 'hello\n',
          stderr: '',
          output: 'hello\n',
          code: 0,
          signal: null,
        },
      };

      (globalThis.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const result = await PistonService.executeProject('/workspace', 'javascript', 'my-stdin-input');

      // Verify files bundling:
      // 1. Files from subdirectories should use relative paths (e.g. "src/index.js")
      // 2. index.js should be sorted to the front of the list
      // 3. Ignored directories (like .git, node_modules) should not be traversed.
      expect(FileService.readDir).toHaveBeenCalledWith('/workspace');
      expect(FileService.readDir).toHaveBeenCalledWith('/workspace/src');

      // Verify the POST payload structure
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://emkc.org/api/v2/piston/execute',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        })
      );

      const sentPayload = JSON.parse((globalThis.fetch as jest.Mock).mock.calls[0][1].body);
      expect(sentPayload.language).toBe('javascript');
      expect(sentPayload.version).toBe('*');
      expect(sentPayload.stdin).toBe('my-stdin-input');
      expect(sentPayload.files).toHaveLength(3);

      // index.js contains 'index', so it must be sorted to index 0!
      expect(sentPayload.files[0].name).toBe('src/index.js');
      expect(sentPayload.files[0].content).toBe('console.log("hello");');

      expect(result).toEqual(mockApiResponse);
    });

    it('should fall back to bash runtime if an unsupported language is provided', async () => {
      (FileService.readDir as jest.Mock).mockResolvedValue([]);
      (globalThis.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ run: { output: 'fallback' } }),
      });

      await PistonService.executeProject('/workspace', 'unsupported-lang');

      const sentPayload = JSON.parse((globalThis.fetch as jest.Mock).mock.calls[0][1].body);
      expect(sentPayload.language).toBe('bash');
    });

    it('should return error response message when fetch API fails', async () => {
      (FileService.readDir as jest.Mock).mockResolvedValue([]);
      (globalThis.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await PistonService.executeProject('/workspace', 'javascript');

      expect(result.run.code).toBe(1);
      expect(result.message).toContain('Execution Engine Error: 500');
    });

    it('should return error message when a network error occurs', async () => {
      (FileService.readDir as jest.Mock).mockResolvedValue([]);
      (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));

      const result = await PistonService.executeProject('/workspace', 'javascript');

      expect(result.run.code).toBe(1);
      expect(result.message).toBe('Network failure');
    });
  });
});
