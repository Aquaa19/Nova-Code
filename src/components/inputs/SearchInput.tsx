import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

interface SearchInputProps {
  value: string;
  placeholder?: string;
  autoFocus?: boolean;
  leftIcon?: string;
  showClear?: boolean;
  onChangeText: (text: string) => void;
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  placeholder = 'Search...',
  autoFocus = false,
  leftIcon = 'magnify',
  showClear = true,
  onChangeText,
  onClear,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, isFocused && styles.focused]}>
      <MaterialCommunityIcons
        name={leftIcon}
        size={20}
        color={isFocused ? theme.colors.primaryFixed : theme.colors.onSurfaceVariant}
        style={styles.leftIcon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        style={styles.input}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        selectionColor={theme.colors.primaryFixed}
      />
      {showClear && value.length > 0 && (
        <Pressable onPress={onClear} style={styles.clearButton}>
          <MaterialCommunityIcons name="close-circle" size={16} color={theme.colors.onSurfaceVariant} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: theme.spacing.s3,
    height: 40,
  },
  focused: {
    borderColor: theme.colors.primaryFixedDim,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  leftIcon: {
    marginRight: theme.spacing.s2,
  },
  input: {
    flex: 1,
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
    paddingVertical: 0, // override default padding on Android
  },
  clearButton: {
    padding: theme.spacing.s1,
    marginLeft: theme.spacing.s2,
  },
});
