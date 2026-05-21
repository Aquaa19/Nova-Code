import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { theme } from '../../theme';

interface GlassPanelProps extends ViewProps {
  variant?: 'panel' | 'card' | 'active';
  blurAmount?: number;
  children: React.ReactNode;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  variant = 'panel',
  blurAmount,
  style,
  children,
  ...props
}) => {
  const glassStyle = theme.glass[variant];
  const blur = blurAmount ?? (variant === 'panel' ? 5 : variant === 'card' ? 10 : 10);

  // Check if the parent style requests flex so we propagate it to the content wrapper.
  // Without this, cards/modals would stretch and sidebars/drawers would collapse.
  const flatStyle = StyleSheet.flatten(style) as ViewStyle | undefined;
  const hasFlex = flatStyle?.flex !== undefined && flatStyle.flex > 0;

  const contentStyle: ViewStyle = {};
  if (flatStyle) {
    if (flatStyle.flexDirection) contentStyle.flexDirection = flatStyle.flexDirection;
    if (flatStyle.justifyContent) contentStyle.justifyContent = flatStyle.justifyContent;
    if (flatStyle.alignItems) contentStyle.alignItems = flatStyle.alignItems;
    if (flatStyle.flexWrap) contentStyle.flexWrap = flatStyle.flexWrap;
    if (flatStyle.alignContent) contentStyle.alignContent = flatStyle.alignContent;
    if (flatStyle.gap !== undefined) contentStyle.gap = flatStyle.gap;
    if (flatStyle.rowGap !== undefined) contentStyle.rowGap = flatStyle.rowGap;
    if (flatStyle.columnGap !== undefined) contentStyle.columnGap = flatStyle.columnGap;
  }

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: glassStyle.borderColor,
          borderWidth: glassStyle.borderWidth,
        },
        style,
      ]}
      {...props}
    >
      {/* Native blur layer */}
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="dark"
        blurAmount={blur}
        reducedTransparencyFallbackColor="rgba(17, 19, 28, 0.9)"
      />
      {/* Tint overlay for the colored glass effect */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: glassStyle.backgroundColor },
        ]}
      />
      {/* Inner glow — subtle top highlight */}
      <View style={styles.innerGlow} />
      {/* Content — only flex when parent is flexing, plus propagate flex layout direction */}
      <View style={[styles.content, contentStyle, hasFlex && { flex: 1 }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
