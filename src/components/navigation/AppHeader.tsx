import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from '../typography/AppText';
import { IconButton } from '../buttons/IconButton';
import { theme } from '../../theme';

interface AppHeaderProps {
  title?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  centerComponent?: React.ReactNode;
  variant?: 'default' | 'transparent';
  style?: ViewStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  leftIcon = 'menu',
  rightIcon = 'magnify',
  onLeftPress,
  onRightPress,
  centerComponent,
  variant = 'default',
  style,
}) => {
  const isTransparent = variant === 'transparent';

  return (
    <View style={[styles.container, !isTransparent && styles.solidBackground, style]}>
      <View style={styles.leftContent}>
        {onLeftPress && (
          <IconButton icon={leftIcon} onPress={onLeftPress} size={24} style={styles.iconButton} />
        )}
        {title && (
          <AppText variant="headlineMd" style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
        )}
      </View>
      
      {centerComponent && (
        <View style={styles.centerContainer}>
          {centerComponent}
        </View>
      )}

      <View style={styles.rightContent}>
        {onRightPress && (
          <IconButton icon={rightIcon} onPress={onRightPress} size={24} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.spacing.safeTopFallback,
    paddingBottom: theme.spacing.s2,
    minHeight: theme.spacing.headerHeight + theme.spacing.safeTopFallback,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.gutter,
  },
  solidBackground: {
    backgroundColor: 'rgba(17, 19, 28, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginLeft: theme.spacing.s2,
    flex: 1,
  },
  iconButton: {
    marginRight: theme.spacing.s2,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
});
