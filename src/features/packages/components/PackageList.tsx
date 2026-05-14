import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { PackageCard, PackageData } from './PackageCard';
import { theme } from '../../../theme';

interface PackageListProps {
  packages: PackageData[];
  onDelete?: (id: string) => void;
  onUpgrade?: (id: string) => void;
  onInstall?: (id: string) => void;
}

export const PackageList: React.FC<PackageListProps> = ({
  packages,
  onDelete,
  onUpgrade,
  onInstall,
}) => {
  return (
    <FlatList
      data={packages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PackageCard
          pkg={item}
          onDelete={onDelete}
          onUpgrade={onUpgrade}
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
