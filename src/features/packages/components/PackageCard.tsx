import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GlassCard } from '../../../components/cards/GlassCard';
import { AppText } from '../../../components/typography/AppText';
import { RegistryBadge } from '../../../components/badges/RegistryBadge';
import { ActionCircleButton } from '../../../components/buttons/ActionCircleButton';
import { theme } from '../../../theme';

export interface PackageData {
  id: string;
  name: string;
  description: string;
  version: string;
  registry: 'npm' | 'pip' | 'maven' | string;
  status?: 'installed' | 'outdated' | 'available';
}

interface PackageCardProps {
  pkg: PackageData;
  onDelete?: (id: string) => void;
  onUpgrade?: (id: string) => void;
  onInstall?: (id: string) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  onDelete,
  onUpgrade,
  onInstall,
}) => {
  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <AppText variant="bodyMd" style={styles.name}>{pkg.name}</AppText>
        <RegistryBadge type={pkg.registry} />
      </View>
      <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} numberOfLines={2} style={styles.description}>
        {pkg.description}
      </AppText>
      <View style={styles.footer}>
        <AppText variant="labelXs" color={theme.colors.onSurfaceVariant}>
          v{pkg.version}
        </AppText>
        <View style={styles.actions}>
          {pkg.status === 'outdated' && onUpgrade && (
            <ActionCircleButton
              icon="arrow-up-circle-outline"
              tone="primary"
              onPress={() => onUpgrade(pkg.id)}
              style={styles.actionButton}
            />
          )}
          {(pkg.status === 'installed' || pkg.status === 'outdated') && onDelete && (
            <ActionCircleButton
              icon="delete-outline"
              tone="danger"
              onPress={() => onDelete(pkg.id)}
            />
          )}
          {pkg.status === 'available' && onInstall && (
            <ActionCircleButton
              icon="download-outline"
              tone="success"
              onPress={() => onInstall(pkg.id)}
            />
          )}
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.s3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.s2,
  },
  name: {
    flex: 1,
    marginRight: theme.spacing.s2,
    fontWeight: '600',
  },
  description: {
    marginBottom: theme.spacing.s3,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: theme.spacing.s2,
  },
});
