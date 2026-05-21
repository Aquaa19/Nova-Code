// src/screens/AuthScreen.tsx

import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Modal
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView } from 'react-native-webview';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { GlassPanel } from '../components/panels/GlassPanel';
import { AppText } from '../components/typography/AppText';
import { theme } from '../theme';
import { AuthService, AuthError } from '../services/AuthService';

// Configure your GitHub OAuth Application credentials here
const GITHUB_CLIENT_ID = 'Ov23liyP1mD9rXv8xQ5a'; // Replace with your GitHub Client ID
const GITHUB_CLIENT_SECRET = 'YOUR_GITHUB_CLIENT_SECRET'; // Replace with your GitHub Client Secret
const GITHUB_REDIRECT_URI = 'https://nova-code-6c5a2.firebaseapp.com/__/auth/handler';

export const AuthScreen: React.FC<any> = ({ navigation }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);

  const getFriendlyMessage = (errorMsg: string): string => {
    switch (errorMsg) {
      case 'network':
        return 'Network connection lost. Please check your connection.';
      case 'invalid-credentials':
        return 'Invalid email address or incorrect password.';
      case 'user-not-found':
        return 'No user found with this email address.';
      case 'too-many-requests':
        return 'Too many login attempts. Please try again later.';
      default:
        return 'Authentication failed. Please try again.';
    }
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Notice', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLoginMode) {
        await AuthService.signInWithEmail(email.trim(), password);
        Alert.alert('Success', 'Logged in successfully!');
      } else {
        await AuthService.signUpWithEmail(email.trim(), password);
        Alert.alert('Success', 'Account created! Settings will now sync.');
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', getFriendlyMessage(error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await AuthService.signInWithGoogle();
      Alert.alert('Success', 'Logged in with Google successfully!');
    } catch (error: any) {
      Alert.alert('Google Sign-In Error', getFriendlyMessage(error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async (code: string) => {
    setIsLoading(true);
    try {
      // 1. Exchange authorization code for access token
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code: code,
          redirect_uri: GITHUB_REDIRECT_URI,
        }),
      });

      const data = await response.json();
      if (!data.access_token) {
        throw new Error(data.error_description || 'Failed to exchange credentials.');
      }

      // 2. Sign in to Firebase Auth using token
      await AuthService.signInWithGitHub(data.access_token);
      Alert.alert('Success', 'Logged in with GitHub successfully!');
    } catch (error: any) {
      Alert.alert('GitHub Sign-In Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFeature = (icon: string, text: string) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <MaterialCommunityIcons name={icon} size={16} color={theme.colors.primaryFixed} />
      </View>
      <AppText variant="labelXs" color={theme.colors.onSurfaceVariant}>{text}</AppText>
    </View>
  );

  return (
    <ScreenContainer withHeader={false} backgroundVariant="search">
      <AppHeader 
        title={isLoginMode ? "Sign In" : "Get Started"} 
        leftIcon="arrow-left" 
        onLeftPress={() => navigation.goBack()} 
      />
      
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <GlassPanel style={styles.panel}>
            <View style={styles.logoContainer}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="rocket-launch-outline" size={40} color={theme.colors.primaryFixed} />
              </View>
              <AppText variant="headlineMd" style={styles.title}>
                {isLoginMode ? 'Welcome Back' : 'Create Nova Account'}
              </AppText>
              <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant} style={styles.subtitle}>
                {isLoginMode 
                  ? 'Sign in to access your cloud-synced projects and settings.' 
                  : 'Join Nova Code and take your workspace anywhere.'}
              </AppText>
            </View>

            {!isLoginMode && (
              <View style={styles.featuresList}>
                {renderFeature('cloud-check', 'Cloud Settings Sync')}
                {renderFeature('github', 'Git Credentials Backup')}
                {renderFeature('devices', 'Multi-device Access')}
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="email-outline" size={20} color={theme.colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={theme.colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry={secureText}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
                  <MaterialCommunityIcons 
                    name={secureText ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={theme.colors.onSurfaceVariant} 
                  />
                </Pressable>
              </View>

              <Pressable 
                style={({ pressed }) => [
                  styles.button, 
                  isLoading && styles.buttonDisabled,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                ]} 
                onPress={handleAuth}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.colors.background} size="small" />
                ) : (
                  <AppText variant="bodyMd" color={theme.colors.background} style={{ fontWeight: '600' }}>
                    {isLoginMode ? 'Sign In' : 'Create My Account'}
                  </AppText>
                )}
              </Pressable>
            </View>

            {/* ── Federated Authentication Divider & Buttons ── */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.dividerText}>
                OR CONTINUE WITH
              </AppText>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.oauthRow}>
              <Pressable 
                style={({ pressed }) => [
                  styles.oauthButton,
                  isLoading && styles.buttonDisabled,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                ]} 
                onPress={handleGoogleLogin}
                disabled={isLoading}
              >
                <MaterialCommunityIcons name="google" size={20} color="#EA4335" />
                <AppText variant="bodySm" style={styles.oauthButtonText}>Google</AppText>
              </Pressable>

              <Pressable 
                style={({ pressed }) => [
                  styles.oauthButton,
                  isLoading && styles.buttonDisabled,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                ]} 
                onPress={() => setShowGithubModal(true)}
                disabled={isLoading}
              >
                <MaterialCommunityIcons name="github" size={20} color="#FFFFFF" />
                <AppText variant="bodySm" style={styles.oauthButtonText}>GitHub</AppText>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <AppText variant="labelXs" color={theme.colors.onSurfaceVariant}>
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              </AppText>
              <Pressable onPress={() => setIsLoginMode(!isLoginMode)} disabled={isLoading}>
                <AppText variant="bodyMd" color={theme.colors.primaryFixed} style={{ fontWeight: '600' }}>
                  {isLoginMode ? 'Sign Up' : 'Log In'}
                </AppText>
              </Pressable>
            </View>
          </GlassPanel>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* GitHub Sign-In WebView Modal */}
      <Modal visible={showGithubModal} animationType="slide" onRequestClose={() => setShowGithubModal(false)}>
        <View style={styles.modalHeader}>
          <Pressable onPress={() => setShowGithubModal(false)} style={styles.modalCloseBtn}>
            <MaterialCommunityIcons name="close" size={24} color="#FFF" />
          </Pressable>
          <AppText variant="headlineSm" style={styles.modalTitle}>Sign In with GitHub</AppText>
          <View style={{ width: 40 }} />
        </View>
        <WebView
          source={{ 
            uri: `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=read:user,user:email&redirect_uri=${GITHUB_REDIRECT_URI}` 
          }}
          onNavigationStateChange={(navState) => {
            if (navState.url.startsWith(GITHUB_REDIRECT_URI)) {
              const match = navState.url.match(/[?&]code=([^&]+)/);
              if (match && match[1]) {
                setShowGithubModal(false);
                handleGithubLogin(match[1]);
              }
            }
          }}
          incognito={true}
          style={{ flex: 1, backgroundColor: '#11131c' }}
        />
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.gutter,
  },
  panel: {
    padding: theme.spacing.s6,
    borderRadius: theme.radius.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.s6,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.s4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    marginBottom: theme.spacing.s1,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: theme.spacing.s2,
  },
  featuresList: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: theme.radius.md,
    padding: theme.spacing.s4,
    marginBottom: theme.spacing.s6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s2,
  },
  featureIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.s3,
  },
  form: {
    marginBottom: theme.spacing.s4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.s4,
    paddingHorizontal: theme.spacing.s3,
  },
  inputIcon: {
    marginRight: theme.spacing.s2,
  },
  eyeIcon: {
    padding: theme.spacing.s1,
  },
  input: {
    flex: 1,
    color: theme.colors.onSurface,
    paddingVertical: theme.spacing.s4,
    fontSize: 16,
  },
  button: {
    backgroundColor: theme.colors.primaryFixed,
    borderRadius: theme.radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.s2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.s2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.s4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    marginHorizontal: theme.spacing.s4,
    opacity: 0.6,
    letterSpacing: 1.5,
  },
  oauthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.s4,
    marginBottom: theme.spacing.s4,
  },
  oauthButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    gap: 8,
  },
  oauthButtonText: {
    fontWeight: '500',
    color: theme.colors.onSurface,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#11131c',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalCloseBtn: {
    padding: 10,
    marginLeft: 10,
  },
  modalTitle: {
    color: '#FFF',
    fontWeight: '600',
  },
});