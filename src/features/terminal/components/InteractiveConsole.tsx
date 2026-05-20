// src/features/terminal/components/InteractiveConsole.tsx

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  Pressable,
  Dimensions,
  Text,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../../../components/typography/AppText';
import { theme } from '../../../theme';

const { height } = Dimensions.get('window');

interface InteractiveConsoleProps {
  visible: boolean;
  onClose: () => void;
  status: string;
  isExecuting: boolean;
  isNetworkError?: boolean;
  onRetry?: () => void;
  onInput: (data: string) => void;
  onStop: () => void;
  terminalLines: string[];
  outputLines: string[];
  onClear: () => void;
}

export const InteractiveConsole: React.FC<InteractiveConsoleProps> = ({
  visible,
  onClose,
  status,
  isExecuting,
  isNetworkError,
  onRetry,
  onInput,
  onStop,
  terminalLines,
  outputLines,
  onClear,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'output' | 'terminal'>('output');

  const currentLines = activeTab === 'output' ? outputLines : terminalLines;

  // Auto-scroll whenever new lines arrive
  useEffect(() => {
    if (currentLines.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 20);
    }
  }, [currentLines.length]);

  // Reset states when console opens
  useEffect(() => {
    if (visible) {
      setInputText('');
      setActiveTab('output');
    }
  }, [visible]);

  const handleSubmit = useCallback(() => {
    const val = inputText.trim();
    setInputText('');
    if (val) {
      onInput(val + '\n');
    }
  }, [inputText, onInput]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* ── Header & Tabs ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons
                name={isExecuting ? 'cog-sync' : 'console'}
                size={18}
                color={isExecuting ? theme.colors.primaryFixed : theme.colors.onSurfaceVariant}
              />
              <AppText variant="labelLg" style={styles.statusText}>
                {status || 'Output'}
              </AppText>
            </View>

            <View style={styles.tabSwitcher}>
              <Pressable 
                onPress={() => setActiveTab('output')} 
                style={[styles.tab, activeTab === 'output' && styles.activeTab]}
              >
                <Text style={[styles.tabText, activeTab === 'output' && styles.activeTabText]}>Output</Text>
              </Pressable>
              <Pressable 
                onPress={() => setActiveTab('terminal')} 
                style={[styles.tab, activeTab === 'terminal' && styles.activeTab]}
              >
                <Text style={[styles.tabText, activeTab === 'terminal' && styles.activeTabText]}>Terminal</Text>
              </Pressable>
            </View>

            <View style={styles.headerRight}>
              {isExecuting && (
                <Pressable onPress={onStop} style={[styles.actionBtn, styles.stopBtn]}>
                  <MaterialCommunityIcons name="stop" size={14} color={theme.colors.error} />
                  <AppText variant="labelSm" color={theme.colors.error} style={styles.btnText}>
                    Stop
                  </AppText>
                </Pressable>
              )}
              <Pressable onPress={onClear} style={styles.actionBtn}>
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
              </Pressable>
              <Pressable onPress={onClose} style={styles.actionBtn}>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={22}
                  color={theme.colors.onSurfaceVariant}
                />
              </Pressable>
            </View>
          </View>

          {/* ── Network Error Banner ── */}
          {isNetworkError && (
            <View style={styles.errorBanner}>
              <MaterialCommunityIcons name="alert-circle-outline" size={24} color={theme.colors.error} />
              <View style={styles.errorBannerText}>
                <AppText variant="labelSm" color={theme.colors.error}>Network Error / Runtime Unavailable</AppText>
                <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={{ marginTop: 2 }}>
                  Make sure the Execution Engine server is running on the correct URL and Auth Token in Settings.
                </AppText>
              </View>
              {onRetry && (
                <Pressable onPress={onRetry} style={styles.retryBtn}>
                  <AppText variant="labelSm" color={theme.colors.onSurface}>Retry</AppText>
                </Pressable>
              )}
            </View>
          )}

          {/* ── Output Area ── */}
          <ScrollView
            ref={scrollRef}
            style={styles.outputScroll}
            contentContainerStyle={styles.outputContent}
            keyboardShouldPersistTaps="handled"
          >
            {currentLines.length === 0 ? (
              <Text style={styles.placeholder}>
                {activeTab === 'output' ? 'Waiting for output...' : 'Waiting for terminal...'}
              </Text>
            ) : (
              currentLines.map((line, i) => (
                <Text key={i} style={styles.outputLine} selectable>
                  {line || ' '}
                </Text>
              ))
            )}
          </ScrollView>

          {/* ── Interactive Input Row (Terminal Tab Only) ── */}
          {activeTab === 'terminal' && (
            <View style={styles.inputRow}>
              <Text style={styles.prompt}>›</Text>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSubmit}
                blurOnSubmit={false}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                placeholder="Type command..."
                placeholderTextColor="rgba(248,248,242,0.3)"
                returnKeyType="send"
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheetContainer: {
    height: height * 0.55,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    flexDirection: 'column',
    padding: theme.spacing.s3,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(13, 15, 26, 0.97)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.s2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: theme.spacing.s2,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  statusText: { marginLeft: theme.spacing.s2, color: theme.colors.onSurface },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.radius.sm,
    padding: 2,
    marginHorizontal: 12,
  },
  tab: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm - 2,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.onSurfaceVariant,
  },
  activeTabText: {
    color: theme.colors.primaryFixed,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s2, flex: 1, justifyContent: 'flex-end' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.s1,
    borderRadius: theme.radius.sm,
  },
  stopBtn: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: theme.spacing.s2,
  },
  btnText: { marginLeft: 4 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: theme.radius.sm,
    padding: 10,
    marginBottom: 10,
  },
  errorBannerText: { flex: 1, marginHorizontal: 10 },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  outputScroll: { flex: 1, backgroundColor: '#0d0f1a', borderRadius: theme.radius.sm },
  outputContent: { padding: 10, paddingBottom: 4 },
  outputLine: { fontFamily: 'monospace', fontSize: 12.5, lineHeight: 20, color: '#f8f8f2' },
  placeholder: {
    fontFamily: 'monospace',
    fontSize: 12.5,
    color: 'rgba(248,248,242,0.3)',
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: theme.radius.sm,
    marginTop: theme.spacing.s2,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  prompt: { color: '#00f0ff', fontSize: 16, fontWeight: 'bold', marginRight: 8, fontFamily: 'monospace' },
  input: { flex: 1, color: '#f8f8f2', fontFamily: 'monospace', fontSize: 13 },
});