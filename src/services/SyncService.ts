// src/services/SyncService.ts

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
import { storage } from '../storage/mmkv';
import { useSettingsStore, Settings } from '../store/useSettingsStore';

// Keys that are safe to sync (excluding sensitive gitPAT and engineAuthToken)
const SYNCABLE_KEYS: (keyof Settings)[] = [
  'theme',
  'fontSize',
  'tabWidth',
  'autosaveEnabled',
  'autosaveDelayMs',
  'wordWrap',
  'minimap',
  'lineNumbers',
  'gitAuthorName',
  'gitAuthorEmail',
  'engineUrl',
];

class SyncServiceClass {
  private isOnline = true;
  private isSyncing = false;
  private debounceTimeout: any = null;
  private syncListenerUnsubscribe: (() => void) | null = null;
  private connectionCheckInterval: any = null;

  constructor() {
    // Start connection check loop (every 15 seconds)
    this.connectionCheckInterval = setInterval(() => this.checkConnection(), 15000);
    this.checkConnection();
  }

  /**
   * Performs a lightweight check to determine real internet connectivity.
   */
  async checkConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const response = await fetch('https://clients3.google.com/generate_204', {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      clearTimeout(timeoutId);
      
      const online = response.status === 204 || response.ok;
      this.setOnlineStatus(online);
      return online;
    } catch {
      this.setOnlineStatus(false);
      return false;
    }
  }

  private onlineListeners = new Set<(online: boolean) => void>();

  private setOnlineStatus(online: boolean) {
    if (this.isOnline !== online) {
      this.isOnline = online;
      console.log(`Nova Sync: Network status changed to ${online ? 'ONLINE' : 'OFFLINE'}`);
      this.onlineListeners.forEach(cb => cb(online));
      if (online) {
        // Flush queue on reconnection
        this.flushOfflineQueue();
      }
    }
  }

  getOnline(): boolean {
    return this.isOnline;
  }

  subscribeOnlineStatus(cb: (online: boolean) => void) {
    this.onlineListeners.add(cb);
    cb(this.isOnline);
    return () => {
      this.onlineListeners.delete(cb);
    };
  }

  /**
   * Schedule settings sync to cloud with a 5-second debounce.
   */
  schedulePush() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.debounceTimeout = setTimeout(() => {
      this.pushSettingsToCloud();
    }, 5000);
  }

  /**
   * Pushes current local settings to Firestore (or queues them if offline).
   */
  async pushSettingsToCloud(): Promise<void> {
    const user = auth().currentUser;
    if (!user) return;

    const settings = useSettingsStore.getState();
    const payload: Record<string, any> = {};
    
    SYNCABLE_KEYS.forEach(key => {
      payload[key] = settings[key];
    });
    
    // Use store's tracking timestamp
    payload.lastUpdatedAt = settings.lastUpdatedAt || Date.now();

    if (!this.isOnline) {
      // Save to offline queue
      storage.set('sync_offline_queue', JSON.stringify(payload));
      console.log('Nova Sync: Offline. Saved settings to queue.');
      return;
    }

    try {
      this.isSyncing = true;
      await firestore()
        .collection('userSettings')
        .doc(user.uid)
        .set(payload, { merge: true });
      
      // Clear offline queue upon successful write
      storage.remove('sync_offline_queue');
      console.log('Nova Sync: Pushed settings to cloud successfully.');
    } catch (error) {
      console.warn('Nova Sync: Failed to push settings to cloud, queueing...', error);
      storage.set('sync_offline_queue', JSON.stringify(payload));
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Flushes any pending settings stored in the offline queue to the cloud.
   */
  private async flushOfflineQueue(): Promise<void> {
    const queuedData = storage.getString('sync_offline_queue');
    if (!queuedData || !auth().currentUser) return;

    try {
      const payload = JSON.parse(queuedData);
      console.log('Nova Sync: Flushing offline settings queue to cloud...');
      
      await firestore()
        .collection('userSettings')
        .doc(auth().currentUser!.uid)
        .set(payload, { merge: true });

      storage.remove('sync_offline_queue');
      console.log('Nova Sync: Offline queue flushed successfully.');
    } catch (e) {
      console.warn('Nova Sync: Failed to flush offline queue:', e);
    }
  }

  /**
   * Pulls settings from Firestore. Resolves conflicts or merges values.
   * @param isInitialLogin Set to true on first sign-in to bypass conflict prompts.
   */
  async pullSettingsFromCloud(isInitialLogin = false): Promise<void> {
    const user = auth().currentUser;
    if (!user) return;

    if (!this.isOnline) {
      console.log('Nova Sync: Offline. Skipping cloud pull.');
      return;
    }

    try {
      const doc = await firestore().collection('userSettings').doc(user.uid).get();
      if (!doc.exists) {
        // No settings on cloud yet, upload local ones
        await this.pushSettingsToCloud();
        return;
      }

      const cloudData = doc.data();
      if (!cloudData) return;

      const localSettings = useSettingsStore.getState();
      const cloudTimestamp = cloudData.lastUpdatedAt || 0;
      const localTimestamp = localSettings.lastUpdatedAt || 0;

      // Map cloud payload to typed settings
      const mappedCloudSettings: Partial<Settings> = {};
      SYNCABLE_KEYS.forEach(key => {
        if (cloudData[key] !== undefined && cloudData[key] !== null) {
          mappedCloudSettings[key] = cloudData[key];
        }
      });
      mappedCloudSettings.lastUpdatedAt = cloudTimestamp;

      if (isInitialLogin) {
        // On login, cloud wins automatically
        useSettingsStore.getState().update(mappedCloudSettings);
        console.log('Nova Sync: Restored cloud settings on login.');
        return;
      }

      // Conflict detection: Cloud is newer than local
      if (cloudTimestamp > localTimestamp) {
        Alert.alert(
          'Settings Conflict',
          'Settings were updated on another device. Would you like to load the cloud settings or keep your local configuration?',
          [
            {
              text: 'Keep Local',
              style: 'cancel',
              onPress: () => {
                // local wins, overwrite cloud with current local settings
                this.pushSettingsToCloud();
              }
            },
            {
              text: 'Use Cloud',
              onPress: () => {
                // cloud wins, apply cloud settings locally
                useSettingsStore.getState().update(mappedCloudSettings);
                console.log('Nova Sync: Applied cloud settings.');
              }
            }
          ]
        );
      } else if (localTimestamp > cloudTimestamp) {
        // Local is newer, push local settings to cloud
        await this.pushSettingsToCloud();
      }
    } catch (e) {
      console.warn('Nova Sync: Failed to pull settings:', e);
    }
  }

  /**
   * Initializes store listeners and auto sync hooks.
   */
  initAutoSync() {
    // 1. Subscribe to auth state changes to pull/push configuration
    auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User logged in — pull cloud settings (cloud wins on conflict)
        await this.checkConnection();
        await this.pullSettingsFromCloud(true);

        // 2. Start subscribing to Zustand store changes for auto-syncing
        if (this.syncListenerUnsubscribe) {
          this.syncListenerUnsubscribe();
        }

        let previousState = { ...useSettingsStore.getState() };
        this.syncListenerUnsubscribe = useSettingsStore.subscribe((state) => {
          // Check if any syncable key changed to avoid infinite loops and extra writes
          const hasChanged = SYNCABLE_KEYS.some(key => state[key] !== previousState[key]);
          if (hasChanged) {
            previousState = { ...state };
            this.schedulePush();
          }
        });
      } else {
        // User logged out — stop sync listener
        if (this.syncListenerUnsubscribe) {
          this.syncListenerUnsubscribe();
          this.syncListenerUnsubscribe = null;
        }
      }
    });
  }

  /**
   * Cleanup resource loop.
   */
  destroy() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
    if (this.syncListenerUnsubscribe) {
      this.syncListenerUnsubscribe();
    }
  }
}

export const SyncService = new SyncServiceClass();
