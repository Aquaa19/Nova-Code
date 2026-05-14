import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { GlassButton } from '../../../components/buttons/GlassButton';
import { theme } from '../../../theme';

export interface FilterChip {
  key: string;
  label: string;
  icon?: string;
}

interface FilterChipBarProps {
  items: FilterChip[];
  activeKey: string;
  onChange: (key: string) => void;
}

export const FilterChipBar: React.FC<FilterChipBarProps> = ({
  items,
  activeKey,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <GlassButton
              key={item.key}
              label={item.label}
              icon={item.icon}
              variant={isActive ? 'primary' : 'secondary'}
              size="sm"
              onPress={() => onChange(item.key)}
              style={styles.chip}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.s3,
  },
  content: {
    paddingHorizontal: theme.spacing.gutter,
  },
  chip: {
    marginRight: theme.spacing.s2,
    borderRadius: theme.radius.full, // pill shape for chips
  },
});
