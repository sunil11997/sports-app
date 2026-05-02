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
 * Configured for offline access and forced consent to ensure refresh token availability
 * for the Gmail scope.
 */
export async function initiateGoogleSignIn(authInstance: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/userinfo.email');
  provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
  provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
  
  // Set custom parameters to request offline access and force the consent screen
  // This ensures a refresh token is provided by Google.
  provider.setCustomParameters({ 
    access_type: 'offline',
    prompt: 'consent',
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
 * Handles token expiration and credential conflicts.
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
      console.warn("WGB Auth: Link failed, checking code...", linkError.code);
      
      // If token expired or other session issues, we fall back to direct sign-in/up
      if (
        linkError.code === 'auth/user-token-expired' || 
        linkError.code === 'auth/network-request-failed'
      ) {
        console.warn("WGB Auth: Session stale, attempting direct auth fallback.");
      } else if (linkError.code === 'auth/email-already-in-use' || linkError.code === 'auth/credential-already-in-use') {
        console.warn("WGB Auth: Email in use, falling back to sign-in.");
      } else {
        // For critical errors (invalid email format etc), re-throw to UI
        throw linkError;
      }
    }
  }

  // 2. Standard sign in or create logic (The Fallback)
  // We try sign-in first, if that fails with 'user-not-found', we create.
  try {
    await signInWithEmailAndPassword(authInstance, email, pass);
    console.log("WGB Auth: Standard sign-in successful.");
  } catch (signInError: any) {
    if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
      // Create user if they don't exist
      try {
        await createUserWithEmailAndPassword(authInstance, email, pass);
        console.log("WGB Auth: New cloud account created.");
      } catch (createError: any) {
        // If creation fails (e.g. invalid password), throw back to UI
        throw createError;
      }
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
