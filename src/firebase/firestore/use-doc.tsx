'use client';
    
import { useState, useEffect, useRef } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * useDoc - Real-time document listener hook
 * Hardened v4.3.24: Added path-based stability guards to prevent depth-exceeded infinite loops.
 */
export function useDoc<T = any>(
  memoizedDocRef: (DocumentReference<DocumentData> & {__memo?: boolean}) | null | undefined,
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  
  // Track the current active path to prevent recursive loading resets
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      lastPathRef.current = null;
      return;
    }

    const currentPath = memoizedDocRef.path;
    
    // Stability Guard: Only reset loading if the path has actually changed.
    // This prevents the "Maximum update depth exceeded" loop caused by unstable refs.
    if (lastPathRef.current !== currentPath) {
      setIsLoading(true);
      setError(null);
      lastPathRef.current = currentPath;
    }

    let isMounted = true;

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (!isMounted) return;
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        if (!isMounted) return;
        if (err.code === 'permission-denied') {
          const contextualError = new FirestorePermissionError({
            operation: 'get',
            path: memoizedDocRef.path,
          });
          setError(contextualError);
          errorEmitter.emit('permission-error', contextualError);
        } else {
          console.warn(`WGB Firestore Warning (${err.code}):`, err.message);
          setError(err);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [memoizedDocRef]);

  if(memoizedDocRef && !memoizedDocRef.__memo) {
    throw new Error(memoizedDocRef.path + ' was not properly memoized using useMemoFirebase. This prevents infinite loops.');
  }

  return { data, isLoading, error };
}
