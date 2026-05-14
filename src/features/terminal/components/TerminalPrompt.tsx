import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { CommandInput } from '../../../components/inputs/CommandInput';
import { theme } from '../../../theme';

interface TerminalPromptProps {
  promptStr: string;
  onSubmit: (command: string) => void;
}

export const TerminalPrompt: React.FC<TerminalPromptProps> = ({
  promptStr,
  onSubmit,
}) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value);
      setValue('');
    }
  };

  return (
    <View style={styles.container}>
      <CommandInput
        prompt={promptStr}
        value={value}
        onChangeText={setValue}
        onSubmit={handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.s2,
  },
});
