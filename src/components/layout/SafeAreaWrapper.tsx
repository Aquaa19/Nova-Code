import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Keyboard, Platform } from 'react-native';
import { theme } from '../../theme';

interface SafeAreaWrapperProps {
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  children: React.ReactNode;
  style?: ViewStyle;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  edges = ['top', 'bottom', 'left', 'right'],
  children,
  style,
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

  // Simple static fallback until react-native-safe-area-context is integrated
  const paddingTop = edges.includes('top') ? 44 : 0;
  const paddingBottom = (edges.includes('bottom') && !isKeyboardVisible) ? 34 : 0;

  return (
    <View style={[styles.container, { paddingTop, paddingBottom }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
