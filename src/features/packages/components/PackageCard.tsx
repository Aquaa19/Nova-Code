// src/features/packages/components/PackageCard.tsx

import React from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlassCard } from '../../../components/cards/GlassCard';
import { AppText } from '../../../components/typography/AppText';
import { theme } from '../../../theme';

export interface PackageData {
  id: string;
  name: string;
  version: string;
  description: string;
  isInstalled?: boolean;
}

interface PackageCardProps {
  pkg: PackageData;
  onInstall: (pkg: PackageData) => void;
  onRemove?: (pkg: PackageData) => void;
}

export const PackageCard: React.FC<PackageCardProps> = React.memo(({ pkg, onInstall, onRemove }) => {
  // Simple scale animation for the install button
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <GlassCard padding="s4" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <AppText variant="headlineSm" color={theme.colors.onSurface} style={styles.name}>
            {pkg.name}
          </AppText>
          <View style={styles.versionBadge}>
            <AppText variant="labelXs" color={theme.colors.onSurfaceVariant}>
              v{pkg.version}
            </AppText>
          </View>
        </View>

        {pkg.isInstalled ? (
          <Pressable 
            style={[styles.actionButton, styles.removeButton]} 
            onPress={() => onRemove?.(pkg)}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={16} color={theme.colors.error} />
          </Pressable>
        ) : (
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => onInstall(pkg)}
          >
            <Animated.View style={[styles.actionButton, styles.installButton, { transform: [{ scale: scaleAnim }] }]}>
              <MaterialCommunityIcons name="download" size={16} color={theme.colors.background} style={styles.installIcon} />
              <AppText variant="labelSm" color={theme.colors.background}>
                Install
              </AppText>
            </Animated.View>
          </Pressable>
        )}
      </View>

      <AppText variant="bodySm" color={theme.colors.onSurfaceVariant} numberOfLines={2} style={styles.description}>
        {pkg.description}
      </AppText>
    </GlassCard>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.s3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.s2,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginRight: theme.spacing.s3,
  },
  name: {
    marginRight: theme.spacing.s2,
  },
  versionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    marginTop: 2,
  },
  description: {
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
  },
  installButton: {
    backgroundColor: theme.colors.primaryFixed,
  },
  installIcon: {
    marginRight: 4,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 8,
  },
});
