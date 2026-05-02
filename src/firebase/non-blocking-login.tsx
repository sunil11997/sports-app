'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
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
 * Initiate Google Sign-In (Popup method for best contextual stability).
 * Configured for offline access and forced consent to ensure refresh token availability.
 */
export async function initiateGoogleSignIn(authInstance: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/userinfo.email');
  provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
  provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
  
  // Set custom parameters to request offline access and force the consent screen
  provider.setCustomParameters({ 
    access_type: 'offline',
    prompt: 'consent',
    client_id: googleClientId
  });
  
  try {
    const currentUser = authInstance.currentUser;
    if (currentUser && currentUser.isAnonymous) {
      console.log("WGB Auth: Initiating Google Link via Popup...");
      await linkWithPopup(currentUser, provider);
      console.log("WGB Auth: Local data linked to Google identity.");
    } else {
      console.log("WGB Auth: Initiating Google Sign-In via Popup...");
      await signInWithPopup(authInstance, provider);
      console.log("WGB Auth: Google Sign-In successful.");
    }
  } catch (error: any) {
    console.error("WGB Auth: Google Popup failed", error);
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
  
  // Phase 1: Try Linking (only if currently anonymous)
  if (currentUser && currentUser.isAnonymous) {
    try {
      await linkWithCredential(currentUser, credential);
      console.log("WGB Auth: Local data linked to cloud identity.");
      return;
    } catch (linkError: any) {
      console.warn("WGB Auth: Link check...", linkError.code);
      // If email is already taken, we must fall through to standard sign-in
      if (
        linkError.code === 'auth/email-already-in-use' || 
        linkError.code === 'auth/credential-already-in-use' ||
        linkError.code === 'auth/user-token-expired'
      ) {
        console.warn("WGB Auth: Email in use or token expired, attempting direct sign-in fallback.");
      } else {
        throw linkError;
      }
    }
  }

  // Phase 2: Standard Sign In
  try {
    await signInWithEmailAndPassword(authInstance, email, pass);
    console.log("WGB Auth: Sign-in successful.");
  } catch (signInError: any) {
    // If user not found, try to Create a new account
    if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
      try {
        await createUserWithEmailAndPassword(authInstance, email, pass);
        console.log("WGB Auth: New account created successfully.");
      } catch (createError: any) {
        // If it fails with 'already-in-use' here, it means Phase 2 failed because of a WRONG PASSWORD
        if (createError.code === 'auth/email-already-in-use') {
          const customError = new Error('WRONG_PASSWORD_FOR_EXISTING_ACCOUNT');
          (customError as any).code = 'auth/wrong-password';
          throw customError;
        }
        throw createError;
      }
    } else {
      throw signInError;
    }
  }
}

/** Initiate Sign Out. */
export function initiateSignOut(authInstance: Auth): Promise<void> {
  return signOut(authInstance);
}
