// src/storage/mmkv.ts

import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
  id: 'nova-code-storage',
});