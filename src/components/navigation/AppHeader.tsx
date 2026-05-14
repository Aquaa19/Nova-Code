import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from '../typography/AppText';
import { IconButton } from '../buttons/IconButton';
import { theme } from '../../theme';

interface AppHeaderProps {
  title?: string;
  leftIcon?: string;
  rightIcon?: string;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  variant?: 'default' | 'transparent';
  style?: ViewStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  leftIcon = 'menu',
  rightIcon = 'magnify',
  onMenuPress,
  onSearchPress,
  variant = 'default',
  style,
}) => {
  const isTransparent = variant === 'transparent';

  return (
    <View
      style={[
        styles.container,
        !isTransparent && styles.solidBackground,
        style,
      ]}
    >
      <View style={styles.leftContent}>
        {onMenuPress && (
          <IconButton icon={leftIcon} onPress={onMenuPress} size={24} style={styles.iconButton} />
        )}
        {title && (
          <AppText variant="headlineMd" style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
        )}
      </View>
      <View style={styles.rightContent}>
        {onSearchPress && (
          <IconButton icon={rightIcon} onPress={onSearchPress} size={24} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: theme.spacing.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.gutter,
  },
  solidBackground: {
    backgroundColor: 'rgba(17, 19, 28, 0.8)', // surface with opacity
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  },
});
