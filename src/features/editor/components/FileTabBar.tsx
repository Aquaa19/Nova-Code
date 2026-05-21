// src/features/editor/components/FileTabBar.tsx

import React, { useRef, useState, useEffect } from 'react';
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
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);
  const [tabLayouts, setTabLayouts] = useState<{ [key: string]: { x: number; width: number } }>({});

  const activePath = tabs[activeIndex]?.path;

  // Auto-scroll the active tab to the center of the screen
  useEffect(() => {
    if (activePath && scrollViewRef.current && tabLayouts[activePath]) {
      const { x, width } = tabLayouts[activePath];
      const containerWidth = scrollViewWidth || 350;
      const targetOffset = x - (containerWidth - width) / 2;
      scrollViewRef.current.scrollTo({
        x: Math.max(0, targetOffset),
        animated: true,
      });
    }
  }, [activeIndex, activePath, tabLayouts, scrollViewWidth]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onLayout={(e) => setScrollViewWidth(e.nativeEvent.layout.width)}
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          const fileName = tab.path.split('/').pop() ?? 'Untitled';
          const extension = fileName.split('.').pop() ?? '';
          const { icon, color } = getFileIcon(extension, false);

          return (
            <Pressable
              key={tab.path}
              onLayout={(e) => {
                const { x, width } = e.nativeEvent.layout;
                setTabLayouts((prev) => ({
                  ...prev,
                  [tab.path]: { x, width },
                }));
              }}
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
                numberOfLines={1}
              >
                {fileName}
              </AppText>
              
              {tab.unsaved && (
                <View style={styles.dirtyDot} />
              )}
              
              <Pressable 
                onPress={() => onCloseTab(tab.path)} 
                style={styles.closeButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons 
                  name="close" 
                  size={12} 
                  color={isActive ? theme.colors.onSurfaceVariant : 'rgba(255, 255, 255, 0.3)'} 
                />
              </Pressable>

              {isActive && (
                <View style={styles.activeIndicator} />
              )}
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
    height: 36, // leave space for container border
    backgroundColor: theme.colors.surfaceContainerLow,
    marginRight: 2,
    borderTopLeftRadius: theme.radius.sm,
    borderTopRightRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    borderBottomWidth: 0,
    minWidth: 110,
    maxWidth: 160,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  icon: {
    marginRight: 6,
  },
  tabName: {
    flex: 1,
    marginRight: 6,
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
    marginRight: 4,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.primaryFixed,
  },
});