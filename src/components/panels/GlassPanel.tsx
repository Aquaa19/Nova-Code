import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../../theme';

interface GlassPanelProps extends ViewProps {
  variant?: 'panel' | 'card' | 'active';
  children: React.ReactNode;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  variant = 'panel',
  style,
  children,
  ...props
}) => {
  const glassStyle = theme.glass[variant];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: glassStyle.backgroundColor,
          borderColor: glassStyle.borderColor,
          borderWidth: glassStyle.borderWidth,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
});
