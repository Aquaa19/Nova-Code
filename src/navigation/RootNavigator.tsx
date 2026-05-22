import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { FileExplorerScreen } from '../screens/FileExplorerScreen';
import { PackageManagerScreen } from '../screens/PackageManagerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TerminalScreen } from '../screens/TerminalScreen';
import { PreviewScreen } from '../screens/PreviewScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { EditorStack } from './EditorStack';
import { BottomTabBar } from '../components/navigation/BottomTabBar';
import { RootStackParamList } from './types';
import { SyncService } from '../services/SyncService';
import { AppText } from '../components/typography/AppText';
import { theme } from '../theme';
import { VersionCheckService } from '../services/VersionCheckService';

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
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((userState) => {
      setUser(userState);
      if (initializing) setInitializing(false);

      if (userState) {
        VersionCheckService.checkCompatibility().then((status) => {
          if (!status.compatible) {
            Alert.alert(
              'Engine Incompatible',
              `Warning: The compiler engine version (${status.engineVersion}) is incompatible with your Nova Code app version (${status.clientVersion}). Some features may not work as expected.`
            );
          }
        });
      }
    });

    const netSubscriber = SyncService.subscribeOnlineStatus((status) => {
      setOnline(status);
    });

    return () => {
      subscriber();
      netSubscriber();
    };
  }, [initializing]);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primaryFixed} />
        <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant} style={{ marginTop: 16 }}>
          Syncing workspace...
        </AppText>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <Stack.Screen name="Main" component={MainTabs} />
          )}
        </Stack.Navigator>

        {!online && (
          <View style={styles.offlineBanner}>
            <MaterialCommunityIcons name="cloud-off-outline" size={14} color="#FF9800" />
            <AppText variant="labelXs" style={styles.offlineText}>
              Offline Mode — local changes will sync when reconnected
            </AppText>
          </View>
        )}
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#11131c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  offlineText: {
    color: '#FF9800',
    fontWeight: '500',
  },
});