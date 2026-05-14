import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../../../components/typography/AppText';
import { HighlightedMatchText } from './HighlightedMatchText';
import { StatusBadge } from '../../../components/badges/StatusBadge';
import { theme } from '../../../theme';

interface SearchResultCardProps {
  title: string;
  path: string;
  icon?: string;
  matchRanges?: number;
  type?: 'file' | 'symbol' | 'snippet';
  query: string;
  onPress: () => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  title,
  path,
  icon = 'file-document-outline',
  matchRanges = 0,
  type = 'file',
  query,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <MaterialCommunityIcons name={icon} size={20} color={theme.colors.onSurfaceVariant} style={styles.icon} />
      <View style={styles.content}>
        <View style={styles.header}>
          <HighlightedMatchText text={title} query={query} />
          {matchRanges > 0 && (
            <StatusBadge label={`${matchRanges} matches`} tone="primary" style={styles.badge} />
          )}
        </View>
        <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} numberOfLines={1}>
          {path}
        </AppText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.s3,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.s2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  pressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  icon: {
    marginRight: theme.spacing.s3,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  badge: {
    marginLeft: theme.spacing.s2,
  },
});
