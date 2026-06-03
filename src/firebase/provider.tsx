'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp?: FirebaseApp | null;
  firestore?: Firestore | null;
  auth?: Auth | null;
}

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface UserHookResult { 
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp = null,
  firestore = null,
  auth = null,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, 
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      setUserAuthState(prev => ({ ...prev, isUserLoading: false }));
      return;
    }

    let isMounted = true;

    const initAuth = async () => {
      try {
        await getRedirectResult(auth);
      } catch (error: any) {
        console.warn("WGB Auth Handshake Warning:", error.code);
      }

      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          if (isMounted) {
            setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
          }
        },
        (error) => {
          if (isMounted) {
            setUserAuthState({ user: null, isUserLoading: false, userError: error });
          }
        }
      );

      return unsubscribe;
    };

    const unsubPromise = initAuth();

    return () => {
      isMounted = false;
      unsubPromise.then(unsub => unsub?.());
    };
  }, [auth]);

  const areServicesAvailable = !!(firebaseApp && firestore && auth);

  const contextValue = useMemo((): FirebaseContextState => {
    return {
      areServicesAvailable,
      firebaseApp,
      firestore,
      auth,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading && areServicesAvailable,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState, areServicesAvailable]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  
  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  return context?.auth || null;
};

export const useFirestore = () => {
  const context = useContext(FirebaseContext);
  return context?.firestore || null;
};

export const useFirebaseApp = () => {
  const context = useContext(FirebaseContext);
  return context?.firebaseApp || null;
};

export const useUser = (): UserHookResult => {
  const context = useContext(FirebaseContext);
  if (!context) return { user: null, isUserLoading: true, userError: null };
  return { 
    user: context.user, 
    isUserLoading: context.isUserLoading, 
    userError: context.userError 
  };
};

/**
 * useMemoFirebase - Institutional Memoization Utility
 * Hardened to assign validation flags synchronously to satisfy Next.js 15 render cycles.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  return useMemo(() => {
    const val = factory();
    if (val && typeof val === 'object') {
      try {
        (val as any).__memo = true;
      } catch (e) {
        // Safe fail for non-extensible objects
      }
    }
    return val;
  }, [deps]); // eslint-disable-line react-hooks/exhaustive-deps
}