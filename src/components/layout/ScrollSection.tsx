import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SectionLabel } from '../typography/SectionLabel';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import { AppText } from '../typography/AppText';

interface ScrollSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
}

export const ScrollSection: React.FC<ScrollSectionProps> = ({
  title,
  icon,
  children,
  contentContainerStyle,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {icon && (
          <MaterialCommunityIcons name={icon} size={16} color={theme.colors.outline} style={styles.icon} />
        )}
        <SectionLabel label={title} />
      </View>
      <View style={[styles.content, contentContainerStyle]}>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s2,
    paddingHorizontal: theme.spacing.s1,
  },
  icon: {
    marginRight: theme.spacing.s1,
  },
  content: {
    // default content style
  },
});
