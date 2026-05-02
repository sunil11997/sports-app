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
 * Links an anonymous session to a permanent email identity or signs in.
 */
export async function syncViaEmail(authInstance: Auth, email: string, pass: string): Promise<void> {
  const credential = EmailAuthProvider.credential(email, pass);
  const currentUser = authInstance.currentUser;
  
  // 1. If anonymous, try linking
  if (currentUser && currentUser.isAnonymous) {
    try {
      await linkWithCredential(currentUser, credential);
      console.log("WGB Auth: Local data linked to cloud identity.");
      return;
    } catch (linkError: any) {
      // If email already exists, we must sign in normally
      if (linkError.code !== 'auth/email-already-in-use' && linkError.code !== 'auth/credential-already-in-use') {
        throw linkError;
      }
      console.warn("WGB Auth: Email in use, falling back to sign-in.");
    }
  }

  // 2. Standard sign in
  await signInWithEmailAndPassword(authInstance, email, pass);
}

/**
 * createEmailAccount - For fresh registration
 */
export async function createEmailAccount(authInstance: Auth, email: string, pass: string): Promise<void> {
  const currentUser = authInstance.currentUser;
  
  if (currentUser && currentUser.isAnonymous) {
    // If user is already anonymous, we should use syncViaEmail to "upgrade" them
    return syncViaEmail(authInstance, email, pass);
  }

  await createUserWithEmailAndPassword(authInstance, email, pass);
}

/** Initiate Sign Out. */
export function initiateSignOut(authInstance: Auth): Promise<void> {
  return signOut(authInstance);
}
