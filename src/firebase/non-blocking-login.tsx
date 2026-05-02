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
  
  // 1. If anonymous, try linking (this "upgrades" the local data to cloud)
  if (currentUser && currentUser.isAnonymous) {
    try {
      await linkWithCredential(currentUser, credential);
      console.log("WGB Auth: Local data linked to cloud identity.");
      return;
    } catch (linkError: any) {
      // If email already exists, we should probably sign in normally
      // But if it doesn't exist, and linking failed for another reason, we try creating
      if (linkError.code === 'auth/email-already-in-use' || linkError.code === 'auth/credential-already-in-use') {
        console.warn("WGB Auth: Email in use, falling back to sign-in.");
      } else if (linkError.code === 'auth/user-not-found' || linkError.code === 'auth/invalid-credential') {
        // Fall through to create or sign in
      } else {
        throw linkError;
      }
    }
  }

  // 2. Standard sign in or create logic
  try {
    await signInWithEmailAndPassword(authInstance, email, pass);
  } catch (signInError: any) {
    if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
      // If we are currently anonymous and the account doesn't exist, create it via createUser to keep linking logic if possible
      // Actually createUserWithEmailAndPassword on an anonymous user doesn't link them directly in some versions, 
      // but Firebase usually handles it or we use the linked credential above.
      await createUserWithEmailAndPassword(authInstance, email, pass);
    } else {
      throw signInError;
    }
  }
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
