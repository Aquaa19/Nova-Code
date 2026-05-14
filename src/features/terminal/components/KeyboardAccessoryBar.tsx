import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { GlassButton } from '../../../components/buttons/GlassButton';
import { theme } from '../../../theme';

export interface AccessoryKey {
  id: string;
  label: string;
  value?: string;
  icon?: string;
}

interface KeyboardAccessoryBarProps {
  keys: AccessoryKey[];
  onKeyPress: (key: AccessoryKey) => void;
}

export const KeyboardAccessoryBar: React.FC<KeyboardAccessoryBarProps> = ({
  keys,
  onKeyPress,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        {keys.map((key) => (
          <GlassButton
            key={key.id}
            label={key.label}
            icon={key.icon}
            variant="secondary"
            size="sm"
            onPress={() => onKeyPress(key)}
            style={styles.keyButton}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: theme.spacing.keyboardAccessoryHeight,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: theme.spacing.gutter,
    alignItems: 'center',
  },
  keyButton: {
    marginRight: theme.spacing.s2,
    minWidth: 40, // Ensure keys are tapable even if label is short
  },
});
