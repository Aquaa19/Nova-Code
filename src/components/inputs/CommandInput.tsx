import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { AppText } from '../typography/AppText';
import { theme } from '../../theme';

interface CommandInputProps {
  prompt?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

export const CommandInput: React.FC<CommandInputProps> = ({
  prompt = '>',
  value,
  onChangeText,
  onSubmit,
}) => {
  return (
    <View style={styles.container}>
      <AppText variant="codeSm" color={theme.colors.primaryFixed} style={styles.prompt}>
        {prompt}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="ascii-capable"
        selectionColor={theme.colors.primaryFixed}
        blurOnSubmit={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.s1,
  },
  prompt: {
    marginRight: theme.spacing.s2,
  },
  input: {
    flex: 1,
    ...theme.typography.codeSm,
    color: theme.colors.onSurface,
    paddingVertical: 0,
  },
});
