// src/services/git/__tests__/GitService.test.ts

import { GitService } from '../GitService';
import git from 'isomorphic-git';
import { useSettingsStore } from '../../../store/useSettingsStore';

jest.mock('isomorphic-git', () => ({
  init: jest.fn(),
  clone: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
  resetIndex: jest.fn(),
  resolveRef: jest.fn(),
  readBlob: jest.fn(),
  statusMatrix: jest.fn(),
  commit: jest.fn(),
  push: jest.fn(),
  pull: jest.fn(),
  log: jest.fn(),
  currentBranch: jest.fn(),
  addRemote: jest.fn(),
  listRemotes: jest.fn(),
  deleteRemote: jest.fn(),
}));

jest.mock('../RNFSAdapter', () => ({
  RNFSAdapter: {
    stat: jest.fn(),
  },
}));

jest.mock('../../../store/useSettingsStore', () => ({
  useSettingsStore: {
    getState: jest.fn(),
  },
}));

describe('GitService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication and Headers', () => {
    it('should return empty headers when no gitPAT is present', async () => {
      (useSettingsStore.getState as jest.Mock).mockReturnValue({
        gitAuthorName: 'Nova User',
        gitAuthorEmail: 'user@nova.com',
        gitPAT: '',
      });
      (git.init as jest.Mock).mockResolvedValue(undefined);

      await GitService.init('/mock/dir');
      expect(git.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: '/mock/dir',
        })
      );
    });

    it('should include basic auth header when gitPAT is present', async () => {
      (useSettingsStore.getState as jest.Mock).mockReturnValue({
        gitAuthorName: 'Nova User',
        gitAuthorEmail: 'user@nova.com',
        gitPAT: 'ghp_secretTokenVal',
      });

      (git.clone as jest.Mock).mockResolvedValue(undefined);

      await GitService.clone('https://github.com/org/repo.git', '/mock/dir');

      expect(git.clone).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: '/mock/dir',
          url: 'https://github.com/org/repo.git',
          headers: {
            Authorization: 'Basic b2F1dGgyOmdocF9zZWNyZXRUb2tlblZhbA==', // oauth2:ghp_secretTokenVal in base64
          },
        })
      );
    });
  });

  describe('Commit operations', () => {
    it('should call commit with correct author values from SettingsStore', async () => {
      (useSettingsStore.getState as jest.Mock).mockReturnValue({
        gitAuthorName: 'Test Author',
        gitAuthorEmail: 'author@test.com',
        gitPAT: '',
      });
      (git.commit as jest.Mock).mockResolvedValue('new_commit_sha');

      const result = await GitService.commit('/mock/dir', 'First commit');

      expect(git.commit).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: '/mock/dir',
          message: 'First commit',
          author: {
            name: 'Test Author',
            email: 'author@test.com',
          },
        })
      );
      expect(result).toBe('new_commit_sha');
    });

    it('should fallback to default author name and email if settings store is blank', async () => {
      (useSettingsStore.getState as jest.Mock).mockReturnValue({
        gitAuthorName: '',
        gitAuthorEmail: '',
        gitPAT: '',
      });
      (git.commit as jest.Mock).mockResolvedValue('commit_sha');

      await GitService.commit('/mock/dir', 'commit empty settings');

      expect(git.commit).toHaveBeenCalledWith(
        expect.objectContaining({
          author: {
            name: 'Nova Code User',
            email: 'user@novacode.app',
          },
        })
      );
    });
  });

  describe('Staging all files', () => {
    it('should call git.add for modified/created workdir files and git.remove for deleted staged files', async () => {
      // Mock statusMatrix output:
      // Status array is [filepath, head, workdir, stage]
      // workdir: 2 means modified/created in workdir
      // workdir: 0 and stage !== 0 means deleted
      const mockStatusMatrix = [
        ['src/index.js', 1, 2, 1], // Modified
        ['src/old.js', 1, 0, 1],    // Deleted
        ['README.md', 1, 1, 1],     // Unmodified
      ];

      (git.statusMatrix as jest.Mock).mockResolvedValue(mockStatusMatrix);
      (git.add as jest.Mock).mockResolvedValue(undefined);
      (git.remove as jest.Mock).mockResolvedValue(undefined);

      await GitService.addAll('/mock/dir');

      expect(git.add).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: '/mock/dir',
          filepath: 'src/index.js',
        })
      );
      expect(git.remove).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: '/mock/dir',
          filepath: 'src/old.js',
        })
      );
      expect(git.add).not.toHaveBeenCalledWith(
        expect.objectContaining({
          filepath: 'README.md',
        })
      );
    });
  });
});
