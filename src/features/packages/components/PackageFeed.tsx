// src/features/packages/components/PackageFeed.tsx

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { PackageCard, PackageData } from './PackageCard';
import { AppText } from '../../../components/typography/AppText';
import { theme } from '../../../theme';

interface PackageFeedProps {
  activeRegistry: string;
  activeTab: string;
  searchQuery: string;
  packages: PackageData[];
  onInstall: (pkg: PackageData) => void;
  onRemove: (pkg: PackageData) => void;
}

export const PackageFeed: React.FC<PackageFeedProps> = ({
  activeRegistry,
  activeTab,
  searchQuery,
  packages,
  onInstall,
  onRemove,
}) => {
  if (packages.length === 0) {
    return (
      <View style={styles.emptyState}>
        <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant} style={{ textAlign: 'center' }}>
          {activeTab === 'explore' 
            ? (searchQuery ? `No packages found for "${searchQuery}".` : `Search the ${activeRegistry.toUpperCase()} registry to explore packages.`) 
            : 'No installed packages found.'}
        </AppText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {packages.map(pkg => {
        // Map the isInstalled property inside the package so PackageCard renders the correct button type
        const mappedPkg = {
          ...pkg,
          isInstalled: activeTab === 'installed',
        };
        return (
          <PackageCard 
            key={pkg.id} 
            pkg={mappedPkg} 
            onInstall={onInstall} 
            onRemove={onRemove}
          />
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: theme.spacing.gutter, gap: theme.spacing.s3 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.gutter * 2 }
});
