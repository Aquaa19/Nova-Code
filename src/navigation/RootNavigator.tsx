// src/navigation/RootNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import { FileExplorerScreen } from '../screens/FileExplorerScreen';
import { TerminalScreen } from '../screens/TerminalScreen';
import { GlobalSearchScreen } from '../screens/GlobalSearchScreen';
import { PackageManagerScreen } from '../screens/PackageManagerScreen';
import { EditorStack } from './EditorStack';
import { BottomTabBar } from '../components/navigation/BottomTabBar';

const Tab = createBottomTabNavigator();

const getIconForRoute = (routeName: string): string => {
  switch (routeName) {
    case 'Files': return 'folder-outline';
    case 'Editor': return 'code-braces';
    case 'Terminal': return 'console';
    case 'Search': return 'magnify';
    case 'Packages': return 'package-variant';
    default: return 'circle-outline';
  }
};

export function RootNavigator() {
  return (
    <NavigationContainer>
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
        <Tab.Screen name="Terminal" component={TerminalScreen} />
        <Tab.Screen name="Search" component={GlobalSearchScreen} />
        <Tab.Screen name="Packages" component={PackageManagerScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}