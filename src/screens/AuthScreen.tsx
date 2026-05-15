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
  ScrollView
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { GlassPanel } from '../components/panels/GlassPanel';
import { AppText } from '../components/typography/AppText';
import { theme } from '../theme';
import auth from '@react-native-firebase/auth'; 

export const AuthScreen: React.FC<any> = ({ navigation }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Notice', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLoginMode) {
        await auth().signInWithEmailAndPassword(email.trim(), password);
        Alert.alert('Success', 'Logged in successfully!');
      } else {
        await auth().createUserWithEmailAndPassword(email.trim(), password);
        Alert.alert('Success', 'Account created! Settings will now sync.');
      }
    } catch (error: any) {
      const message = error.message.replace(/\[.*\] /, '');
      Alert.alert('Authentication Error', message);
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
});