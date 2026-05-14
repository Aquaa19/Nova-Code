import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { SafeAreaWrapper } from './SafeAreaWrapper';
import { AmbientBackground } from './AmbientBackground';
import { theme } from '../../theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  withHeader?: boolean;
  withBottomTabs?: boolean;
  backgroundVariant?: 'editor' | 'search' | 'terminal' | 'default';
  contentContainerStyle?: ViewStyle;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  withHeader = false,
  withBottomTabs = false,
  backgroundVariant = 'default',
  contentContainerStyle,
}) => {
  const paddingBottom = withBottomTabs ? theme.spacing.bottomTabHeight : 0;
  
  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { paddingBottom }, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.viewContent, { paddingBottom }, contentContainerStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaWrapper edges={withHeader ? ['bottom'] : ['top', 'bottom']}>
      <AmbientBackground variant={backgroundVariant} />
      {content}
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.screenMargin,
  },
  viewContent: {
    flex: 1,
    padding: theme.spacing.screenMargin,
  },
});
