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
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** 
 * Initiate Google Sign-In (Redirect).
 * This opens the login in the default browser and returns to the app.
 */
export async function initiateGoogleSignIn(authInstance: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  
  try {
    const currentUser = authInstance.currentUser;
    if (currentUser && currentUser.isAnonymous) {
      // If user is currently anonymous, link the Google account via redirect to preserve data
      await linkWithRedirect(currentUser, provider);
    } else {
      // Otherwise, standard sign in via redirect
      await signInWithRedirect(authInstance, provider);
    }
  } catch (error: any) {
    // Suppress common redirect/browser blocked errors
    console.error("WGB: Google Redirect Sign-In Error:", error.code || error.message);
    throw error;
  }
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}

/** 
 * Initiate Sign Out. 
 */
export function initiateSignOut(authInstance: Auth): Promise<void> {
  return signOut(authInstance);
}
