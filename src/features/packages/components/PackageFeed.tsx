// src/features/packages/components/PackageFeed.tsx

import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { PackageCard, PackageData } from './PackageCard';
import { RegistryType } from './RegistrySwitcher';
import { AppText } from '../../../components/typography/AppText';
import { theme } from '../../../theme';

interface PackageFeedProps {
  activeRegistry: RegistryType;
  activeTab: string;
  searchQuery: string;
  onInstall: (pkg: PackageData) => void;
  onRemove: (pkg: PackageData) => void;
}

// Mock Data Dictionaries
const MOCK_EXPLORE: Record<RegistryType, PackageData[]> = {
  npm: [
    { id: 'npm1', name: 'react-native-reanimated', version: '3.6.0', description: 'React Native\'s Animated library reimplemented.' },
    { id: 'npm2', name: 'axios', version: '1.6.2', description: 'Promise based HTTP client for the browser and node.js.' },
    { id: 'npm3', name: 'zustand', version: '4.4.7', description: 'Bear necessities for state management in React.' },
  ],
  pip: [
    { id: 'pip1', name: 'requests', version: '2.31.0', description: 'Python HTTP for Humans.' },
    { id: 'pip2', name: 'numpy', version: '1.26.2', description: 'The fundamental package for scientific computing with Python.' },
  ],
  maven: [
    { id: 'mvn1', name: 'gson', version: '2.10.1', description: 'A Java serialization/deserialization library to convert Java Objects into JSON and back.' },
  ],
};

const MOCK_INSTALLED: PackageData[] = [
  { id: 'inst1', name: 'lodash', version: '4.17.21', description: 'Lodash modular utilities.', isInstalled: true },
];

export const PackageFeed: React.FC<PackageFeedProps> = ({
  activeRegistry,
  activeTab,
  searchQuery,
  onInstall,
  onRemove,
}) => {
  
  const data = useMemo(() => {
    let sourceData = activeTab === 'installed' ? MOCK_INSTALLED : MOCK_EXPLORE[activeRegistry];
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      sourceData = sourceData.filter(pkg => pkg.name.toLowerCase().includes(q));
    }
    
    return sourceData;
  }, [activeRegistry, activeTab, searchQuery]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <AppText color={theme.colors.onSurfaceVariant} style={styles.emptyText}>
        {searchQuery.trim() 
          ? `No packages found for "${searchQuery}"`
          : activeTab === 'installed' 
            ? 'No packages installed in this project.' 
            : `No trending packages for ${activeRegistry.toUpperCase()} right now.`}
      </AppText>
    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <PackageCard 
          pkg={item} 
          onInstall={onInstall} 
          onRemove={onRemove} 
        />
      )}
      ListEmptyComponent={renderEmptyState}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: theme.spacing.gutter,
    paddingBottom: theme.spacing.gutter + 100, // Account for bottom tabs
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
});
