// src/services/__tests__/VersionCheckService.test.ts

import { VersionCheckService } from '../VersionCheckService';
import { useSettingsStore } from '../../store/useSettingsStore';

// Mock useSettingsStore
jest.mock('../../store/useSettingsStore', () => ({
  useSettingsStore: {
    getState: jest.fn(() => ({
      engineUrl: 'ws://192.168.1.100:3000',
    })),
  },
}));

describe('VersionCheckService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn() as any;
  });

  it('should return compatible true when version matches compatible range', async () => {
    const mockHeaders = new Map();
    mockHeaders.set('x-nova-engine-version', '1.2.5');

    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: {
        get: (key: string) => mockHeaders.get(key),
      },
      json: jest.fn().mockResolvedValue({ version: '1.2.5' }),
    });

    const result = await VersionCheckService.checkCompatibility();

    expect(result.compatible).toBe(true);
    expect(result.engineVersion).toBe('1.2.5');
    expect(result.clientVersion).toBe('1.2.0');
  });

  it('should return compatible false when major or minor version mismatch', async () => {
    const mockHeaders = new Map();
    mockHeaders.set('x-nova-engine-version', '1.3.0');

    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: {
        get: (key: string) => mockHeaders.get(key),
      },
      json: jest.fn().mockResolvedValue({ version: '1.3.0' }),
    });

    const result = await VersionCheckService.checkCompatibility();

    expect(result.compatible).toBe(false);
    expect(result.engineVersion).toBe('1.3.0');
  });

  it('should fallback gracefully to compatible true when fetch throws an error', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await VersionCheckService.checkCompatibility();

    expect(result.compatible).toBe(true);
    expect(result.engineVersion).toBe('unreachable');
    expect(result.error).toBe('Network error');
  });
});
