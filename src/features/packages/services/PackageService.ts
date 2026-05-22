// src/features/packages/services/PackageService.ts

import { storage } from '../../../storage/mmkv';
import { PackageData } from '../components/PackageCard';

export const CACHE_KEY_PREFIX = 'pkg_search_';

class PackageServiceClass {
  getCachedSearch(ecosystem: string, query: string): PackageData[] | null {
    try {
      const key = `${CACHE_KEY_PREFIX}${ecosystem}_${query}`;
      const raw = storage.getString(key);
      if (!raw) return null;
      
      const { timestamp, results } = JSON.parse(raw);
      if (Date.now() - timestamp < 3600000) { // 1 hour expiration
        return results;
      }
      
      // Expired
      storage.remove(key);
      return null;
    } catch (e) {
      console.warn('PackageService: Failed to parse cached search', e);
      return null;
    }
  }

  cacheSearch(ecosystem: string, query: string, results: PackageData[]): void {
    try {
      const searchKeysRaw = storage.getString(`${CACHE_KEY_PREFIX}${ecosystem}_keys`);
      let keys: string[] = searchKeysRaw ? JSON.parse(searchKeysRaw) : [];
      
      const newKey = `${CACHE_KEY_PREFIX}${ecosystem}_${query}`;
      if (!keys.includes(newKey)) {
        keys.push(newKey);
      }
      
      // Evict oldest if limit of 20 searches is reached
      if (keys.length > 20) {
        const oldestKey = keys.shift();
        if (oldestKey) {
          storage.remove(oldestKey);
        }
      }
      
      storage.set(`${CACHE_KEY_PREFIX}${ecosystem}_keys`, JSON.stringify(keys));
      storage.set(newKey, JSON.stringify({ timestamp: Date.now(), results }));
    } catch (e) {
      console.warn('PackageService: Failed to cache search in MMKV:', e);
    }
  }
}

export const PackageService = new PackageServiceClass();
