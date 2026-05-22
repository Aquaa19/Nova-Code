// src/features/packages/services/__tests__/PackageService.test.ts

import { PackageService, CACHE_KEY_PREFIX } from '../PackageService';
import { storage } from '../../../../storage/mmkv';

jest.mock('../../../../storage/mmkv', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

describe('PackageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCachedSearch', () => {
    it('should return cached results if they are not expired', () => {
      const mockResults = [{ id: 'react', name: 'react', version: '19.0.0', description: 'React library' }];
      const cacheValue = JSON.stringify({
        timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
        results: mockResults,
      });

      (storage.getString as jest.Mock).mockReturnValue(cacheValue);

      const result = PackageService.getCachedSearch('npm', 'react');

      expect(storage.getString).toHaveBeenCalledWith(`${CACHE_KEY_PREFIX}npm_react`);
      expect(result).toEqual(mockResults);
    });

    it('should return null and remove key if cache is expired (> 1 hour)', () => {
      const mockResults = [{ id: 'react', name: 'react', version: '19.0.0', description: 'React' }];
      const cacheValue = JSON.stringify({
        timestamp: Date.now() - 1000 * 60 * 61, // 61 mins ago
        results: mockResults,
      });

      (storage.getString as jest.Mock).mockReturnValue(cacheValue);

      const result = PackageService.getCachedSearch('npm', 'react');

      expect(result).toBeNull();
      expect(storage.remove).toHaveBeenCalledWith(`${CACHE_KEY_PREFIX}npm_react`);
    });

    it('should return null if key is not found in storage', () => {
      (storage.getString as jest.Mock).mockReturnValue(undefined);

      const result = PackageService.getCachedSearch('npm', 'nonexistent');

      expect(result).toBeNull();
    });

    it('should return null and log warnings if JSON parsing throws an exception', () => {
      (storage.getString as jest.Mock).mockReturnValue('{invalid: json');

      const result = PackageService.getCachedSearch('npm', 'react');

      expect(result).toBeNull();
    });
  });

  describe('cacheSearch', () => {
    it('should store results in MMKV and add query key to index list', () => {
      (storage.getString as jest.Mock).mockReturnValue(null); // No existing keys

      const mockResults = [{ id: 'lodash', name: 'lodash', version: '4.17.21', description: 'Utility library' }];
      PackageService.cacheSearch('npm', 'lodash', mockResults);

      const expectedNewKey = `${CACHE_KEY_PREFIX}npm_lodash`;
      
      // Verify key was added to index keys
      expect(storage.set).toHaveBeenCalledWith(
        `${CACHE_KEY_PREFIX}npm_keys`,
        JSON.stringify([expectedNewKey])
      );
      
      // Verify payload was cached
      expect(storage.set).toHaveBeenCalledWith(
        expectedNewKey,
        expect.stringContaining('"results":')
      );
    });

    it('should implement LRU eviction by removing the oldest key if limit of 20 searches is reached', () => {
      // Setup 20 existing keys
      const existingKeys: string[] = [];
      for (let i = 1; i <= 20; i++) {
        existingKeys.push(`${CACHE_KEY_PREFIX}npm_query${i}`);
      }

      (storage.getString as jest.Mock).mockReturnValue(JSON.stringify(existingKeys));

      const mockResults = [{ id: 'new-pkg', name: 'new-pkg', version: '1.0.0', description: 'New package' }];
      PackageService.cacheSearch('npm', 'new-query', mockResults);

      // Verify the oldest key (index 0: query1) was evicted
      expect(storage.remove).toHaveBeenCalledWith(`${CACHE_KEY_PREFIX}npm_query1`);

      // Verify new key list contains query2 through query20, plus the new-query key
      const expectedKeys = [...existingKeys.slice(1), `${CACHE_KEY_PREFIX}npm_new-query`];
      expect(storage.set).toHaveBeenCalledWith(
        `${CACHE_KEY_PREFIX}npm_keys`,
        JSON.stringify(expectedKeys)
      );
    });
  });
});
