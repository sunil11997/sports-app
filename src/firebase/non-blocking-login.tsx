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
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly.
  createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly.
  signInWithEmailAndPassword(authInstance, email, password);
}

/** 
 * Initiate Sign Out. 
 * Returns a promise for UI handling.
 */
export function initiateSignOut(authInstance: Auth): Promise<void> {
  return signOut(authInstance);
}

/** 
 * Initiate Google Backup (linking/signing with Google).
 * This allows an anonymous user to upgrade their account and backup data to Google.
 */
export async function initiateGoogleBackup(authInstance: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();
  
  if (authInstance.currentUser) {
    // If already signed in (likely anonymously), link the account
    await linkWithPopup(authInstance.currentUser, provider);
  } else {
    // If not signed in, perform a standard sign-in
    await signInWithPopup(authInstance, provider);
  }
}
