import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { AppText } from '../../../components/typography/AppText';
import { ActionCircleButton } from '../../../components/buttons/ActionCircleButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../../theme';

export interface FileTab {
  id: string;
  name: string;
  isDirty?: boolean;
  icon?: string;
}

interface FileTabBarProps {
  tabs: FileTab[];
  activeTabId: string;
  onTabPress: (id: string) => void;
  onCloseTab: (id: string) => void;
}

export const FileTabBar: React.FC<FileTabBarProps> = ({
  tabs,
  activeTabId,
  onTabPress,
  onCloseTab,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onTabPress(tab.id)}
            >
              <MaterialCommunityIcons
                name={tab.icon || "file-code-outline"}
                size={14}
                color={isActive ? theme.colors.primaryFixed : theme.colors.onSurfaceVariant}
                style={styles.icon}
              />
              <AppText
                variant="labelXs"
                color={isActive ? theme.colors.onSurface : theme.colors.onSurfaceVariant}
                style={styles.tabName}
              >
                {tab.name}
              </AppText>
              {tab.isDirty && (
                <View style={styles.dirtyDot} />
              )}
              <Pressable onPress={() => onCloseTab(tab.id)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={12} color={theme.colors.onSurfaceVariant} />
              </Pressable>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.s2,
    alignItems: 'flex-end', // Tabs sit on bottom
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s2,
    backgroundColor: theme.colors.surfaceContainerLow,
    marginRight: 2,
    borderTopLeftRadius: theme.radius.sm,
    borderTopRightRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    borderBottomWidth: 0,
    minWidth: 100,
  },
  activeTab: {
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  icon: {
    marginRight: 6,
  },
  tabName: {
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    padding: 2,
    borderRadius: theme.radius.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dirtyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primaryFixed,
    marginRight: 6,
  },
});
