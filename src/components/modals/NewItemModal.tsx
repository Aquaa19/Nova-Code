// src/components/modals/NewItemModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TextInput, Pressable } from 'react-native';
import { AppText } from '../typography/AppText';
import { GlassPanel } from '../panels/GlassPanel';
import { theme } from '../../theme';

export type NewItemMode = 'file' | 'folder' | 'rename' | null;

interface NewItemModalProps {
  visible: boolean;
  mode: NewItemMode;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export const NewItemModal: React.FC<NewItemModalProps> = ({
  visible,
  mode,
  initialValue = '',
  onSubmit,
  onCancel,
}) => {
  const [value, setValue] = useState(initialValue);

  // Reset local state when modal opens
  useEffect(() => {
    if (visible) {
      setValue(initialValue);
    }
  }, [visible, initialValue]);

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'file': return 'Create New File';
      case 'folder': return 'Create New Folder';
      case 'rename': return 'Rename Item';
      default: return '';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <GlassPanel style={styles.panel}>
          <AppText variant="headlineMd" style={styles.title}>{getTitle()}</AppText>
          
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder={mode === 'folder' ? 'Folder name...' : 'File name (e.g., index.ts)...'}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleSubmit}
          />
          
          <View style={styles.actionRow}>
            <Pressable style={styles.button} onPress={onCancel}>
              <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant}>Cancel</AppText>
            </Pressable>
            <Pressable 
              style={[styles.button, styles.submitButton, !value.trim() && styles.submitDisabled]} 
              onPress={handleSubmit}
              disabled={!value.trim()}
            >
              <AppText variant="bodyMd" color={theme.colors.surfaceContainerLowest}>Confirm</AppText>
            </Pressable>
          </View>
        </GlassPanel>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: theme.spacing.gutter,
  },
  panel: {
    padding: theme.spacing.gutter,
  },
  title: {
    marginBottom: theme.spacing.s4,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.radius.sm,
    color: theme.colors.onSurface,
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s2,
    fontSize: 16,
    marginBottom: theme.spacing.s4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.s3,
  },
  button: {
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s2,
    borderRadius: theme.radius.sm,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  submitDisabled: {
    opacity: 0.5,
  },
});