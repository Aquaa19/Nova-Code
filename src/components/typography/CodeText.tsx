import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface CodeTextProps extends TextProps {
  color?: string;
  highlighted?: boolean;
}

export const CodeText: React.FC<CodeTextProps> = ({
  color = theme.colors.onSurfaceVariant,
  highlighted = false,
  style,
  children,
  ...props
}) => {
  return (
    <Text
      style={[
        theme.typography.codeSm,
        { color: highlighted ? theme.colors.primaryFixed : color },
        highlighted && styles.highlighted,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  highlighted: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
});
