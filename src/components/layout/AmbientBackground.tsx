import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface AmbientBackgroundProps {
  variant?: 'editor' | 'search' | 'terminal' | 'default';
  style?: ViewStyle;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  variant = 'default',
  style,
}) => {
  // For the static project, we use absolute views with colors instead of complex SVG gradients to simulate ambient backgrounds.
  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <View style={[styles.baseBackground, getVariantStyle(variant)]} />
    </View>
  );
};

const getVariantStyle = (variant: string): ViewStyle => {
  switch (variant) {
    case 'editor':
      return { backgroundColor: 'rgba(0, 240, 255, 0.02)' };
    case 'search':
      return { backgroundColor: 'rgba(236, 178, 255, 0.02)' };
    case 'terminal':
      return { backgroundColor: 'rgba(0, 0, 0, 0.3)' };
    case 'default':
    default:
      return { backgroundColor: theme.colors.background };
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    backgroundColor: theme.colors.background,
  },
  baseBackground: {
    flex: 1,
  },
});
