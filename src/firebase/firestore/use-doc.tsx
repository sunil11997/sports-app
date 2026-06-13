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

export function useDoc<T = any>(
  memoizedDocRef: (DocumentReference<DocumentData> & {__memo?: boolean}) | null | undefined,
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  
  // Use a ref to track the current path and avoid infinite loops
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
    // Only set loading if the path has actually changed
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
          const contextualError = new FirestorePermissionError({ operation: 'get', path: currentPath });
          setError(contextualError);
          errorEmitter.emit('permission-error', contextualError);
        } else {
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
    throw new Error(memoizedDocRef.path + ' was not properly memoized using useMemoFirebase.');
  }

  return { data, isLoading, error };
}