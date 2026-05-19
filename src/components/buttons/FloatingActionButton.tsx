import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

interface FloatingActionButtonProps {
  icon: string;
  position?: 'bottom-right' | 'bottom-center' | 'none';
  color?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?:any;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  position = 'bottom-right',
  color = theme.colors.primaryFixed,
  onPress,
  disabled = false,
  loading = false,
  style,
}) => {
  const positionStyles = 
    position === 'bottom-right' ? styles.bottomRight : 
    position === 'bottom-center' ? styles.bottomCenter : {};

  return (
    <Pressable
      onPress={(loading || disabled) ? undefined : onPress}
      style={({ pressed }) => [
        styles.container,
        positionStyles,
        position === 'none' && { position: 'relative', bottom: 0, right: 0 },
        { backgroundColor: color, shadowColor: color },
        theme.shadows.fabGlow,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.background} />
      ) : (
        <MaterialCommunityIcons name={icon} size={24} color={theme.colors.background} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRight: {
    bottom: theme.spacing.gutter + theme.spacing.bottomTabHeight,
    right: theme.spacing.gutter,
  },
  bottomCenter: {
    bottom: theme.spacing.gutter + theme.spacing.bottomTabHeight,
    alignSelf: 'center',
  },
  pressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.4,
  },
});
