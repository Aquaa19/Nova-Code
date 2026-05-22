// jest.setup.js

import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    /* eslint-disable-next-line @typescript-eslint/no-empty-function */
    Directions: {},
  };
});

jest.mock('react-native-fs', () => ({
  ExternalDirectoryPath: '/mock/external/dir',
  exists: jest.fn(),
  mkdir: jest.fn(),
  readDir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
  moveFile: jest.fn(),
  copyFile: jest.fn(),
  stat: jest.fn(),
}));

jest.mock('@react-native-firebase/auth', () => () => ({
  currentUser: { uid: 'user_123' },
  onAuthStateChanged: jest.fn(),
}));

jest.mock('@react-native-firebase/firestore', () => {
  const mCollection = {
    doc: jest.fn().mockReturnThis(),
    set: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
  };
  return () => ({
    collection: jest.fn(() => mCollection),
  });
});

jest.mock('react-native-mmkv', () => {
  return {
    createMMKV: jest.fn(() => ({
      getString: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      getBoolean: jest.fn(),
      setBoolean: jest.fn(),
    })),
  };
});
