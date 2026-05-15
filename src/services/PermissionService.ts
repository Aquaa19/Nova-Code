// src/services/PermissionService.ts

import { PermissionsAndroid, Platform, Alert } from 'react-native';

class PermissionServiceClass {
  async requestStoragePermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    const apiLevel = Platform.Version as number;

    if (apiLevel >= 33) {
      // Android 13+ — app-specific directories don't need permission
      // ExternalDirectoryPath is app-scoped, no permission needed
      return true;
    }

    if (apiLevel >= 30) {
      // Android 11–12 — need MANAGE_EXTERNAL_STORAGE for full access
      // For app-scoped storage, no permission needed
      return true;
    }

    // Android 10 and below
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);

    const allGranted = Object.values(granted).every(
      status => status === PermissionsAndroid.RESULTS.GRANTED
    );

    if (!allGranted) {
      Alert.alert(
        'Storage Permission Required',
        'Nova Code needs storage access to manage your project files.',
        [{ text: 'OK' }]
      );
    }

    return allGranted;
  }
}

export const PermissionService = new PermissionServiceClass();