'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  signOut,
  AuthError
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(err => console.error("Anon sign-in failed", err));
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
 * Initiate Google Sign-In or Linking.
 * Note: To avoid popup-blocked errors, this should be called directly in an onClick handler.
 */
export async function initiateGoogleBackup(authInstance: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();
  const currentUser = authInstance.currentUser;

  try {
    if (currentUser && currentUser.isAnonymous) {
      // Attempt to link the current anonymous session to Google
      await linkWithPopup(currentUser, provider);
      console.log("Account successfully linked with Google");
    } else {
      // Standard sign-in for non-anonymous or new users
      await signInWithPopup(authInstance, provider);
    }
  } catch (error: any) {
    const authError = error as AuthError;
    if (authError.code === 'auth/operation-not-allowed') {
      throw new Error("Google Sign-In is not enabled. Please enable it in the Firebase Console (Authentication > Sign-in method).");
    }
    if (authError.code === 'auth/credential-already-in-use') {
      throw new Error("This Google account is already linked to another user. Please sign out and sign in with Google directly.");
    }
    console.warn("Auth operation failed:", error);
    throw error;
  }
}

/** 
 * Direct Google Sign-In (ignores anonymous linking).
 */
export function initiateGoogleSignIn(authInstance: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(authInstance, provider).then(() => {});
}

/** Sign out (non-blocking). */
export function initiateSignOut(authInstance: Auth): void {
  signOut(authInstance);
}
