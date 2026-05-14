import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { BottomTabBar } from '../components/navigation/BottomTabBar';
import { SearchInput } from '../components/inputs/SearchInput';
import { FilterChipBar } from '../features/search/components/FilterChipBar';
import { SearchResultsGroup } from '../features/search/components/SearchResultsGroup';
import { SearchResultCard } from '../features/search/components/SearchResultCard';
import { CodeSnippetCard } from '../components/cards/CodeSnippetCard';

const NAV_ITEMS = [
  { id: 'code', label: 'Code', icon: 'code-braces' },
  { id: 'files', label: 'Files', icon: 'folder-outline' },
  { id: 'search', label: 'Search', icon: 'magnify' },
  { id: 'packages', label: 'Packages', icon: 'package-variant' },
  { id: 'terminal', label: 'Terminal', icon: 'console' },
];

const FILTER_ITEMS = [
  { key: 'all', label: 'All' },
  { key: 'files', label: 'Files', icon: 'file-document-outline' },
  { key: 'symbols', label: 'Symbols', icon: 'code-tags' },
];

export const GlobalSearchScreen: React.FC = () => {
  const [query, setQuery] = useState('React');
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <ScreenContainer withHeader withBottomTabs scrollable backgroundVariant="search">
      <AppHeader title="Search" />
      <View style={styles.searchContainer}>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search files, symbols, or code..."
          onClear={() => setQuery('')}
        />
      </View>
      <FilterChipBar
        items={FILTER_ITEMS}
        activeKey={activeFilter}
        onChange={setActiveFilter}
      />

      <SearchResultsGroup title="Top Match" icon="star-outline">
        <CodeSnippetCard
          fileName="App.tsx"
          path="src/App.tsx"
          code={'import React from "react";\nexport default function App() {\n  return <View />;\n}'}
        />
      </SearchResultsGroup>

      <SearchResultsGroup title="Files" icon="file-document-outline">
        <SearchResultCard
          title="ReactContext.ts"
          path="src/types/ReactContext.ts"
          query={query}
          onPress={() => {}}
        />
      </SearchResultsGroup>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingVertical: 16,
  },
});
