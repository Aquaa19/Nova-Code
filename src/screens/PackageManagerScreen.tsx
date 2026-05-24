// src/screens/PackageManagerScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { SearchInput } from '../components/inputs/SearchInput';
import { theme } from '../theme';

import { useProjectStore } from '../store/useProjectStore';
import { useTerminalStore } from '../store/useTerminalStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { FileService } from '../services/FileService';
import { storage } from '../storage/mmkv';
import { RegistrySwitcher, RegistryType } from '../features/packages/components/RegistrySwitcher';
import { PackageTabs } from '../features/packages/components/PackageTabs';
import { PackageFeed } from '../features/packages/components/PackageFeed';
import { PackageData } from '../features/packages/components/PackageCard';
import { InstallOverlay } from '../features/packages/components/InstallOverlay';
import { PackageService } from '../features/packages/services/PackageService';

const TABS = [
  { id: 'explore', label: 'Explore' },
  { id: 'installed', label: 'Installed' },
];

export const PackageManagerScreen: React.FC = () => {
  const { currentProject } = useProjectStore();
  const { sessionId } = useTerminalStore();
  const { engineUrl, engineAuthToken, localUserId } = useSettingsStore();
  
  const [activeRegistry, setActiveRegistry] = useState<RegistryType>('npm');
  const [activeTab, setActiveTab] = useState('explore');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [searchResults, setSearchResults] = useState<PackageData[]>([]);
  const [installedPackages, setInstalledPackages] = useState<PackageData[]>([]);
  const [installingPkg, setInstallingPkg] = useState<PackageData | null>(null);

  useEffect(() => {
    if (currentProject) {
      if (currentProject.language === 'python') setActiveRegistry('pip');
      else if (currentProject.language === 'java') setActiveRegistry('maven');
      else setActiveRegistry('npm');
    }
  }, [currentProject?.language]);

  // Handle Search API Calls
  useEffect(() => {
    if (activeTab !== 'explore') return;
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const cached = PackageService.getCachedSearch(activeRegistry, searchQuery);
    if (cached) {
      setSearchResults(cached);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        let results: PackageData[] = [];
        if (activeRegistry === 'npm') {
          const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(searchQuery)}&size=15`);
          if (res.ok) {
            const data = await res.json();
            results = data.objects.map((obj: any) => ({
              id: obj.package.name,
              name: obj.package.name,
              version: obj.package.version,
              description: obj.package.description,
            }));
          }
        } else if (activeRegistry === 'pip') {
          const res = await fetch(`https://pypi.org/pypi/${encodeURIComponent(searchQuery)}/json`);
          if (res.ok) {
            const data = await res.json();
            results = [{
              id: data.info.name,
              name: data.info.name,
              version: data.info.version,
              description: data.info.summary,
            }];
          }
        }

        setSearchResults(results);
        if (results.length > 0) {
          PackageService.cacheSearch(activeRegistry, searchQuery, results);
        }
      } catch (e) {
        console.warn('Package search failed:', e);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery, activeRegistry, activeTab]);

  // Handle Fetching Installed Packages
  const loadInstalled = useCallback(async () => {
    if (!currentProject) return;

    // 1. Try to fetch from backend engine container if session is active
    if (sessionId) {
      try {
        const httpUrl = engineUrl.replace('ws://', 'http://').replace('wss://', 'https://');
        const res = await fetch(`${httpUrl}/sessions/${sessionId}/packages?projectName=${encodeURIComponent(currentProject?.name || '')}`, {
          headers: { 
            'x-auth-token': engineAuthToken,
            'x-user-id': localUserId
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (activeRegistry === 'npm') {
            setInstalledPackages(data.npm || []);
            return;
          } else if (activeRegistry === 'pip') {
            setInstalledPackages(data.pip || []);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch installed packages from container:', e);
      }
    }

    // 2. Fallback: Parse local client directories/files
    try {
      if (activeRegistry === 'npm') {
        const exists = await FileService.exists(`${currentProject.path}/package.json`);
        if (!exists) { setInstalledPackages([]); return; }
        
        const content = await FileService.readFile(`${currentProject.path}/package.json`);
        const pkg = JSON.parse(content);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        const pkgs = Object.keys(deps).map(key => ({
          id: key, name: key, version: deps[key] || 'installed', description: 'Installed via package.json'
        }));
        setInstalledPackages(pkgs);
        
      } else if (activeRegistry === 'pip') {
        const exists = await FileService.exists(`${currentProject.path}/.python_packages`);
        if (!exists) { setInstalledPackages([]); return; }

        const items = await FileService.readDir(`${currentProject.path}/.python_packages`);
        const pkgs = items
          .filter(i => i.isDirectory && !i.name.includes('.dist-info') && !i.name.includes('__pycache__'))
          .map(i => ({
            id: i.name, name: i.name, version: 'installed', description: 'Local package'
          }));
        setInstalledPackages(pkgs);
      }
    } catch (e) {
      setInstalledPackages([]);
    }
  }, [currentProject, activeRegistry, sessionId, engineUrl, engineAuthToken]);

  useEffect(() => {
    if (activeTab === 'installed') loadInstalled();
  }, [activeTab, loadInstalled]);

  const handleInstall = (pkg: PackageData) => {
    if (!sessionId) {
      Alert.alert('Session Offline', 'Please run the project first to start the execution environment.');
      return;
    }
    setInstallingPkg(pkg);
  };

  const handleRemove = (pkg: PackageData) => {
    if (!sessionId) {
      Alert.alert('Session Offline', 'Please run the project first to modify packages.');
      return;
    }
    Alert.alert(
      `Remove ${pkg.name}?`,
      `Are you sure you want to uninstall this package from your project?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            const command = activeRegistry === 'npm' 
              ? (currentProject?.name ? `cd ${currentProject.name} && npm uninstall ${pkg.name}` : `npm uninstall ${pkg.name}`)
              : `rm -rf /workspace/.python_packages/${pkg.name}*`;

            const httpUrl = engineUrl.replace('ws://', 'http://').replace('wss://', 'https://');
            await fetch(`${httpUrl}/sessions/${sessionId}/exec`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json', 
                'x-auth-token': engineAuthToken,
                'x-user-id': localUserId
              },
              body: JSON.stringify({ command })
            });
            loadInstalled();
          }
        }
      ]
    );
  };

  const handleInstallComplete = () => {
    setInstallingPkg(null);
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
          packages={activeTab === 'explore' ? searchResults : installedPackages}
          onInstall={handleInstall}
          onRemove={handleRemove}
        />
      </View>

      <InstallOverlay
        visible={!!installingPkg}
        packageName={installingPkg?.name || ''}
        projectName={currentProject?.name || ''}
        registry={activeRegistry}
        onComplete={handleInstallComplete}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  searchContainer: { paddingHorizontal: theme.spacing.gutter, paddingBottom: theme.spacing.s4 },
  contentContainer: { flex: 1 },
});
