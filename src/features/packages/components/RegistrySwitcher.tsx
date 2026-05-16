// src/features/packages/components/RegistrySwitcher.tsx

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlassCard } from '../../../components/cards/GlassCard';
import { AppText } from '../../../components/typography/AppText';
import { theme } from '../../../theme';

export type RegistryType = 'npm' | 'pip' | 'maven';

interface RegistryOption {
  id: RegistryType;
  label: string;
  icon: string;
  color: string;
}

const REGISTRIES: RegistryOption[] = [
  { id: 'npm', label: 'NPM', icon: 'nodejs', color: '#CB3837' },
  { id: 'pip', label: 'PIP', icon: 'language-python', color: '#3776AB' },
  { id: 'maven', label: 'Maven', icon: 'language-java', color: '#E82226' },
];

interface RegistrySwitcherProps {
  activeRegistry: RegistryType;
  onChange: (registry: RegistryType) => void;
}

export const RegistrySwitcher: React.FC<RegistrySwitcherProps> = ({
  activeRegistry,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      {REGISTRIES.map((reg) => {
        const isActive = activeRegistry === reg.id;
        
        return (
          <Pressable
            key={reg.id}
            onPress={() => onChange(reg.id)}
            style={({ pressed }) => [
              styles.pressable,
              { transform: [{ scale: pressed ? 0.96 : 1 }] } // Subtle scale micro-interaction
            ]}
          >
            <GlassCard
              padding="s3"
              active={isActive}
              style={[
                styles.card,
                isActive && { borderColor: `${reg.color}50`, borderWidth: 1 }
              ]}
            >
              <MaterialCommunityIcons
                name={reg.icon}
                size={20}
                color={isActive ? reg.color : theme.colors.onSurfaceVariant}
                style={styles.icon}
              />
              <AppText
                variant="labelXs"
                color={isActive ? theme.colors.onSurface : theme.colors.onSurfaceVariant}
              >
                {reg.label}
              </AppText>
            </GlassCard>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.s2,
    paddingHorizontal: theme.spacing.gutter,
    marginBottom: theme.spacing.s4,
  },
  pressable: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  icon: {
    marginRight: theme.spacing.s2,
  },
});
