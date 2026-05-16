// src/screens/PackageManagerScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { SearchInput } from '../components/inputs/SearchInput';
import { theme } from '../theme';

import { useProjectStore } from '../store/useProjectStore';
import { RegistrySwitcher, RegistryType } from '../features/packages/components/RegistrySwitcher';
import { PackageTabs } from '../features/packages/components/PackageTabs';
import { PackageFeed } from '../features/packages/components/PackageFeed';
import { PackageData } from '../features/packages/components/PackageCard';
import { InstallOverlay } from '../features/packages/components/InstallOverlay';

const TABS = [
  { id: 'explore', label: 'Explore' },
  { id: 'installed', label: 'Installed' },
];

export const PackageManagerScreen: React.FC = () => {
  const { currentProject } = useProjectStore();
  
  const [activeRegistry, setActiveRegistry] = useState<RegistryType>('npm');
  const [activeTab, setActiveTab] = useState('explore');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Install Overlay State
  const [installingPkg, setInstallingPkg] = useState<PackageData | null>(null);

  useEffect(() => {
    if (currentProject) {
      if (currentProject.language === 'python') setActiveRegistry('pip');
      else if (currentProject.language === 'java') setActiveRegistry('maven');
      else setActiveRegistry('npm');
    }
  }, [currentProject?.language]);

  const handleInstall = (pkg: PackageData) => {
    setInstallingPkg(pkg);
  };

  const handleRemove = (pkg: PackageData) => {
    Alert.alert(
      `Remove ${pkg.name}?`,
      `Are you sure you want to uninstall this package from your project?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => console.log('Removed:', pkg.name)
        }
      ]
    );
  };

  const handleInstallComplete = () => {
    setInstallingPkg(null);
    // Automatically switch to the installed tab to show the new package
    setActiveTab('installed');
    setSearchQuery('');
  };

  return (
    <ScreenContainer withHeader withBottomTabs backgroundVariant="search">
      <AppHeader title="Packages" />
      
      <RegistrySwitcher 
        activeRegistry={activeRegistry} 
        onChange={setActiveRegistry} 
      />

      <View style={styles.searchContainer}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${activeRegistry.toUpperCase()} registry...`}
          onClear={() => setSearchQuery('')}
        />
      </View>

      <PackageTabs
        tabs={TABS}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      <View style={styles.contentContainer}>
        <PackageFeed
          activeRegistry={activeRegistry}
          activeTab={activeTab}
          searchQuery={searchQuery}
          onInstall={handleInstall}
          onRemove={handleRemove}
        />
      </View>

      {/* Install Progress Overlay */}
      <InstallOverlay
        visible={!!installingPkg}
        packageName={installingPkg?.name || ''}
        registry={activeRegistry}
        onComplete={handleInstallComplete}
      />
      
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: theme.spacing.gutter,
    paddingBottom: theme.spacing.s4,
  },
  contentContainer: {
    flex: 1,
  },
});
