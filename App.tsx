// App.tsx

import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation';
import { FileService } from './src/services/FileService';
import { PermissionService } from './src/services/PermissionService';
import { SyncService } from './src/services/SyncService';

export default function App() {
  useEffect(() => {
    async function init() {
      await PermissionService.requestStoragePermissions();
      await FileService.init();
      SyncService.initAutoSync();
    }
    init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
    </GestureHandlerRootView>
  );
}