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
  
  // 1. If we have an anonymous user, try to link their data to this email first
  if (currentUser && currentUser.isAnonymous) {
    try {
      await linkWithCredential(currentUser, credential);
      console.log("WGB Auth: Local data linked to cloud identity.");
      return;
    } catch (linkError: any) {
      // If email is already in use, we fall through to sign-in or check for password mismatch
      if (linkError.code !== 'auth/email-already-in-use' && linkError.code !== 'auth/credential-already-in-use') {
        throw linkError;
      }
      console.warn("WGB Auth: Email already in use during link, falling back to sign-in.");
    }
  }

  // 2. Attempt to sign in with the system's sync password
  try {
    await signInWithEmailAndPassword(authInstance, email, syncPass);
    console.log("WGB Auth: Signed into existing cloud vault.");
  } catch (signInError: any) {
    // 3. If user doesn't exist, create the account
    if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
      try {
        await createUserWithEmailAndPassword(authInstance, email, syncPass);
        console.log("WGB Auth: Created new cloud vault for email.");
      } catch (createError: any) {
        // Final fallback: if creation fails because email exists (race condition),
        // and sign-in already failed, the password definitely doesn't match.
        if (createError.code === 'auth/email-already-in-use') {
          throw new Error("AUTH_PASSWORD_MISMATCH");
        }
        throw createError;
      }
    } else {
      // If it's a different error (like account disabled or network), propagate it
      throw signInError;
    }
  }
}

/** Initiate Sign Out. */
export function initiateSignOut(authInstance: Auth): Promise<void> {
  return signOut(authInstance);
}
