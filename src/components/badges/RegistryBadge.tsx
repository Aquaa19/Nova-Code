import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../typography/AppText';
import { theme } from '../../theme';

interface RegistryBadgeProps {
  type: 'maven' | 'pip' | string;
  style?: ViewStyle;
}

export const RegistryBadge: React.FC<RegistryBadgeProps> = ({ type, style }) => {
  const isMaven = type.toLowerCase() === 'maven';
  const isPip = type.toLowerCase() === 'pip';
  
  let backgroundColor: string = theme.colors.surfaceContainerHighest;
  let color: string = theme.colors.onSurfaceVariant;
  let icon: string = 'package-variant-closed';

  if (isMaven) {
    backgroundColor = 'rgba(236, 178, 255, 0.15)'; // secondary Container tint
    color = theme.colors.secondaryFixed;
    icon = 'language-java';
  } else if (isPip) {
    backgroundColor = 'rgba(0, 240, 255, 0.15)'; // primary Container tint
    color = theme.colors.primaryFixed;
    icon = 'language-python';
  }

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <MaterialCommunityIcons name={icon} size={12} color={color} style={styles.icon} />
      <AppText variant="labelXs" color={color}>
        {type.toUpperCase()}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  icon: {
    marginRight: 4,
  },
});
