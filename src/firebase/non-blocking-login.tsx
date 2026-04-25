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
  // Ensure we have a fresh provider instance and set custom parameters if needed
  provider.setCustomParameters({ prompt: 'select_account' });
  
  const currentUser = authInstance.currentUser;
  
  if (currentUser) {
    // Check if already linked to Google to avoid redundant calls or errors
    const isAlreadyLinked = currentUser.providerData.some(p => p.providerId === 'google.com');
    if (isAlreadyLinked) {
      console.log("Account is already linked to Google.");
      return; 
    }
    
    // If signed in anonymously, link the account
    // This will throw auth/credential-already-in-use if the Google account is already a user
    await linkWithPopup(currentUser, provider);
  } else {
    // If not signed in at all, perform a standard sign-in
    await signInWithPopup(authInstance, provider);
  }
}
