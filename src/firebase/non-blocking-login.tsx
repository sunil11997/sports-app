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
  const syncPass = "wgb-institutional-vault-2025"; 
  const credential = EmailAuthProvider.credential(email, syncPass);
  const currentUser = authInstance.currentUser;
  
  try {
    if (currentUser && currentUser.isAnonymous) {
      // 1. Try to link current session to this email
      try {
        await linkWithCredential(currentUser, credential);
        console.log("WGB Auth: Local data linked to cloud identity.");
      } catch (linkError: any) {
        // If email is already taken, we can't link, we must sign in
        if (linkError.code === 'auth/email-already-in-use' || linkError.code === 'auth/credential-already-in-use') {
          console.warn("WGB Auth: Email taken. Signing in instead.");
          await signInWithEmailAndPassword(authInstance, email, syncPass);
        } else {
          throw linkError;
        }
      }
    } else {
      // 2. Standard sign-in if not anonymous
      await signInWithEmailAndPassword(authInstance, email, syncPass);
    }
  } catch (error: any) {
    // 3. If account doesn't exist, create it automatically
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/user-disabled') {
      try {
        await createUserWithEmailAndPassword(authInstance, email, syncPass);
      } catch (createErr: any) {
        // If creation fails because it exists (race condition), final try at sign in
        if (createErr.code === 'auth/email-already-in-use') {
          try {
            await signInWithEmailAndPassword(authInstance, email, syncPass);
          } catch (finalErr) {
            throw new Error("AUTH_PASSWORD_MISMATCH");
          }
        } else {
          throw createErr;
        }
      }
    } else if (error.code === 'auth/email-already-in-use') {
      // Last check for already registered emails
      try {
        await signInWithEmailAndPassword(authInstance, email, syncPass);
      } catch (signInErr) {
        throw new Error("AUTH_PASSWORD_MISMATCH");
      }
    } else {
      throw error;
    }
  }
}

/** Initiate Sign Out. */
export function initiateSignOut(authInstance: Auth): Promise<void> {
  return signOut(authInstance);
}
