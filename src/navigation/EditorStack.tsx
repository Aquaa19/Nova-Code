// src/navigation/EditorStack.tsx

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CodeEditorScreen } from '../screens/CodeEditorScreen';
import { EditorStackParamList } from './types';

const Stack = createStackNavigator<EditorStackParamList>();

export function EditorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EditorHome" component={CodeEditorScreen} />
      <Stack.Screen name="OpenFile" component={CodeEditorScreen} />
    </Stack.Navigator>
  );
}