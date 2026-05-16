// src/screens/SettingsScreen.tsx

import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Switch, 
  Alert,
  TextInput
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { GlassPanel } from '../components/panels/GlassPanel';
import { GlassCard } from '../components/cards/GlassCard';
import { AppText } from '../components/typography/AppText';
import { theme } from '../theme';
import { useSettingsStore } from '../store/useSettingsStore';

export const SettingsScreen: React.FC = () => {
  const user = auth().currentUser;
  const settings = useSettingsStore();

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

  const renderPreferenceItem = (icon: string, label: string, value: string) => (
    <GlassCard padding="s3" style={styles.preferenceCard}>
      <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primaryFixed} />
      <AppText variant="labelSm" style={styles.prefLabel}>{label}</AppText>
      <AppText variant="labelXs" color={theme.colors.primaryFixed}>{value}</AppText>
    </GlassCard>
  );

  const renderGitField = (icon: string, label: string, value: string, key: keyof typeof settings, secure = false) => (
    <GlassCard padding="s3" style={styles.gitCard}>
      <View style={styles.gitRow}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primaryFixed} />
        </View>
        <View style={styles.gitContent}>
          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.gitLabel}>{label}</AppText>
          <TextInput
            style={styles.gitInput}
            value={value}
            onChangeText={(val) => settings.update({ [key]: val })}
            placeholder={label}
            placeholderTextColor="rgba(255,255,255,0.2)"
            secureTextEntry={secure}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>
    </GlassCard>
  );

  return (
    <ScreenContainer withHeader={false} backgroundVariant="search">
      <View style={styles.header}>
        <AppText variant="headlineMd">Settings</AppText>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Profile ── */}
        <GlassPanel style={styles.profilePanel}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarFallback}>
              <AppText variant="displayLg" color={theme.colors.primaryFixed}>
                {(user?.displayName || user?.email || 'N')[0].toUpperCase()}
              </AppText>
            </View>
            <View style={styles.onlineBadge} />
          </View>

          <View style={styles.profileInfo}>
            <AppText variant="headlineSm">{user?.displayName || 'Nova Developer'}</AppText>
            <AppText variant="bodySm" color={theme.colors.onSurfaceVariant} style={{ marginTop: 4 }}>
              {user?.email}
            </AppText>
          </View>
        </GlassPanel>

        {/* ── Execution Engine ── */}
        <View style={styles.section}>
          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.sectionTitle}>EXECUTION ENGINE</AppText>
          <GlassCard padding="s4" style={styles.engineCard}>
            <View style={styles.inputGroup}>
              <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.inputLabel}>ENGINE URL (WS)</AppText>
              <TextInput
                style={styles.settingsInput}
                value={settings.engineUrl}
                onChangeText={(val) => settings.update({ engineUrl: val })}
                placeholder="ws://192.168.1.100:3000"
                placeholderTextColor="rgba(255,255,255,0.2)"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            <View style={[styles.inputGroup, { marginTop: theme.spacing.s4 }]}>
              <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.inputLabel}>AUTH TOKEN</AppText>
              <TextInput
                style={styles.settingsInput}
                value={settings.engineAuthToken}
                onChangeText={(val) => settings.update({ engineAuthToken: val })}
                placeholder="your-secret-token"
                placeholderTextColor="rgba(255,255,255,0.2)"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </GlassCard>
        </View>

        {/* ── Git Profile ── */}
        <View style={styles.section}>
          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.sectionTitle}>GIT PROFILE</AppText>
          {renderGitField('account-outline', 'AUTHOR NAME', settings.gitAuthorName, 'gitAuthorName')}
          {renderGitField('email-outline', 'AUTHOR EMAIL', settings.gitAuthorEmail, 'gitAuthorEmail')}
          {renderGitField('key-outline', 'PERSONAL ACCESS TOKEN', settings.gitPAT, 'gitPAT', true)}
        </View>

        {/* ── Editor Preferences ── */}
        <View style={styles.section}>
          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.sectionTitle}>EDITOR PREFERENCES</AppText>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              {renderPreferenceItem('palette-outline', 'Theme', 'Liquid Glass')}
            </View>
            <View style={styles.gridItem}>
              {renderPreferenceItem('format-text', 'Font Size', `${settings.fontSize}px`)}
            </View>
            <View style={styles.gridItem}>
              {renderPreferenceItem('keyboard-tab', 'Tab Size', `${settings.tabWidth} Spaces`)}
            </View>
          </View>
        </View>

        {/* ── Autosave ── */}
        <View style={styles.section}>
          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.sectionTitle}>AUTOSAVE</AppText>
          <GlassCard padding="s3" style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="content-save-cog-outline" size={20} color={theme.colors.primaryFixed} />
              </View>
              <View style={{ marginLeft: theme.spacing.s3 }}>
                <AppText variant="bodyMd">Auto Save</AppText>
                <AppText variant="labelXs" color={theme.colors.onSurfaceVariant}>Save after typing stops</AppText>
              </View>
            </View>
            <Switch
              value={settings.autosaveEnabled}
              onValueChange={(val) => settings.update({ autosaveEnabled: val })}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.primaryFixed }}
              thumbColor={theme.colors.onSurface}
            />
          </GlassCard>

          {settings.autosaveEnabled && (
            <GlassCard padding="s3" style={[styles.settingItem, { marginTop: theme.spacing.s2 }]}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="timer-outline" size={20} color={theme.colors.primaryFixed} />
                </View>
                <View style={{ marginLeft: theme.spacing.s3 }}>
                  <AppText variant="bodyMd">Delay</AppText>
                  <AppText variant="labelXs" color={theme.colors.onSurfaceVariant}>Seconds after last keystroke</AppText>
                </View>
              </View>
              <TextInput
                style={styles.delayInput}
                value={String(settings.autosaveDelayMs / 1000)}
                onChangeText={(val) => {
                  const ms = Math.max(0.5, parseFloat(val) || 1) * 1000;
                  settings.update({ autosaveDelayMs: ms });
                }}
                keyboardType="decimal-pad"
                placeholderTextColor="rgba(255,255,255,0.3)"
                selectTextOnFocus
              />
            </GlassCard>
          )}
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
              value={settings.wordWrap} 
              onValueChange={(val) => settings.update({ wordWrap: val })} 
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.primaryFixed }}
              thumbColor={theme.colors.onSurface}
            />
          </GlassCard>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
            <MaterialCommunityIcons name="logout" size={20} color={theme.colors.error} />
            <AppText variant="labelSm" color={theme.colors.error} style={styles.signOutText}>Sign Out</AppText>
          </Pressable>
          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.versionText}>
            NOVA CODE v2.5.0
          </AppText>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: theme.spacing.safeTopFallback + theme.spacing.s2,
    paddingHorizontal: theme.spacing.gutter,
    paddingBottom: theme.spacing.s4,
    backgroundColor: 'rgba(17, 19, 28, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  scrollContent: {
    padding: theme.spacing.gutter,
    paddingBottom: 100,
  },
  profilePanel: {
    paddingVertical: theme.spacing.s8,
    alignItems: 'center',
    marginBottom: theme.spacing.s6,
  },
  profileHeader: {
    width: 100,
    height: 100,
    position: 'relative',
    marginBottom: theme.spacing.s4,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#52ffac',
    borderWidth: 4,
    borderColor: 'rgba(17, 19, 28, 1)',
  },
  profileInfo: {
    alignItems: 'center',
  },
  section: {
    marginBottom: theme.spacing.s8,
  },
  sectionTitle: {
    marginBottom: theme.spacing.s3,
    letterSpacing: 2,
    opacity: 0.6,
  },
  engineCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  inputGroup: {
    width: '100%',
  },
  inputLabel: {
    marginBottom: theme.spacing.s2,
    opacity: 0.5,
  },
  settingsInput: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s3,
    color: theme.colors.onSurface,
    ...theme.typography.codeSm,
  },
  gitCard: {
    marginBottom: theme.spacing.s2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  gitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gitContent: {
    flex: 1,
    marginLeft: theme.spacing.s4,
  },
  gitLabel: {
    opacity: 0.4,
    marginBottom: 2,
  },
  gitInput: {
    color: theme.colors.onSurface,
    fontSize: 15,
    padding: 0, // Remove default padding to align with label
  },
  grid: {
    flexDirection: 'row',
    marginHorizontal: -theme.spacing.s2,
  },
  gridItem: {
    flex: 1,
    paddingHorizontal: theme.spacing.s2,
  },
  preferenceCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.s4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  prefLabel: {
    marginTop: theme.spacing.s2,
    marginBottom: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  delayInput: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s2,
    color: theme.colors.primaryFixed,
    fontFamily: 'monospace',
    fontSize: 16,
    width: 60,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.s4,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255,107,107,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.15)',
    marginBottom: theme.spacing.s6,
    width: '100%',
  },
  signOutText: {
    marginLeft: 10,
  },
  versionText: {
    opacity: 0.2,
    letterSpacing: 3,
  },
});
