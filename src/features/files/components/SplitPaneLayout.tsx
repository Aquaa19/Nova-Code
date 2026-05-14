import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { theme } from '../../../theme';

interface SplitPaneLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth?: number; // percentage, e.g., 30 for 30%
  showRightOnMobile?: boolean; // If true, only shows right pane on narrow screens
}

export const SplitPaneLayout: React.FC<SplitPaneLayoutProps> = ({
  left,
  right,
  leftWidth = 35,
  showRightOnMobile = false,
}) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  if (!isTablet) {
    return (
      <View style={styles.container}>
        {showRightOnMobile ? right : left}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.leftPane, { width: `${leftWidth}%` }]}>
        {left}
      </View>
      <View style={styles.divider} />
      <View style={styles.rightPane}>
        {right}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPane: {
    height: '100%',
  },
  rightPane: {
    flex: 1,
    height: '100%',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
