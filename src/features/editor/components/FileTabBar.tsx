// src/features/editor/components/FileTabBar.tsx

import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../../../components/typography/AppText';
import { theme } from '../../../theme';
import { OpenFile } from '../../../store/useEditorStore';
import { getFileIcon } from '../../files/utils/fileIcons';

interface FileTabBarProps {
  tabs: OpenFile[];
  activeIndex: number;
  onTabPress: (index: number) => void;
  onCloseTab: (path: string) => void;
}

export const FileTabBar: React.FC<FileTabBarProps> = ({
  tabs,
  activeIndex,
  onTabPress,
  onCloseTab,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          const fileName = tab.path.split('/').pop() ?? 'Untitled';
          const extension = fileName.split('.').pop() ?? '';
          const { icon, color } = getFileIcon(extension, false);

          return (
            <Pressable
              key={tab.path}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onTabPress(index)}
            >
              <MaterialCommunityIcons
                name={icon}
                size={14}
                color={isActive ? color : theme.colors.onSurfaceVariant}
                style={styles.icon}
              />
              <AppText
                variant="labelXs"
                color={isActive ? theme.colors.onSurface : theme.colors.onSurfaceVariant}
                style={styles.tabName}
              >
                {fileName}
              </AppText>
              {tab.unsaved && (
                <View style={styles.dirtyDot} />
              )}
              <Pressable onPress={() => onCloseTab(tab.path)} style={styles.closeButton}>
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
    marginLeft: 4,
  },
  dirtyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primaryFixed,
  },
});