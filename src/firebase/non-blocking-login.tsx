
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

/** Initiate Google Sign-In or Linking (non-blocking). */
export function initiateGoogleBackup(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  const currentUser = authInstance.currentUser;

  if (currentUser && currentUser.isAnonymous) {
    // If user is currently anonymous, link their account to Google to prevent data loss
    linkWithPopup(currentUser, provider)
      .then(() => {
        console.log("Account successfully linked with Google");
      })
      .catch((error) => {
        // If account already exists or linking fails, fallback to direct sign-in
        console.warn("Linking failed, falling back to sign-in:", error);
        signInWithPopup(authInstance, provider);
      });
  } else {
    // Standard sign-in for non-anonymous or new users
    signInWithPopup(authInstance, provider);
  }
}

/** Sign out (non-blocking). */
export function initiateSignOut(authInstance: Auth): void {
  signOut(authInstance);
}
