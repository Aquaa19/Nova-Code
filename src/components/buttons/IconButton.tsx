import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

interface IconButtonProps {
  icon: string;
  variant?: 'ghost' | 'glass';
  size?: number;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 24,
  active = false,
  disabled = false,
  onPress,
  accessibilityLabel,
  style,
}) => {
  const isGlass = variant === 'glass';
  const color = active ? theme.colors.primaryFixed : theme.colors.onSurfaceVariant;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.container,
        isGlass && styles.glass,
        active && isGlass && styles.activeGlass,
        disabled && styles.disabled,
        pressed && styles.pressed,
        { width: size + 16, height: size + 16 },
        style,
      ]}
    >
      <MaterialCommunityIcons name={icon} size={size} color={color} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeGlass: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
});
