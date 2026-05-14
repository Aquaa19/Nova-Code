import React from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '../typography/AppText';
import { GlassPanel } from '../panels/GlassPanel';
import { GlassButton } from '../buttons/GlassButton';
import { theme } from '../../theme';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  tone = 'primary',
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <GlassPanel style={styles.dialog}>
          <AppText variant="headlineMd" style={styles.title}>{title}</AppText>
          <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant} style={styles.message}>
            {message}
          </AppText>
          <View style={styles.buttonRow}>
            <GlassButton label="Cancel" variant="ghost" onPress={onCancel} style={styles.button} />
            <View style={{ width: theme.spacing.s3 }} />
            <GlassButton
              label={confirmLabel}
              variant={tone === 'danger' ? 'danger' : 'primary'}
              onPress={() => {
                onConfirm();
                onCancel();
              }}
              style={styles.button}
            />
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
    alignItems: 'center',
    padding: theme.spacing.gutter,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    padding: theme.spacing.s6,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  title: {
    marginBottom: theme.spacing.s3,
  },
  message: {
    marginBottom: theme.spacing.s6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    minWidth: 80,
  },
});
