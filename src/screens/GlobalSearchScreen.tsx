// src/screens/GlobalSearchScreen.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { SearchInput } from '../components/inputs/SearchInput';
import { FilterChipBar } from '../features/search/components/FilterChipBar';
import { SearchResultsGroup } from '../features/search/components/SearchResultsGroup';
import { SearchResultCard } from '../features/search/components/SearchResultCard';
import { CodeSnippetCard } from '../components/cards/CodeSnippetCard';
import { AppText } from '../components/typography/AppText';
import { theme } from '../theme';

import { useProjectStore } from '../store/useProjectStore';
import { SearchService, SearchMatch } from '../features/search/services/SearchService';

const FILTER_ITEMS = [
  { key: 'all', label: 'All' },
  { key: 'files', label: 'Files', icon: 'file-document-outline' },
  { key: 'content', label: 'Content', icon: 'code-tags' },
];

export const GlobalSearchScreen: React.FC<any> = ({ navigation }) => {
  const { currentProject } = useProjectStore();
  
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const [fileResults, setFileResults] = useState<SearchMatch[]>([]);
  const [contentResults, setContentResults] = useState<SearchMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Index project on load
  useEffect(() => {
    if (currentProject) {
      setIsIndexing(true);
      SearchService.indexProject(currentProject.path).then(() => {
        setIsIndexing(false);
      });
    }
  }, [currentProject?.path]);

  // 2. Perform search logic
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setFileResults([]);
      setContentResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setContentResults([]); // Clear previous content results

    // Instant filename search
    const fMatches = SearchService.searchFilenames(searchQuery);
    setFileResults(fMatches);

    // Batched content search
    await SearchService.searchContent(
      searchQuery,
      (match) => {
        setContentResults(prev => [...prev, match]);
      },
      () => {
        setIsSearching(false);
      }
    );
  }, []);

  // 3. Handle debounced input
  const handleQueryChange = (text: string) => {
    setQuery(text);
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(() => {
      performSearch(text);
    }, 400); // 400ms debounce
  };

  const handleResultPress = (match: SearchMatch) => {
    navigation.navigate('Editor', {
      screen: 'OpenFile',
      params: { filePath: match.filePath },
    });
  };

  const renderEmptyState = () => {
    if (isIndexing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <AppText color={theme.colors.onSurfaceVariant} style={styles.stateText}>
            Indexing project files...
          </AppText>
        </View>
      );
    }
    
    if (!query.trim()) {
      return (
        <View style={styles.centerContainer}>
          <AppText color={theme.colors.onSurfaceVariant} style={styles.stateText}>
            Type to search {currentProject?.name ?? 'project'}...
          </AppText>
        </View>
      );
    }

    if (!isSearching && fileResults.length === 0 && contentResults.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <AppText color={theme.colors.onSurfaceVariant} style={styles.stateText}>
            No matches found for "{query}"
          </AppText>
        </View>
      );
    }

    return null;
  };

  return (
    <ScreenContainer withHeader withBottomTabs backgroundVariant="search">
      <AppHeader title="Search" />
      <View style={styles.searchContainer}>
        <SearchInput
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Search files or code..."
          onClear={() => handleQueryChange('')}
        />
      </View>
      <FilterChipBar
        items={FILTER_ITEMS}
        activeKey={activeFilter}
        onChange={setActiveFilter}
      />

      <FlatList
        data={[]} // We are rendering custom groups in ListHeaderComponent
        keyExtractor={() => 'dummy'}
        renderItem={() => null}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={
          <>
            {/* File Results */}
            {(activeFilter === 'all' || activeFilter === 'files') && fileResults.length > 0 && (
              <SearchResultsGroup title="Files" icon="file-document-outline">
                {fileResults.map(match => (
                  <SearchResultCard
                    key={match.id}
                    title={match.fileName}
                    path={match.filePath.replace(currentProject?.path ?? '', '')}
                    query={query}
                    onPress={() => handleResultPress(match)}
                  />
                ))}
              </SearchResultsGroup>
            )}

            {/* Content Results */}
            {(activeFilter === 'all' || activeFilter === 'content') && contentResults.length > 0 && (
              <SearchResultsGroup 
                title="Code Matches" 
                icon="code-tags"
                rightElement={isSearching ? <ActivityIndicator size="small" color={theme.colors.primary} /> : undefined}
              >
                {contentResults.map(match => (
                  <CodeSnippetCard
                    key={match.id}
                    fileName={match.fileName}
                    path={match.filePath.replace(currentProject?.path ?? '', '')}
                    code={match.lineContent ?? ''}
                    onPress={() => handleResultPress(match)}
                  />
                ))}
              </SearchResultsGroup>
            )}
          </>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.s4,
  },
  listContent: {
    paddingBottom: theme.spacing.gutter + 80, // Padding for bottom tabs
  },
  centerContainer: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    marginTop: theme.spacing.s3,
  }
});