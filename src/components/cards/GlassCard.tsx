import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { GlassPanel } from '../panels/GlassPanel';
import { theme } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  active?: boolean;
  padding?: keyof typeof theme.spacing;
  style?: StyleProp<ViewStyle>;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  active = false,
  padding = 's4',
  style,
}) => {
  return (
    <GlassPanel
      variant={active ? 'active' : 'card'}
      style={[
        styles.container,
        { padding: theme.spacing[padding] as number },
        theme.shadows.card,
        style,
      ]}
    >
      {children}
    </GlassPanel>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.md,
  },
});
