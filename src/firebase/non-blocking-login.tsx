'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  signOut
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
export function initiateGoogleBackup(authInstance: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();
  const currentUser = authInstance.currentUser;

  if (currentUser && currentUser.isAnonymous) {
    // Attempt to link the current anonymous session to Google
    return linkWithPopup(currentUser, provider)
      .then(() => {
        console.log("Account successfully linked with Google");
      })
      .catch((error) => {
        // If account already exists or linking fails, we don't trigger another popup automatically
        // to avoid browser "popup-blocked" errors. We throw to let the UI handle the next step.
        console.warn("Linking failed:", error);
        throw error;
      });
  } else {
    // Standard sign-in for non-anonymous or new users
    return signInWithPopup(authInstance, provider).then(() => {});
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
