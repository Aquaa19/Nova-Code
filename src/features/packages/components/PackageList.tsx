import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { PackageCard, PackageData } from './PackageCard';
import { theme } from '../../../theme';

interface PackageListProps {
  packages: PackageData[];
  onRemove?: (pkg: PackageData) => void;
  onInstall: (pkg: PackageData) => void;
}

export const PackageList: React.FC<PackageListProps> = ({
  packages,
  onRemove,
  onInstall,
}) => {
  return (
    <FlatList
      data={packages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PackageCard
          pkg={item}
          onRemove={onRemove}
          onInstall={onInstall}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: theme.spacing.bottomTabHeight + theme.spacing.s4,
  },
});
