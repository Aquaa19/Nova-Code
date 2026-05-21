// src/services/AuthService.ts

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useSettingsStore } from '../store/useSettingsStore';

export type AuthError = 'network' | 'invalid-credentials' | 'user-not-found' | 'too-many-requests' | 'unknown';

// Configure Google Sign-In with Web Client ID from google-services.json
GoogleSignin.configure({
  webClientId: '532169711828-0s621odt3dt7fep4realsc00ghrf1rt5.apps.googleusercontent.com',
  offlineAccess: true,
});

class AuthServiceClass {
  /**
   * Helper to map native Firebase Auth error codes to simple, typed errors.
   */
  private mapError(error: any): AuthError {
    const code = error.code || '';
    switch (code) {
      case 'auth/invalid-email':
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'invalid-credentials';
      case 'auth/user-not-found':
        return 'user-not-found';
      case 'auth/network-request-failed':
        return 'network';
      case 'auth/too-many-requests':
        return 'too-many-requests';
      default:
        return 'unknown';
    }
  }

  /**
   * Signs in a user using Email and Password.
   */
  async signInWithEmail(email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      return await auth().signInWithEmailAndPassword(email, password);
    } catch (e: any) {
      throw new Error(this.mapError(e));
    }
  }

  /**
   * Creates a user using Email and Password.
   */
  async signUpWithEmail(email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      return await auth().createUserWithEmailAndPassword(email, password);
    } catch (e: any) {
      throw new Error(this.mapError(e));
    }
  }

  /**
   * Signs in a user using Google Sign-In.
   */
  async signInWithGoogle(): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Perform sign in
      const { idToken } = await GoogleSignin.signIn();
      if (!idToken) throw { code: 'auth/network-request-failed' };
      
      const credential = auth.GoogleAuthProvider.credential(idToken);
      return await auth().signInWithCredential(credential);
    } catch (e: any) {
      throw new Error(this.mapError(e));
    }
  }

  /**
   * Signs in a user using a GitHub OAuth Access Token.
   */
  async signInWithGitHub(accessToken: string): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const credential = auth.GithubAuthProvider.credential(accessToken);
      return await auth().signInWithCredential(credential);
    } catch (e: any) {
      throw new Error(this.mapError(e));
    }
  }

  /**
   * Gets the currently authenticated user.
   */
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  /**
   * Registers a listener for auth state changes.
   */
  onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void) {
    return auth().onAuthStateChanged(callback);
  }

  /**
   * Returns the ID token for the current user session (forces refresh if expired).
   */
  async getIdToken(forceRefresh = false): Promise<string | null> {
    const user = auth().currentUser;
    if (!user) return null;
    return user.getIdToken(forceRefresh);
  }

  /**
   * Signs out the current user, clearing local credentials but preserving layout preferences.
   */
  async signOut(): Promise<void> {
    try {
      // 1. Sign out from Firebase
      await auth().signOut();
      
      // 2. Sign out from Google if signed in
      try {
        if (await GoogleSignin.isSignedIn()) {
          await GoogleSignin.signOut();
        }
      } catch (err) {
        console.warn('Google sign-out failed:', err);
      }

      // 3. Clear sensitive credentials from settings store (Zustand + MMKV settings key)
      useSettingsStore.getState().update({
        gitPAT: '',
        engineAuthToken: '',
      });
    } catch (e: any) {
      throw new Error(this.mapError(e));
    }
  }
}

export const AuthService = new AuthServiceClass();
