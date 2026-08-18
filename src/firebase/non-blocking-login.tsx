'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  linkWithPopup,
  signInWithPopup,
  EmailAuthProvider,
  PhoneAuthProvider,
  linkWithCredential,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult
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
 * Configured with automatic linking to ensure all existing local/anonymous student records are preserved.
 */
export async function initiateGoogleSignIn(authInstance: Auth): Promise<any> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/userinfo.email');
  provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
  
  provider.setCustomParameters({ 
    prompt: 'select_account'
  });
  
  try {
    const currentUser = authInstance.currentUser;
    if (currentUser && currentUser.isAnonymous) {
      console.log("WGB Auth: Linking anonymous data to Google identity...");
      try {
        const result = await linkWithPopup(currentUser, provider);
        console.log("WGB Auth: Local records linked to Google identity. UID preserved:", result.user.uid);
        return result.user;
      } catch (linkError: any) {
        console.warn("WGB Auth: Google link notice:", linkError.code);
        if (
          linkError.code === 'auth/credential-already-in-use' ||
          linkError.code === 'auth/account-exists-with-different-credential' ||
          linkError.code === 'auth/provider-already-linked'
        ) {
          // Account already exists, sign in directly
          const result = await signInWithPopup(authInstance, provider);
          return result.user;
        }
        throw linkError;
      }
    } else {
      console.log("WGB Auth: Initiating Google Sign-In via Popup...");
      const result = await signInWithPopup(authInstance, provider);
      console.log("WGB Auth: Google Sign-In successful:", result.user.uid);
      return result.user;
    }
  } catch (error: any) {
    console.error("WGB Auth: Google Sign-In failed", error);
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

/** 
 * Send Password Recovery Email via Firebase Authentication
 */
export async function sendPasswordRecoveryEmail(authInstance: Auth, email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    
    const actionCodeSettings = typeof window !== 'undefined' ? {
      url: `${window.location.origin}`,
      handleCodeInApp: true,
    } : undefined;

    await sendPasswordResetEmail(authInstance, trimmedEmail, actionCodeSettings);
    return { success: true };
  } catch (error: any) {
    console.error('WGB Auth: Password reset error:', error);
    let message = 'Failed to send password recovery email. Please try again.';
    if (error.code === 'auth/user-not-found') {
      message = 'No account found with this email address.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many requests. Please wait a moment before trying again.';
    } else if (error.code === 'auth/unauthorized-continue-uri') {
      message = 'Domain not authorized in Firebase Console.';
    } else if (error.message) {
      message = error.message;
    }
    return { success: false, error: message };
  }
}

/** Initiate Sign Out. */
export function initiateSignOut(authInstance: Auth): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('wgb_otp_auth_user');
  }
  return signOut(authInstance);
}

/** Initialize RecaptchaVerifier for Phone OTP auth with auto-cleanup */
export function getRecaptchaVerifier(authInstance: Auth, containerId: string = 'recaptcha-container'): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('RecaptchaVerifier can only be instantiated in browser window context');
  }

  // Safely clear any previously initialized verifier
  const win = window as any;
  if (win.recaptchaVerifier) {
    try {
      win.recaptchaVerifier.clear();
      win.recaptchaVerifier = null;
    } catch (e) {
      console.warn("WGB Auth: Recaptcha cleanup notice:", e);
    }
  }

  const verifier = new RecaptchaVerifier(authInstance, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('WGB Auth: Recaptcha verification completed for Phone OTP');
    },
    'expired-callback': () => {
      console.warn('WGB Auth: Recaptcha token expired. Please retry.');
    }
  });

  win.recaptchaVerifier = verifier;
  return verifier;
}

/** Initiate Phone OTP sending */
export async function sendPhoneOtp(
  authInstance: Auth, 
  phoneNumber: string, 
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  try {
    await verifier.render();
  } catch (e) {
    console.warn("WGB Auth: Recaptcha render notice:", e);
  }
  return await signInWithPhoneNumber(authInstance, phoneNumber, verifier);
}

/**
 * verifyAndLinkPhoneOtp - High-Resilience Phone OTP Verification & Account Linking
 * Ensures all existing local/anonymous Firestore records and configurations are preserved
 * without data loss when upgrading to a verified mobile identity.
 */
export async function verifyAndLinkPhoneOtp(
  authInstance: Auth,
  confirmationResult: ConfirmationResult,
  verificationCode: string
): Promise<{ user: any; isLinked: boolean }> {
  const credential = PhoneAuthProvider.credential(
    confirmationResult.verificationId,
    verificationCode
  );

  const currentUser = authInstance.currentUser;

  // Step 1: If current session is anonymous, link phone credential to preserve the exact same user.uid & Firestore records
  if (currentUser && currentUser.isAnonymous) {
    try {
      const userCredential = await linkWithCredential(currentUser, credential);
      console.log("WGB Auth: Anonymous account linked with phone identity. UID preserved:", userCredential.user.uid);
      return { user: userCredential.user, isLinked: true };
    } catch (linkError: any) {
      console.warn("WGB Auth: Link phone notice, checking existing account:", linkError.code);
      if (
        linkError.code === 'auth/credential-already-in-use' ||
        linkError.code === 'auth/provider-already-linked' ||
        linkError.code === 'auth/phone-number-already-exists'
      ) {
        // Phone identity was previously created on another device/session: sign into that account directly
        const userCredential = await confirmationResult.confirm(verificationCode);
        console.log("WGB Auth: Signed into existing phone user:", userCredential.user.uid);
        return { user: userCredential.user, isLinked: false };
      }
      throw linkError;
    }
  }

  // Step 2: If user already has a permanent session or direct sign in, confirm the code
  const userCredential = await confirmationResult.confirm(verificationCode);
  return { user: userCredential.user, isLinked: false };
}


