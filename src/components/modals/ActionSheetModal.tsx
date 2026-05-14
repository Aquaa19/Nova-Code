import React from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '../typography/AppText';
import { GlassPanel } from '../panels/GlassPanel';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

export interface ActionItem {
  id: string;
  label: string;
  icon?: string;
  tone?: 'danger' | 'default';
  onPress: () => void;
}

interface ActionSheetModalProps {
  visible: boolean;
  actions: ActionItem[];
  onDismiss: () => void;
}

export const ActionSheetModal: React.FC<ActionSheetModalProps> = ({
  visible,
  actions,
  onDismiss,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <View style={styles.sheetContainer}>
          <GlassPanel style={styles.sheet}>
            <View style={styles.handleBar} />
            {actions.map((action, index) => {
              const color = action.tone === 'danger' ? theme.colors.error : theme.colors.onSurface;
              return (
                <Pressable
                  key={action.id}
                  style={[
                    styles.actionRow,
                    index < actions.length - 1 && styles.borderBottom,
                  ]}
                  onPress={() => {
                    action.onPress();
                    onDismiss();
                  }}
                >
                  {action.icon && (
                    <MaterialCommunityIcons name={action.icon} size={20} color={color} style={styles.icon} />
                  )}
                  <AppText variant="bodyMd" color={color}>
                    {action.label}
                  </AppText>
                </Pressable>
              );
            })}
          </GlassPanel>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    padding: theme.spacing.gutter,
    paddingBottom: theme.spacing.gutter + theme.spacing.safeBottomFallback,
  },
  sheet: {
    padding: 0,
    backgroundColor: theme.colors.surfaceContainerHighest,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.outlineVariant,
    borderRadius: theme.radius.full,
    alignSelf: 'center',
    marginTop: theme.spacing.s3,
    marginBottom: theme.spacing.s1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.s4,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  icon: {
    marginRight: theme.spacing.s3,
  },
});
