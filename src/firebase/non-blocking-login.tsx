'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  linkWithRedirect,
  signInWithRedirect,
  linkWithPopup,
  signInWithPopup
} from 'firebase/auth';
import { googleClientId } from './config';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(err => {
    console.error("WGB Auth: Anonymous login failed", err);
  });
}

/** 
 * Initiate Google Sign-In (Popup fallback for better reliability).
 */
export async function initiateGoogleSignIn(authInstance: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/userinfo.email');
  provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
  provider.setCustomParameters({ 
    prompt: 'select_account',
    client_id: googleClientId
  });
  
  try {
    const currentUser = authInstance.currentUser;
    if (currentUser && currentUser.isAnonymous) {
      console.log("WGB Auth: Linking Anonymous data to Google...");
      await linkWithPopup(currentUser, provider);
    } else {
      console.log("WGB Auth: Initiating Google Popup...");
      await signInWithPopup(authInstance, provider);
    }
  } catch (error: any) {
    console.warn("WGB Auth: Popup blocked or failed, falling back to Redirect...", error.code);
    if (authInstance.currentUser && authInstance.currentUser.isAnonymous) {
      await linkWithRedirect(authInstance.currentUser, provider);
    } else {
      await signInWithRedirect(authInstance, provider);
    }
  }
}

/** Initiate email/password sign-up or sign-in (Sync Fallback). */
export async function syncViaEmail(authInstance: Auth, email: string): Promise<void> {
  // For simplicity in this institutional hub, we use a fixed password or 
  // you can prompt for one. Here we use a standard login/create flow.
  const dummyPassword = "wgb-institutional-sync"; 
  
  try {
    const currentUser = authInstance.currentUser;
    if (currentUser && currentUser.isAnonymous) {
      // Logic for linking would go here, but for simplicity we'll suggest 
      // the user uses a permanent account from the start for multi-device sync.
      console.log("WGB Auth: Attempting Email Link...");
    }
    await signInWithEmailAndPassword(authInstance, email, dummyPassword);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      await createUserWithEmailAndPassword(authInstance, email, dummyPassword);
    } else {
      throw error;
    }
  }
}

/** Initiate Sign Out. */
export function initiateSignOut(authInstance: Auth): Promise<void> {
  return signOut(authInstance);
}
