import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface AppTextProps extends TextProps {
  variant?: keyof typeof theme.typography;
  color?: string;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'bodyMd',
  color = theme.colors.onSurface,
  style,
  children,
  ...props
}) => {
  return (
    <Text
      style={[
        theme.typography[variant],
        { color },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
