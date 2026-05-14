import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

interface ActionCircleButtonProps {
  icon: string;
  tone?: 'neutral' | 'primary' | 'danger' | 'success';
  onPress: () => void;
  style?: ViewStyle;
}

export const ActionCircleButton: React.FC<ActionCircleButtonProps> = ({
  icon,
  tone = 'neutral',
  onPress,
  style,
}) => {
  const getColors = () => {
    switch (tone) {
      case 'primary':
        return { bg: 'rgba(0, 240, 255, 0.1)', icon: theme.colors.primaryFixed };
      case 'danger':
        return { bg: 'rgba(255, 180, 171, 0.1)', icon: theme.colors.error };
      case 'success':
        return { bg: 'rgba(82, 255, 172, 0.1)', icon: theme.colors.tertiaryFixed };
      case 'neutral':
      default:
        return { bg: theme.colors.surfaceContainerHigh, icon: theme.colors.onSurfaceVariant };
    }
  };

  const colors = getColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.bg },
        pressed && styles.pressed,
        style,
      ]}
    >
      <MaterialCommunityIcons name={icon} size={16} color={colors.icon} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
