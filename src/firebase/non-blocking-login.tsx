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
  signInAnonymously(authInstance).catch(err => {
    console.error("WGB Auth: Anonymous login failed", err);
  });
}

/** 
 * Initiate Google Sign-In (Redirect).
 * This opens the login in the default browser and returns to the app.
 * Optimized for Account Linking.
 */
export async function initiateGoogleSignIn(authInstance: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ 
    prompt: 'select_account',
    // Helps with PWA/Mobile redirects
    display: 'page' 
  });
  
  try {
    const currentUser = authInstance.currentUser;
    if (currentUser && currentUser.isAnonymous) {
      // LINKING: Preserve data from anonymous session to Google Account
      console.log("WGB Auth: Initiating Account Link via Redirect...");
      await linkWithRedirect(currentUser, provider);
    } else {
      // STANDARD: Just sign in
      console.log("WGB Auth: Initiating Google Sign-In via Redirect...");
      await signInWithRedirect(authInstance, provider);
    }
  } catch (error: any) {
    console.error("WGB Auth: Google Redirect Initialization Error:", error.code, error.message);
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
