import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from '../typography/AppText';
import { theme } from '../../theme';

interface StatusBadgeProps {
  label: string;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, tone = 'neutral', style }) => {
  let backgroundColor: string = theme.colors.surfaceContainerHighest;
  let color: string = theme.colors.onSurfaceVariant;
  let borderColor: string = 'transparent';

  switch (tone) {
    case 'primary':
      backgroundColor = 'rgba(0, 240, 255, 0.1)';
      color = theme.colors.primaryFixed;
      borderColor = 'rgba(0, 240, 255, 0.3)';
      break;
    case 'success':
      backgroundColor = 'rgba(82, 255, 172, 0.1)';
      color = theme.colors.tertiaryFixed;
      borderColor = 'rgba(82, 255, 172, 0.3)';
      break;
    case 'warning':
      backgroundColor = 'rgba(255, 213, 107, 0.1)';
      color = '#ffd56b';
      borderColor = 'rgba(255, 213, 107, 0.3)';
      break;
    case 'danger':
      backgroundColor = 'rgba(255, 180, 171, 0.1)';
      color = theme.colors.error;
      borderColor = 'rgba(255, 180, 171, 0.3)';
      break;
    case 'neutral':
    default:
      backgroundColor = 'rgba(255, 255, 255, 0.05)';
      color = theme.colors.onSurfaceVariant;
      borderColor = 'rgba(255, 255, 255, 0.1)';
      break;
  }

  return (
    <View style={[styles.container, { backgroundColor, borderColor, borderWidth: borderColor !== 'transparent' ? 1 : 0 }, style]}>
      <AppText variant="labelXs" color={color}>
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
  },
});
