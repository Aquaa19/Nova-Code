import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SectionLabel } from '../../../components/typography/SectionLabel';
import { theme } from '../../../theme';

interface SearchResultsGroupProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
}

export const SearchResultsGroup: React.FC<SearchResultsGroupProps> = ({
  title,
  icon,
  children,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SectionLabel label={title} />
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.s6,
  },
  header: {
    marginBottom: theme.spacing.s2,
  },
  content: {
    // Content layout
  },
});
