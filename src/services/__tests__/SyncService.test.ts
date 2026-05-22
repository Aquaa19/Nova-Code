// src/services/__tests__/SyncService.test.ts

import { SyncService } from '../SyncService';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
import { storage } from '../../storage/mmkv';
import { useSettingsStore } from '../../store/useSettingsStore';

jest.mock('@react-native-firebase/auth', () => {
  const mAuth = {
    currentUser: { uid: 'user_123' },
    onAuthStateChanged: jest.fn(),
  };
  return jest.fn(() => mAuth);
});

jest.mock('@react-native-firebase/firestore', () => {
  const mCollection = {
    doc: jest.fn().mockReturnThis(),
    set: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
  };
  const mFirestore = () => ({
    collection: jest.fn(() => mCollection),
  });
  return mFirestore;
});

jest.mock('../../storage/mmkv', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock('../../store/useSettingsStore', () => {
  const mockState = {
    theme: 'dark',
    fontSize: 14,
    lastUpdatedAt: 1000,
    update: jest.fn(),
  };
  return {
    useSettingsStore: {
      getState: jest.fn(() => mockState),
      subscribe: jest.fn(),
    },
  };
});

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe('SyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn() as any;
  });

  describe('checkConnection', () => {
    it('should set online status to true when client gets 204 response', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValue({
        status: 204,
        ok: true,
      });

      const online = await SyncService.checkConnection();
      expect(online).toBe(true);
      expect(SyncService.getOnline()).toBe(true);
    });

    it('should set online status to false when fetch rejects', async () => {
      (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('DNS Failure'));

      const online = await SyncService.checkConnection();
      expect(online).toBe(false);
      expect(SyncService.getOnline()).toBe(false);
    });
  });

  describe('pushSettingsToCloud', () => {
    it('should push local settings to Firestore when online', async () => {
      // Force connection state to online
      (globalThis.fetch as jest.Mock).mockResolvedValue({ status: 204, ok: true });
      await SyncService.checkConnection();

      const docMock = firestore().collection('userSettings').doc('user_123');

      await SyncService.pushSettingsToCloud();

      expect(docMock.set).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'dark',
          fontSize: 14,
          lastUpdatedAt: 1000,
        }),
        { merge: true }
      );
      expect(storage.remove).toHaveBeenCalledWith('sync_offline_queue');
    });

    it('should cache settings locally in offline queue when offline', async () => {
      // Force connection state to offline
      (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('Offline'));
      await SyncService.checkConnection();

      await SyncService.pushSettingsToCloud();

      expect(storage.set).toHaveBeenCalledWith(
        'sync_offline_queue',
        expect.stringContaining('"theme":"dark"')
      );
      expect(firestore().collection('userSettings').doc().set).not.toHaveBeenCalled();
    });
  });

  describe('pullSettingsFromCloud and Conflicts', () => {
    it('should prompt conflict alert when cloud changes are newer than local settings', async () => {
      // Online state
      (globalThis.fetch as jest.Mock).mockResolvedValue({ status: 204, ok: true });
      await SyncService.checkConnection();

      // Cloud timestamp is 2000, local timestamp is 1000
      const mockDocGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          theme: 'light',
          fontSize: 16,
          lastUpdatedAt: 2000,
        }),
      });
      (firestore().collection('userSettings').doc().get as jest.Mock) = mockDocGet;

      await SyncService.pullSettingsFromCloud(false);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Settings Conflict',
        expect.any(String),
        expect.any(Array)
      );
    });

    it('should overwrite cloud with local settings if local is newer than cloud', async () => {
      // Online state
      (globalThis.fetch as jest.Mock).mockResolvedValue({ status: 204, ok: true });
      await SyncService.checkConnection();

      // Cloud timestamp is 500 (older), local timestamp is 1000 (newer)
      const mockDocGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          theme: 'light',
          fontSize: 16,
          lastUpdatedAt: 500,
        }),
      });
      (firestore().collection('userSettings').doc().get as jest.Mock) = mockDocGet;

      const docSet = firestore().collection('userSettings').doc();

      await SyncService.pullSettingsFromCloud(false);

      // Should automatically push newer local settings to cloud
      expect(docSet.set).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'dark',
          lastUpdatedAt: 1000,
        }),
        { merge: true }
      );
    });
  });
});
