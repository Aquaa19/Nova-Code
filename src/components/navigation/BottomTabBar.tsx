import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../typography/AppText';
import { theme } from '../../theme';

interface TabItem {
  id: string;
  label: string;
  icon: string;
}

interface BottomTabBarProps {
  items: TabItem[];
  activeId: string;
  onTabPress: (id: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  items,
  activeId,
  onTabPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.content, theme.shadows.bottomNav]}>
        {items.map((item) => {
          const isActive = item.id === activeId;
          const color = isActive ? theme.colors.primaryFixed : theme.colors.onSurfaceVariant;
          
          return (
            <Pressable
              key={item.id}
              style={styles.tabItem}
              onPress={() => onTabPress(item.id)}
            >
              <MaterialCommunityIcons name={item.icon} size={24} color={color} style={styles.icon} />
              <AppText variant="labelXs" color={color}>
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: theme.spacing.bottomTabHeight,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    flexDirection: 'row',
    height: '100%',
    paddingBottom: theme.spacing.safeBottomFallback, // static fallback
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing.s2,
  },
  icon: {
    marginBottom: 4,
  },
});
