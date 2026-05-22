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
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { GlassPanel } from '../components/panels/GlassPanel';
import { GlassCard } from '../components/cards/GlassCard';
import { AppText } from '../components/typography/AppText';
import { IconButton } from '../components/buttons/IconButton';
import { theme } from '../theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { AuthService } from '../services/AuthService';

export const SettingsScreen: React.FC = () => {
  const user = AuthService.getCurrentUser();
  const settings = useSettingsStore();

  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState({
    engineUrl: settings.engineUrl,
    engineAuthToken: settings.engineAuthToken,
    gitAuthorName: settings.gitAuthorName,
    gitAuthorEmail: settings.gitAuthorEmail,
    gitPAT: settings.gitPAT,
  });
  const [showAuthToken, setShowAuthToken] = React.useState(false);
  const [showGitPAT, setShowGitPAT] = React.useState(false);

  // Sync draft from settings when not editing (handles cloud sync updates)
  React.useEffect(() => {
    if (!isEditing) {
      setDraft({
        engineUrl: settings.engineUrl,
        engineAuthToken: settings.engineAuthToken,
        gitAuthorName: settings.gitAuthorName,
        gitAuthorEmail: settings.gitAuthorEmail,
        gitPAT: settings.gitPAT,
      });
    }
  }, [
    settings.engineUrl,
    settings.engineAuthToken,
    settings.gitAuthorName,
    settings.gitAuthorEmail,
    settings.gitPAT,
    isEditing
  ]);

  const hasChanges = React.useMemo(() => {
    return draft.engineUrl !== settings.engineUrl ||
           draft.engineAuthToken !== settings.engineAuthToken ||
           draft.gitAuthorName !== settings.gitAuthorName ||
           draft.gitAuthorEmail !== settings.gitAuthorEmail ||
           draft.gitPAT !== settings.gitPAT;
  }, [draft, settings]);

  // Keep transient store state synced so navigation blocking works
  React.useEffect(() => {
    settings.setHasUnsavedChanges(isEditing && hasChanges);
    return () => {
      settings.setHasUnsavedChanges(false);
    };
  }, [isEditing, hasChanges]);

  const { host: currentHost, port: currentPort } = React.useMemo(() => {
    const url = draft.engineUrl || '';
    const cleanUrl = url.replace(/^(ws:\/\/|wss:\/\/|http:\/\/|https:\/\/)/, '');
    const parts = cleanUrl.split(':');
    return {
      host: parts[0] || '',
      port: parts[1] || '3000'
    };
  }, [draft.engineUrl]);

  const handleHostChange = (text: string) => {
    let formatted = text;
    // Auto placement of dots if they enter numeric IP parts
    const isIP = /^[0-9.]*$/.test(text);
    if (isIP) {
      let cleaned = text.replace(/[^0-9.]/g, '');
      const parts = cleaned.split('.');
      
      const lastPart = parts[parts.length - 1];
      if (lastPart && lastPart.length === 3 && parts.length < 4 && !text.endsWith('.')) {
        cleaned = cleaned + '.';
      }
      formatted = cleaned;
    }
    setDraft(prev => ({ ...prev, engineUrl: `ws://${formatted}:${currentPort}` }));
  };

  const handleSavePress = () => {
    Alert.alert(
      'Save Settings',
      'Are you sure you want to save these changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: () => {
            settings.update(draft);
            setIsEditing(false);
            settings.setHasUnsavedChanges(false);
            Alert.alert('Success', 'Settings saved successfully!');
          } 
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await AuthService.signOut();
            } catch (e: any) {
              Alert.alert('Error', 'Sign out failed: ' + e.message);
            }
          } 
        },
      ]
    );
  };

  const renderGitField = (icon: string, label: string, value: string, key: 'gitAuthorName' | 'gitAuthorEmail' | 'gitPAT', secure = false) => {
    const isSecurePAT = secure && key === 'gitPAT';
    return (
      <GlassCard padding="s3" style={styles.gitCard}>
        <View style={styles.gitRow}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primaryFixed} />
          </View>
          <View style={styles.gitContent}>
            <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.gitLabel}>{label}</AppText>
            <View style={isSecurePAT ? styles.secureGitInputContainer : null}>
              <TextInput
                style={[
                  styles.gitInput,
                  !isEditing && { opacity: 0.6 },
                  isSecurePAT && { flex: 1 }
                ]}
                value={value}
                onChangeText={(val) => setDraft(prev => ({ ...prev, [key]: val }))}
                placeholder={label}
                placeholderTextColor="rgba(255,255,255,0.2)"
                secureTextEntry={isSecurePAT ? !showGitPAT : secure}
                autoCapitalize="none"
                autoCorrect={false}
                editable={isEditing}
              />
              {isSecurePAT && (
                <IconButton
                  icon={showGitPAT ? 'eye-off-outline' : 'eye-outline'}
                  size={16}
                  onPress={() => setShowGitPAT(prev => !prev)}
                  style={{ paddingHorizontal: theme.spacing.s2 }}
                />
              )}
            </View>
          </View>
        </View>
      </GlassCard>
    );
  };

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

        {/* ── Lock / Edit Banner ── */}
        <GlassCard padding="s3" style={styles.controlBanner}>
          <View style={styles.bannerRow}>
            <View style={styles.bannerLeft}>
              <MaterialCommunityIcons 
                name={isEditing ? 'pencil-lock-outline' : 'shield-check-outline'} 
                size={22} 
                color={isEditing ? '#ffa500' : theme.colors.primaryFixed} 
              />
              <View style={{ marginLeft: theme.spacing.s3 }}>
                <AppText variant="bodyMd" style={{ fontWeight: 'bold' }}>
                  {isEditing ? 'Settings Unlocked' : 'Settings Locked'}
                </AppText>
                <AppText variant="labelXs" color={theme.colors.onSurfaceVariant}>
                  {isEditing ? 'You have unsaved changes' : 'Edit to modify engine or git profile'}
                </AppText>
              </View>
            </View>
            <View style={styles.bannerRight}>
              {!isEditing ? (
                <Pressable style={styles.editBtn} onPress={() => setIsEditing(true)}>
                  <AppText variant="labelXs" style={{ fontWeight: 'bold' }} color="#000">EDIT</AppText>
                </Pressable>
              ) : (
                <View style={{ flexDirection: 'row' }}>
                  <Pressable 
                    style={[styles.bannerBtn, styles.cancelBtn]} 
                    onPress={() => {
                      setIsEditing(false);
                      settings.setHasUnsavedChanges(false);
                    }}
                  >
                    <AppText variant="labelXs" style={{ fontWeight: 'bold' }} color={theme.colors.onSurfaceVariant}>CANCEL</AppText>
                  </Pressable>
                  <Pressable 
                    style={[styles.bannerBtn, styles.saveBtn, !hasChanges && { opacity: 0.5 }]} 
                    disabled={!hasChanges}
                    onPress={handleSavePress}
                  >
                    <AppText variant="labelXs" style={{ fontWeight: 'bold' }} color="#000">SAVE</AppText>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </GlassCard>

        {/* ── Execution Engine ── */}
        <View style={styles.section}>
          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.sectionTitle}>EXECUTION ENGINE</AppText>
          <GlassCard padding="s4" style={styles.engineCard}>
            <View style={styles.inputGroup}>
              <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.inputLabel}>ENGINE HOST IP</AppText>
              <View style={styles.urlInputContainer}>
                <View style={styles.urlPrefixContainer}>
                  <AppText variant="labelXs" style={styles.urlPrefixText}>ws://</AppText>
                </View>
                <TextInput
                  style={[styles.urlHostInput, !isEditing && { opacity: 0.6 }]}
                  value={currentHost}
                  onChangeText={handleHostChange}
                  placeholder="54.146.249.216"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  keyboardType="decimal-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={isEditing}
                />
                <View style={styles.urlSuffixContainer}>
                  <AppText variant="labelXs" style={styles.urlSuffixText}>{`:${currentPort}`}</AppText>
                </View>
              </View>
            </View>
            
            <View style={[styles.inputGroup, { marginTop: theme.spacing.s4 }]}>
              <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.inputLabel}>AUTH TOKEN</AppText>
              <View style={styles.secureInputContainer}>
                <TextInput
                  style={[styles.secureTextInput, !isEditing && { opacity: 0.6 }]}
                  value={draft.engineAuthToken}
                  onChangeText={(val) => setDraft(prev => ({ ...prev, engineAuthToken: val }))}
                  placeholder="your-secret-token"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  secureTextEntry={!showAuthToken}
                  autoCapitalize="none"
                  editable={isEditing}
                />
                <IconButton
                  icon={showAuthToken ? 'eye-off-outline' : 'eye-outline'}
                  size={16}
                  onPress={() => setShowAuthToken(prev => !prev)}
                  style={styles.eyeBtn}
                />
              </View>
            </View>
          </GlassCard>
        </View>

        {/* ── Git Profile ── */}
        <View style={styles.section}>
          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.sectionTitle}>GIT PROFILE</AppText>
          {renderGitField('account-outline', 'AUTHOR NAME', draft.gitAuthorName, 'gitAuthorName')}
          {renderGitField('email-outline', 'AUTHOR EMAIL', draft.gitAuthorEmail, 'gitAuthorEmail')}
          {renderGitField('key-outline', 'PERSONAL ACCESS TOKEN', draft.gitPAT, 'gitPAT', true)}
        </View>

        {/* ── Editor Preferences ── */}
        <View style={styles.section}>
          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.sectionTitle}>EDITOR PREFERENCES</AppText>
          
          {/* Theme */}
          <GlassCard padding="s3" style={[styles.settingItem, { marginBottom: theme.spacing.s2 }]}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="theme-light-dark" size={20} color={theme.colors.primaryFixed} />
              </View>
              <View style={{ marginLeft: theme.spacing.s3 }}>
                <AppText variant="bodyMd">Dark Theme</AppText>
              </View>
            </View>
            <Switch 
              value={settings.theme === 'dark'} 
              onValueChange={(val) => settings.update({ theme: val ? 'dark' : 'light' })} 
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.primaryFixed }}
              thumbColor={theme.colors.onSurface}
            />
          </GlassCard>

          {/* Font Size */}
          <GlassCard padding="s3" style={[styles.settingItem, { marginBottom: theme.spacing.s2 }]}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="format-size" size={20} color={theme.colors.primaryFixed} />
              </View>
              <View style={{ marginLeft: theme.spacing.s3 }}>
                <AppText variant="bodyMd">Font Size</AppText>
              </View>
            </View>
            <View style={styles.modifierRow}>
              <IconButton icon="minus" size={16} onPress={() => settings.update({ fontSize: Math.max(8, settings.fontSize - 1) })} />
              <AppText variant="bodyMd" style={{ marginHorizontal: 8, width: 24, textAlign: 'center' }}>{settings.fontSize}</AppText>
              <IconButton icon="plus" size={16} onPress={() => settings.update({ fontSize: Math.min(32, settings.fontSize + 1) })} />
            </View>
          </GlassCard>

          {/* Tab Size */}
          <GlassCard padding="s3" style={[styles.settingItem, { marginBottom: theme.spacing.s2 }]}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="keyboard-tab" size={20} color={theme.colors.primaryFixed} />
              </View>
              <View style={{ marginLeft: theme.spacing.s3 }}>
                <AppText variant="bodyMd">Tab Size</AppText>
              </View>
            </View>
            <View style={styles.modifierRow}>
              <Pressable 
                style={[styles.togglePill, settings.tabWidth === 2 && styles.togglePillActive]} 
                onPress={() => settings.update({ tabWidth: 2 })}
              >
                <AppText variant="labelSm" color={settings.tabWidth === 2 ? '#000' : theme.colors.onSurfaceVariant}>2</AppText>
              </Pressable>
              <Pressable 
                style={[styles.togglePill, settings.tabWidth === 4 && styles.togglePillActive]} 
                onPress={() => settings.update({ tabWidth: 4 })}
              >
                <AppText variant="labelSm" color={settings.tabWidth === 4 ? '#000' : theme.colors.onSurfaceVariant}>4</AppText>
              </Pressable>
            </View>
          </GlassCard>

          {/* Line Numbers */}
          <GlassCard padding="s3" style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="format-list-numbered" size={20} color={theme.colors.primaryFixed} />
              </View>
              <View style={{ marginLeft: theme.spacing.s3 }}>
                <AppText variant="bodyMd">Line Numbers</AppText>
              </View>
            </View>
            <Switch 
              value={settings.lineNumbers} 
              onValueChange={(val) => settings.update({ lineNumbers: val })} 
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.primaryFixed }}
              thumbColor={theme.colors.onSurface}
            />
          </GlassCard>
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
                <MaterialCommunityIcons name="format-text-wrapping" size={20} color={theme.colors.primaryFixed} />
              </View>
              <View style={{ marginLeft: theme.spacing.s3 }}>
                 <AppText variant="bodyMd">Word Wrap</AppText>
              </View>
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
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
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
  modifierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: theme.radius.sm,
    padding: 4,
  },
  togglePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  togglePillActive: {
    backgroundColor: theme.colors.primaryFixed,
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
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  urlPrefixContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s3,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
  },
  urlPrefixText: {
    color: theme.colors.primaryFixed,
    fontWeight: 'bold',
  },
  urlHostInput: {
    flex: 1,
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s3,
    color: theme.colors.onSurface,
    ...theme.typography.codeSm,
  },
  urlSuffixContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s3,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.08)',
  },
  urlSuffixText: {
    color: theme.colors.onSurfaceVariant,
    opacity: 0.8,
  },
  controlBanner: {
    marginBottom: theme.spacing.s6,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: theme.colors.primaryFixed,
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s2,
    borderRadius: theme.radius.xs,
  },
  bannerBtn: {
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s2,
    borderRadius: theme.radius.xs,
    marginLeft: theme.spacing.s2,
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  saveBtn: {
    backgroundColor: '#fff',
  },
  secureInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  secureTextInput: {
    flex: 1,
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s3,
    color: theme.colors.onSurface,
    ...theme.typography.codeSm,
  },
  eyeBtn: {
    paddingHorizontal: theme.spacing.s3,
  },
  secureGitInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
});