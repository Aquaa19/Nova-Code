// src/navigation/RootNavigator.tsx

import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

import { FileExplorerScreen } from '../screens/FileExplorerScreen';
import { PackageManagerScreen } from '../screens/PackageManagerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TerminalScreen } from '../screens/TerminalScreen';
import { PreviewScreen } from '../screens/PreviewScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { EditorStack } from './EditorStack';
import { BottomTabBar } from '../components/navigation/BottomTabBar';
import { RootStackParamList } from './types';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const getIconForRoute = (routeName: string): string => {
  switch (routeName) {
    case 'Files': return 'folder-outline';
    case 'Editor': return 'code-braces';
    case 'Preview': return 'web';
    case 'Terminal': return 'console';
    case 'Packages': return 'package-variant';
    case 'Settings': return 'account-outline';
    default: return 'circle-outline';
  }
};

function MainTabs() {
  return (
    <Tab.Navigator 
      tabBar={(props) => {
        const { state, navigation } = props;
        const items = state.routes.map(route => ({
          id: route.name,
          label: route.name,
          icon: getIconForRoute(route.name),
        }));
        const activeId = state.routes[state.index].name;
        const handleTabPress = (id: string) => {
          navigation.navigate(id);
        };
        return (
          <BottomTabBar 
            items={items} 
            activeId={activeId} 
            onTabPress={handleTabPress} 
          />
        );
      }}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Files" component={FileExplorerScreen} />
      <Tab.Screen name="Editor" component={EditorStack} />
      <Tab.Screen name="Preview" component={PreviewScreen} />
      <Tab.Screen name="Terminal" component={TerminalScreen} />
      <Tab.Screen name="Packages" component={PackageManagerScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((userState) => {
      setUser(userState);
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}