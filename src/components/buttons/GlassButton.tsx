import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../typography/AppText';
import { theme } from '../../theme';

interface GlassButtonProps {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onPress: () => void;
  style?: ViewStyle;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  label,
  icon,
  variant = 'secondary',
  size = 'md',
  onPress,
  style,
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: 'rgba(0, 240, 255, 0.15)',
          border: 'rgba(0, 240, 255, 0.4)',
          text: theme.colors.primaryFixed,
        };
      case 'danger':
        return {
          bg: 'rgba(255, 180, 171, 0.1)',
          border: 'rgba(255, 180, 171, 0.3)',
          text: theme.colors.error,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: theme.colors.onSurfaceVariant,
        };
      case 'secondary':
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          text: theme.colors.onSurface,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 6, paddingHorizontal: 12, textSize: 'labelXs' as const, iconSize: 16 };
      case 'lg': return { paddingVertical: 12, paddingHorizontal: 24, textSize: 'bodyMd' as const, iconSize: 20 };
      case 'md':
      default: return { paddingVertical: 8, paddingHorizontal: 16, textSize: 'codeSm' as const, iconSize: 18 };
    }
  };

  const vStyles = getStyles();
  const sStyles = getSizeStyles();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: vStyles.bg, borderColor: vStyles.border },
        { paddingVertical: sStyles.paddingVertical, paddingHorizontal: sStyles.paddingHorizontal },
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={sStyles.iconSize}
          color={vStyles.text}
          style={styles.icon}
        />
      )}
      <AppText variant={sStyles.textSize} color={vStyles.text}>
        {label}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: theme.radius.sm,
  },
  icon: {
    marginRight: 8,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
