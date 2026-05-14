import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface SafeAreaWrapperProps {
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  children: React.ReactNode;
  style?: ViewStyle;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  edges = ['top', 'bottom', 'left', 'right'],
  children,
  style,
}) => {
  // Simple static fallback until react-native-safe-area-context is integrated
  const paddingTop = edges.includes('top') ? 44 : 0;
  const paddingBottom = edges.includes('bottom') ? 34 : 0;

  return (
    <View style={[styles.container, { paddingTop, paddingBottom }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
