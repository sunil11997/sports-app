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
  signInWithRedirect,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate Google Sign-In (Pop-up). */
export async function initiateGoogleSignIn(authInstance: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  
  try {
    const currentUser = authInstance.currentUser;
    if (currentUser && currentUser.isAnonymous) {
      // If user is currently anonymous, link the Google account to preserve data
      await linkWithPopup(currentUser, provider);
    } else {
      // Otherwise, standard sign in
      await signInWithPopup(authInstance, provider);
    }
  } catch (error: any) {
    // If linking fails because account exists, just sign in normally
    if (error.code === 'auth/credential-already-in-use') {
      await signInWithPopup(authInstance, provider);
    } else {
      throw error;
    }
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
