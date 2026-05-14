import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface ProgressBarProps {
  value: number; // 0 to 1
  tone?: 'primary' | 'success';
  animated?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  tone = 'primary',
  animated = true,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(value)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: value,
        duration: 300,
        useNativeDriver: false, // width animation doesn't support native driver
      }).start();
    } else {
      animatedValue.setValue(value);
    }
  }, [value, animated, animatedValue]);

  const widthInterpolated = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const barColor = tone === 'success' ? theme.colors.tertiaryFixed : theme.colors.primaryFixed;

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.bar,
          {
            width: widthInterpolated,
            backgroundColor: barColor,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    width: '100%',
  },
  bar: {
    height: '100%',
    borderRadius: theme.radius.full,
  },
});
