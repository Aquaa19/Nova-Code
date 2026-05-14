import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { theme } from '../../theme';

interface SectionLabelProps {
  label: string;
  tone?: 'default' | 'primary';
}

export const SectionLabel: React.FC<SectionLabelProps> = ({
  label,
  tone = 'default',
}) => {
  return (
    <View style={styles.container}>
      <AppText
        variant="labelXs"
        color={tone === 'primary' ? theme.colors.primary : theme.colors.outline}
        style={styles.text}
      >
        {label.toUpperCase()}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.s2,
    paddingHorizontal: theme.spacing.s4,
  },
  text: {
    letterSpacing: 1.2,
  },
});
