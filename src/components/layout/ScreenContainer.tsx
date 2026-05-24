import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, Keyboard, Platform } from 'react-native';
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
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const paddingBottom = (withBottomTabs && !isKeyboardVisible) ? theme.spacing.bottomTabHeight : 0;
  
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
