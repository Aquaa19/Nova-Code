// src/screens/SettingsScreen.tsx

import React, { useState, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Switch, 
  Alert,
  TextInput,
  Modal
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { GlassPanel } from '../components/panels/GlassPanel';
import { GlassCard } from '../components/cards/GlassCard';
import { AppText } from '../components/typography/AppText';
import { theme } from '../theme';
import { storage } from '../storage/mmkv';
import { SyncService } from '../services/SyncService';

// Available options for picker modals
const THEME_OPTIONS = ['Liquid Glass', 'Midnight Ocean', 'Cyberpunk', 'Solarized Dark'];
const FONT_OPTIONS  = ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Source Code Pro'];
const TAB_OPTIONS   = ['2 Spaces', '4 Spaces', '8 Spaces', 'Tabs'];

export const SettingsScreen: React.FC = () => {
  const user = auth().currentUser;

  // ── Dynamic state backed by MMKV ──
  const [cloudSync, setCloudSync]       = useState(() => storage.getBoolean('cloudSync') ?? true);
  const [editorTheme, setEditorTheme]   = useState(() => storage.getString('editorTheme') ?? 'Liquid Glass');
  const [editorFont, setEditorFont]     = useState(() => storage.getString('editorFont') ?? 'JetBrains Mono');
  const [tabSize, setTabSize]           = useState(() => storage.getString('tabSize') ?? '4 Spaces');
  const [gitName, setGitName]           = useState(() => storage.getString('gitAuthorName') ?? '');
  const [gitEmail, setGitEmail]         = useState(() => storage.getString('gitAuthorEmail') ?? '');
  const [gitPAT, setGitPAT]            = useState(() => storage.getString('gitPAT') ?? '');

  // Picker modal state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTitle, setPickerTitle]     = useState('');
  const [pickerOptions, setPickerOptions] = useState<string[]>([]);
  const [pickerCurrent, setPickerCurrent] = useState('');
  const [pickerOnSelect, setPickerOnSelect] = useState<((v: string) => void) | null>(null);

  // Git credentials modal
  const [gitModalVisible, setGitModalVisible] = useState(false);
  const [tempGitName, setTempGitName]   = useState('');
  const [tempGitEmail, setTempGitEmail] = useState('');
  const [tempGitPAT, setTempGitPAT]     = useState('');

  // Reload from MMKV whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      setCloudSync(storage.getBoolean('cloudSync') ?? true);
      setEditorTheme(storage.getString('editorTheme') ?? 'Liquid Glass');
      setEditorFont(storage.getString('editorFont') ?? 'JetBrains Mono');
      setTabSize(storage.getString('tabSize') ?? '4 Spaces');
      setGitName(storage.getString('gitAuthorName') ?? '');
      setGitEmail(storage.getString('gitAuthorEmail') ?? '');
      setGitPAT(storage.getString('gitPAT') ?? '');
    }, [])
  );

  // ── Persist helpers ──
  const persist = (key: string, value: string | boolean) => {
    if (typeof value === 'boolean') {
      storage.set(key, value);
    } else {
      storage.set(key, value);
    }
    // Push to cloud if sync is on
    if (cloudSync) {
      SyncService.pushSettingsToCloud().catch(() => {});
    }
  };

  const handleCloudSyncToggle = (val: boolean) => {
    setCloudSync(val);
    persist('cloudSync', val);
  };

  // ── Picker opener ──
  const openPicker = (title: string, options: string[], current: string, onSelect: (v: string) => void) => {
    setPickerTitle(title);
    setPickerOptions(options);
    setPickerCurrent(current);
    setPickerOnSelect(() => onSelect);
    setPickerVisible(true);
  };

  const handlePickerSelect = (value: string) => {
    pickerOnSelect?.(value);
    setPickerVisible(false);
  };

  // ── Git credentials ──
  const openGitModal = () => {
    setTempGitName(gitName);
    setTempGitEmail(gitEmail);
    setTempGitPAT(gitPAT);
    setGitModalVisible(true);
  };

  const saveGitCredentials = () => {
    setGitName(tempGitName);
    setGitEmail(tempGitEmail);
    setGitPAT(tempGitPAT);
    persist('gitAuthorName', tempGitName);
    persist('gitAuthorEmail', tempGitEmail);
    persist('gitPAT', tempGitPAT);
    setGitModalVisible(false);
    Alert.alert('Saved', 'Git credentials updated.');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => auth().signOut() },
      ]
    );
  };

  // ── Reusable row ──
  const renderSettingItem = (icon: string, label: string, value?: string, onPress?: () => void) => (
    <Pressable onPress={onPress}>
      <GlassCard padding="s3" style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primaryFixed} />
          </View>
          <AppText variant="bodyMd">{label}</AppText>
        </View>
        <View style={styles.settingRight}>
          {value && <AppText variant="labelXs" color={theme.colors.primaryFixed} style={{ marginRight: 4 }}>{value}</AppText>}
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
        </View>
      </GlassCard>
    </Pressable>
  );

  // ── UI ──
  return (
    <ScreenContainer withHeader={false} backgroundVariant="search">
      <AppHeader title="Settings" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Profile ── */}
        <GlassPanel style={styles.profilePanel}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarFallback}>
              <AppText variant="headlineMd" color={theme.colors.primaryFixed}>
                {(user?.displayName || user?.email || 'N')[0].toUpperCase()}
              </AppText>
            </View>
            <View style={styles.onlineBadge} />
          </View>

          <View style={styles.profileInfo}>
            <AppText variant="headlineMd">{user?.displayName || 'Nova Developer'}</AppText>
            <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant} style={{ marginTop: 4 }}>
              {user?.email}
            </AppText>
          </View>
        </GlassPanel>

        {/* ── Git Profile ── */}
        <View style={styles.section}>
          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.sectionTitle}>GIT PROFILE</AppText>
          {renderSettingItem('github', 'Author Name', gitName || 'Not set', openGitModal)}
          {renderSettingItem('email-outline', 'Author Email', gitEmail || 'Not set', openGitModal)}
          {renderSettingItem('key-outline', 'Personal Access Token', gitPAT ? '••••••' : 'Not set', openGitModal)}
        </View>

        {/* ── System ── */}
        <View style={styles.section}>
          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.sectionTitle}>SYSTEM</AppText>
          <GlassCard padding="s3" style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="cloud-sync" size={20} color={theme.colors.primaryFixed} />
              </View>
              <AppText variant="bodyMd">Cloud Sync</AppText>
            </View>
            <Switch 
              value={cloudSync} 
              onValueChange={handleCloudSyncToggle} 
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.primaryFixed }}
              thumbColor={theme.colors.onSurface}
            />
          </GlassCard>
        </View>

        {/* ── Editor Preferences ── */}
        <View style={styles.section}>
          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.sectionTitle}>EDITOR PREFERENCES</AppText>
          <View style={styles.grid}>
            <Pressable style={styles.gridItem} onPress={() => openPicker('Theme', THEME_OPTIONS, editorTheme, (v) => { setEditorTheme(v); persist('editorTheme', v); })}>
              <GlassCard padding="s3" style={styles.preferenceCard}>
                <MaterialCommunityIcons name="palette-outline" size={24} color={theme.colors.primaryFixed} />
                <AppText variant="bodyMd" style={styles.prefLabel}>Theme</AppText>
                <AppText variant="labelXs" color={theme.colors.primaryFixed}>{editorTheme}</AppText>
              </GlassCard>
            </Pressable>
            <Pressable style={styles.gridItem} onPress={() => openPicker('Font', FONT_OPTIONS, editorFont, (v) => { setEditorFont(v); persist('editorFont', v); })}>
              <GlassCard padding="s3" style={styles.preferenceCard}>
                <MaterialCommunityIcons name="format-text" size={24} color={theme.colors.primaryFixed} />
                <AppText variant="bodyMd" style={styles.prefLabel}>Font</AppText>
                <AppText variant="labelXs" color={theme.colors.primaryFixed}>{editorFont}</AppText>
              </GlassCard>
            </Pressable>
            <Pressable style={styles.gridItem} onPress={() => openPicker('Tab Size', TAB_OPTIONS, tabSize, (v) => { setTabSize(v); persist('tabSize', v); })}>
              <GlassCard padding="s3" style={styles.preferenceCard}>
                <MaterialCommunityIcons name="keyboard-tab" size={24} color={theme.colors.primaryFixed} />
                <AppText variant="bodyMd" style={styles.prefLabel}>Tab Size</AppText>
                <AppText variant="labelXs" color={theme.colors.primaryFixed}>{tabSize}</AppText>
              </GlassCard>
            </Pressable>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
            <MaterialCommunityIcons name="logout" size={20} color={theme.colors.error} />
            <AppText variant="labelXs" color={theme.colors.error} style={styles.signOutText}>Sign Out</AppText>
          </Pressable>
          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.versionText}>
            NOVA CODE v2.4.0
          </AppText>
        </View>
      </ScrollView>

      {/* ═══════ Picker Modal ═══════ */}
      <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <GlassPanel style={styles.modalPanel}>
            <AppText variant="headlineMd" style={styles.modalTitle}>{pickerTitle}</AppText>
            {pickerOptions.map((option) => (
              <Pressable
                key={option}
                style={[styles.optionRow, option === pickerCurrent && styles.optionRowActive]}
                onPress={() => handlePickerSelect(option)}
              >
                <AppText variant="bodyMd" color={option === pickerCurrent ? theme.colors.primaryFixed : theme.colors.onSurface}>
                  {option}
                </AppText>
                {option === pickerCurrent && (
                  <MaterialCommunityIcons name="check" size={20} color={theme.colors.primaryFixed} />
                )}
              </Pressable>
            ))}
            <Pressable style={styles.modalCancel} onPress={() => setPickerVisible(false)}>
              <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant}>Cancel</AppText>
            </Pressable>
          </GlassPanel>
        </View>
      </Modal>

      {/* ═══════ Git Credentials Modal ═══════ */}
      <Modal visible={gitModalVisible} transparent animationType="fade" onRequestClose={() => setGitModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <GlassPanel style={styles.modalPanel}>
            <AppText variant="headlineMd" style={styles.modalTitle}>Git Credentials</AppText>

            <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.inputLabel}>AUTHOR NAME</AppText>
            <TextInput
              style={styles.modalInput}
              value={tempGitName}
              onChangeText={setTempGitName}
              placeholder="John Doe"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />

            <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.inputLabel}>AUTHOR EMAIL</AppText>
            <TextInput
              style={styles.modalInput}
              value={tempGitEmail}
              onChangeText={setTempGitEmail}
              placeholder="john@example.com"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.inputLabel}>PERSONAL ACCESS TOKEN</AppText>
            <TextInput
              style={styles.modalInput}
              value={tempGitPAT}
              onChangeText={setTempGitPAT}
              placeholder="ghp_xxxxxxxxxxxx"
              placeholderTextColor="rgba(255,255,255,0.3)"
              autoCapitalize="none"
              secureTextEntry
            />

            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setGitModalVisible(false)}>
                <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant}>Cancel</AppText>
              </Pressable>
              <Pressable style={styles.modalSaveBtn} onPress={saveGitCredentials}>
                <AppText variant="bodyMd" color={theme.colors.background}>Save</AppText>
              </Pressable>
            </View>
          </GlassPanel>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: theme.spacing.gutter,
    paddingBottom: 40,
  },
  profilePanel: {
    padding: theme.spacing.s6,
    alignItems: 'center',
    marginBottom: theme.spacing.s6,
  },
  profileHeader: {
    position: 'relative',
    marginBottom: theme.spacing.s4,
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: 'rgba(125,244,255,0.3)',
    backgroundColor: 'rgba(125,244,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#52ffac',
    borderWidth: 3,
    borderColor: 'rgba(17, 19, 28, 1)',
    elevation: 4,
  },
  profileInfo: {
    alignItems: 'center',
  },
  section: {
    marginBottom: theme.spacing.s6,
  },
  sectionTitle: {
    marginBottom: theme.spacing.s3,
    letterSpacing: 1.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.s2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.s4,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.s2,
  },
  gridItem: {
    width: '33.33%',
    paddingHorizontal: theme.spacing.s2,
  },
  preferenceCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.s4,
  },
  prefLabel: {
    marginTop: theme.spacing.s2,
    marginBottom: 4,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.s4,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,180,171,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,180,171,0.2)',
    marginBottom: theme.spacing.s6,
    width: '100%',
  },
  signOutText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  versionText: {
    opacity: 0.3,
    letterSpacing: 2,
  },
  // ── Modal styles ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: theme.spacing.gutter,
  },
  modalPanel: {
    padding: theme.spacing.s6,
    borderRadius: 20,
  },
  modalTitle: {
    marginBottom: theme.spacing.s4,
    textAlign: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.s4,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionRowActive: {
    backgroundColor: 'rgba(125,244,255,0.08)',
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: theme.spacing.s2,
  },
  inputLabel: {
    letterSpacing: 1,
    marginBottom: theme.spacing.s2,
    marginTop: theme.spacing.s3,
  },
  modalInput: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: theme.colors.onSurface,
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s3,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: theme.spacing.s6,
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalSaveBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryFixed,
  },
});
