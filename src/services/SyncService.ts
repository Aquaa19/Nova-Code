// src/services/SyncService.ts

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { storage } from '../storage/mmkv';

class SyncServiceClass {
  // Define which MMKV keys should be backed up to the cloud
  private syncableKeys = [
    'gitAuthorName',
    'gitAuthorEmail',
    'gitPAT',
    'settings', // Your general IDE settings (theme, fontSize, etc.)
  ];

  /**
   * Pushes local MMKV settings to Firestore.
   * Call this when settings are updated or after a successful login.
   */
  async pushSettingsToCloud(): Promise<void> {
    const user = auth().currentUser;
    if (!user) return; // Only sync if logged in

    const payload: Record<string, any> = {};
    
    this.syncableKeys.forEach(key => {
      payload[key] = storage.getString(key) || null;
    });

    payload.updatedAt = firestore.FieldValue.serverTimestamp();

    await firestore()
      .collection('userSettings')
      .doc(user.uid)
      .set(payload, { merge: true });
  }

  /**
   * Pulls settings from Firestore and saves them to local MMKV.
   * Call this right after a successful login on a new device.
   */
  async pullSettingsFromCloud(): Promise<void> {
    const user = auth().currentUser;
    if (!user) throw new Error('Must be logged in to sync.');

    const doc = await firestore().collection('userSettings').doc(user.uid).get();
    
    // Fixed: calling exists() as a method
    if (doc.exists()) {
      const data = doc.data();
      if (data) {
        this.syncableKeys.forEach(key => {
          if (data[key] !== undefined && data[key] !== null) {
            storage.set(key, data[key]);
          }
        });
      }
    }
  }

  /**
   * Listen to Auth state changes to automatically pull settings on login
   */
  initAutoSync() {
    auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await this.pullSettingsFromCloud();
          console.log('Settings synced from Firebase successfully.');
        } catch (e) {
          console.warn('Failed to pull settings from Firebase:', e);
        }
      }
    });
  }
}

export const SyncService = new SyncServiceClass();
