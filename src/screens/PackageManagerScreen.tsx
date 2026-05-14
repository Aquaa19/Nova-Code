import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { BottomTabBar } from '../components/navigation/BottomTabBar';
import { SearchInput } from '../components/inputs/SearchInput';
import { PackageTabs } from '../features/packages/components/PackageTabs';
import { PackageList } from '../features/packages/components/PackageList';
import { InstallProgressCard } from '../features/packages/components/InstallProgressCard';

const NAV_ITEMS = [
  { id: 'code', label: 'Code', icon: 'code-braces' },
  { id: 'files', label: 'Files', icon: 'folder-outline' },
  { id: 'search', label: 'Search', icon: 'magnify' },
  { id: 'packages', label: 'Packages', icon: 'package-variant' },
  { id: 'terminal', label: 'Terminal', icon: 'console' },
];

const TABS = [
  { id: 'installed', label: 'Installed' },
  { id: 'explore', label: 'Explore' },
];

const MOCK_PACKAGES = [
  {
    id: '1',
    name: 'react-native',
    description: 'A framework for building native applications using React',
    version: '0.73.0',
    registry: 'npm',
    status: 'installed' as const,
  },
  {
    id: '2',
    name: 'axios',
    description: 'Promise based HTTP client for the browser and node.js',
    version: '1.6.0',
    registry: 'npm',
    status: 'outdated' as const,
  },
];

export const PackageManagerScreen: React.FC<{ onNavigate?: (id: string) => void }> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('installed');

  return (
    <ScreenContainer withHeader withBottomTabs>
      <AppHeader title="Packages" />
      <View style={styles.searchContainer}>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search npm, pip, maven..."
          onClear={() => setQuery('')}
        />
      </View>
      <InstallProgressCard
        command="npm install react-native-reanimated"
        status="Resolving dependencies..."
        progress={0.4}
      />
      <PackageTabs
        tabs={TABS}
        activeId={activeTab}
        onChange={setActiveTab}
      />
      <View style={styles.listContainer}>
        <PackageList
          packages={MOCK_PACKAGES}
          onDelete={() => {}}
          onUpgrade={() => {}}
        />
      </View>
      <BottomTabBar
        items={NAV_ITEMS}
        activeId="packages"
        onTabPress={onNavigate || (() => {})}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingVertical: 16,
  },
  listContainer: {
    flex: 1,
  },
});
