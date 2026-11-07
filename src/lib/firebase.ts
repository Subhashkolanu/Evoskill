import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, (firebaseConfig as any).firestoreDatabaseId || "(default)");

// Standard login provider (only basic scopes to avoid "Unverified App" warning)
const baseProvider = new GoogleAuthProvider();
baseProvider.addScope('profile');
baseProvider.addScope('email');
baseProvider.addScope('openid');

// Incremental workspace provider (requested on-demand only for Workspace sync)
const workspaceProvider = new GoogleAuthProvider();
workspaceProvider.addScope('https://www.googleapis.com/auth/tasks');
workspaceProvider.addScope('https://www.googleapis.com/auth/calendar');
workspaceProvider.addScope('https://www.googleapis.com/auth/documents');
workspaceProvider.addScope('https://www.googleapis.com/auth/spreadsheets');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (!cachedAccessToken && typeof window !== 'undefined') {
        cachedAccessToken = sessionStorage.getItem('evoskill_oauth_token');
      }
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('evoskill_oauth_token');
        sessionStorage.removeItem('evoskill_demo_mode');
      }
      if (onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string | null } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, baseProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('evoskill_oauth_token', cachedAccessToken);
        sessionStorage.removeItem('evoskill_demo_mode');
      }
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const requestWorkspaceConsent = async (): Promise<string> => {
  try {
    const result = await signInWithPopup(auth, workspaceProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not obtain Google Workspace access token.');
    }
    cachedAccessToken = credential.accessToken;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('evoskill_oauth_token', cachedAccessToken);
    }
    return cachedAccessToken;
  } catch (error: any) {
    console.error('Workspace consent error:', error);
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (!cachedAccessToken && typeof window !== 'undefined') {
    cachedAccessToken = sessionStorage.getItem('evoskill_oauth_token');
  }
  return cachedAccessToken;
};

/**
 * Retrieves the current Firebase Auth ID token (JWT) for authenticated API calls.
 */
export const getIdToken = async (): Promise<string | null> => {
  if (auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken(false);
    } catch (e) {
      console.error("Failed to retrieve Firebase ID token:", e);
    }
  }

  // Demo mode token support
  if (typeof window !== 'undefined' && sessionStorage.getItem('evoskill_demo_mode') === 'true') {
    return 'demo-token-demo-user-123';
  }

  return null;
};

/**
 * Reusable authenticated fetch wrapper that attaches Bearer ID token.
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = await getIdToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers
  });
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('evoskill_oauth_token');
    sessionStorage.removeItem('evoskill_demo_mode');
  }
};
