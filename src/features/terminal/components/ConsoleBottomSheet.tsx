// src/features/terminal/components/ConsoleBottomSheet.tsx

import React from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView, TextInput, ActivityIndicator, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../../../components/typography/AppText';
import { GlassPanel } from '../../../components/panels/GlassPanel';
import { CodeText } from '../../../components/typography/CodeText';
import { theme } from '../../../theme';

interface ConsoleBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  output: string;
  isExecuting: boolean;
  stdin: string;
  setStdin: (val: string) => void;
  onRun: () => void;
}

export const ConsoleBottomSheet: React.FC<ConsoleBottomSheetProps> = ({
  visible,
  onClose,
  output,
  isExecuting,
  stdin,
  setStdin,
  onRun,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <GlassPanel style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="console" size={20} color={theme.colors.primaryFixed} />
              <AppText variant="headlineMd" style={styles.title}>Console Output</AppText>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.onSurfaceVariant} />
            </Pressable>
          </View>

          {/* Stdin Input Bar */}
          <View style={styles.stdinContainer}>
            <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.stdinLabel}>
              Standard Input (stdin)
            </AppText>
            <View style={styles.stdinRow}>
              <TextInput
                style={styles.input}
                value={stdin}
                onChangeText={setStdin}
                placeholder="Type input here before running..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                autoCapitalize="none"
              />
              <Pressable 
                style={[styles.runButton, isExecuting && styles.runButtonDisabled]} 
                onPress={onRun}
                disabled={isExecuting}
              >
                {isExecuting ? (
                  <ActivityIndicator size="small" color={theme.colors.background} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="play" size={16} color={theme.colors.background} />
                    <AppText variant="bodyMd" color={theme.colors.background} style={styles.runText}>
                      Run
                    </AppText>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          {/* Output Area */}
          <View style={styles.outputContainer}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              {output === '' && !isExecuting ? (
                <AppText color={theme.colors.onSurfaceVariant} style={styles.emptyText}>
                  Ready to execute. Output will appear here.
                </AppText>
              ) : (
                <CodeText color={theme.colors.onSurface} style={styles.outputText}>
                  {output}
                </CodeText>
              )}
            </ScrollView>
          </View>
        </GlassPanel>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)', // Very light backdrop so editor is still visible
  },
  sheetContainer: {
    height: '55%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: theme.spacing.s4,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: theme.spacing.s2,
  },
  closeBtn: {
    padding: theme.spacing.s1,
  },
  stdinContainer: {
    marginBottom: theme.spacing.s4,
  },
  stdinLabel: {
    marginBottom: theme.spacing.s1,
  },
  stdinRow: {
    flexDirection: 'row',
    gap: theme.spacing.s2,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.radius.sm,
    color: theme.colors.onSurface,
    paddingHorizontal: theme.spacing.s3,
    height: 40,
    fontSize: 14,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), // Monospace for console feel
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryFixed,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.s4,
    height: 40,
  },
  runButtonDisabled: {
    opacity: 0.6,
  },
  runText: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
  outputContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.s3,
  },
  outputText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: theme.spacing.s4,
  },
});
