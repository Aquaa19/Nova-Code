declare module '@react-native-google-signin/google-signin' {
  export interface ConfigureOptions {
    webClientId?: string;
    offlineAccess?: boolean;
    hostedDomain?: string;
    forceCodeForRefreshToken?: boolean;
    accountName?: string;
    iosClientId?: string;
  }

  export interface User {
    idToken: string | null;
    serverAuthCode: string | null;
    scopes?: string[];
    user: {
      email: string;
      id: string;
      givenName: string | null;
      familyName: string | null;
      photo: string | null;
      name: string | null;
    };
  }

  export const GoogleSignin: {
    configure(options: ConfigureOptions): void;
    hasPlayServices(options?: { showPlayServicesUpdateDialog: boolean }): Promise<boolean>;
    signIn(): Promise<User>;
    signOut(): Promise<void>;
    isSignedIn(): Promise<boolean>;
    getCurrentUser(): Promise<User | null>;
  };

  export const statusCodes: {
    SIGN_IN_CANCELLED: string;
    IN_PROGRESS: string;
    PLAY_SERVICES_NOT_AVAILABLE: string;
    SIGN_IN_REQUIRED: string;
  };
}
