import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '../../../components/typography/AppText';
import { theme } from '../../../theme';

export interface PackageTab {
  id: string;
  label: string;
}

interface PackageTabsProps {
  tabs: PackageTab[];
  activeId: string;
  onChange: (id: string) => void;
}

export const PackageTabs: React.FC<PackageTabsProps> = ({
  tabs,
  activeId,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <AppText
              variant="labelXs"
              color={isActive ? theme.colors.primaryFixed : theme.colors.onSurfaceVariant}
            >
              {tab.label}
            </AppText>
            {isActive && <View style={styles.activeIndicator} />}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: theme.spacing.s4,
  },
  tab: {
    paddingVertical: theme.spacing.s2,
    paddingHorizontal: theme.spacing.s4,
    marginRight: theme.spacing.s2,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    // any active tab background if needed
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: theme.spacing.s4,
    right: theme.spacing.s4,
    height: 2,
    backgroundColor: theme.colors.primaryFixed,
  },
});
