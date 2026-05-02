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
  signInWithPopup,
  EmailAuthProvider,
  linkWithCredential
} from 'firebase/auth';
import { googleClientId } from './config';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(err => {
    console.error("WGB Auth: Anonymous login failed", err);
  });
}

/** 
 * Initiate Google Sign-In (Redirect method for best mobile PWA compatibility).
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
      console.log("WGB Auth: Initiating Google Link via Redirect...");
      await linkWithRedirect(currentUser, provider);
    } else {
      console.log("WGB Auth: Initiating Google Sign-In via Redirect...");
      await signInWithRedirect(authInstance, provider);
    }
  } catch (error: any) {
    console.error("WGB Auth: Google Redirect failed", error);
    throw error;
  }
}

/** 
 * syncViaEmail - High-Resilience Cloud Link
 * Links an anonymous session to a permanent email identity to enable multi-device sync.
 */
export async function syncViaEmail(authInstance: Auth, email: string): Promise<void> {
  // Use a standardized institutional sync password
  const syncPass = "wgb-institutional-vault-2025"; 
  const credential = EmailAuthProvider.credential(email, syncPass);
  const currentUser = authInstance.currentUser;
  
  try {
    if (currentUser && currentUser.isAnonymous) {
      // 1. Link current "Local" data to the new email identity
      await linkWithCredential(currentUser, credential);
      console.log("WGB Auth: Local data linked to cloud identity.");
    } else {
      // 2. Already signed in or fresh start - attempt standard login
      await signInWithEmailAndPassword(authInstance, email, syncPass);
    }
  } catch (error: any) {
    // Handle account creation if it doesn't exist
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/user-disabled') {
      try {
        await createUserWithEmailAndPassword(authInstance, email, syncPass);
      } catch (createErr: any) {
        // If account already exists but link failed, just sign in
        if (createErr.code === 'auth/email-already-in-use') {
          await signInWithEmailAndPassword(authInstance, email, syncPass);
        } else {
          throw createErr;
        }
      }
    } else if (error.code === 'auth/email-already-in-use') {
      // If the email is already registered, we switch to that account
      await signInWithEmailAndPassword(authInstance, email, syncPass);
    } else {
      throw error;
    }
  }
}

/** Initiate Sign Out. */
export function initiateSignOut(authInstance: Auth): Promise<void> {
  return signOut(authInstance);
}
