'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Recursively cleans an object for Firestore writes:
 * - Strips any properties whose value is `undefined` (which causes Firestore setDoc/addDoc/updateDoc to fail synchronously with "Unsupported field value: undefined")
 * - Traverses nested objects and arrays
 * - Preserves special Firestore objects (Timestamp, FieldValue, etc.)
 */
export function sanitizeFirestoreData(data: any): any {
  if (data === undefined) {
    return undefined;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .map((item) => sanitizeFirestoreData(item))
      .filter((item) => item !== undefined);
  }
  // Preserve Firestore special objects (FieldValue, Timestamp, etc.)
  if (data.constructor && data.constructor.name !== 'Object') {
    return data;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      const sanitized = sanitizeFirestoreData(value);
      if (sanitized !== undefined) {
        clean[key] = sanitized;
      }
    }
  }
  return clean;
}

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  try {
    const cleanData = sanitizeFirestoreData(data) || {};
    setDoc(docRef, cleanData, options).catch((error: any) => {
      if (error?.code === 'permission-denied') {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: docRef.path,
            operation: 'write',
            requestResourceData: cleanData,
          })
        );
      } else {
        console.warn(`WGB: setDoc non-blocking warning (${error?.code || 'error'}):`, error?.message || error);
      }
    });
  } catch (error: any) {
    console.warn(`WGB: setDoc non-blocking synchronous error (${error?.code || 'error'}):`, error?.message || error);
  }
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 * Returns the Promise for the new doc ref, but typically not awaited by caller.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  try {
    const cleanData = sanitizeFirestoreData(data) || {};
    const promise = addDoc(colRef, cleanData)
      .catch((error: any) => {
        if (error?.code === 'permission-denied') {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: colRef.path,
              operation: 'create',
              requestResourceData: cleanData,
            })
          );
        } else {
          console.warn(`WGB: addDoc non-blocking warning (${error?.code || 'error'}):`, error?.message || error);
        }
      });
    return promise;
  } catch (error: any) {
    console.warn(`WGB: addDoc non-blocking synchronous error (${error?.code || 'error'}):`, error?.message || error);
    return Promise.resolve(null as any);
  }
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  try {
    const cleanData = sanitizeFirestoreData(data) || {};
    updateDoc(docRef, cleanData)
      .catch((error: any) => {
        if (error?.code === 'permission-denied') {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: docRef.path,
              operation: 'update',
              requestResourceData: cleanData,
            })
          );
        } else {
          console.warn(`WGB: updateDoc non-blocking warning (${error?.code || 'error'}):`, error?.message || error);
        }
      });
  } catch (error: any) {
    console.warn(`WGB: updateDoc non-blocking synchronous error (${error?.code || 'error'}):`, error?.message || error);
  }
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  try {
    deleteDoc(docRef)
      .catch((error: any) => {
        if (error?.code === 'permission-denied') {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: docRef.path,
              operation: 'delete',
            })
          );
        } else {
          console.warn(`WGB: deleteDoc non-blocking warning (${error?.code || 'error'}):`, error?.message || error);
        }
      });
  } catch (error: any) {
    console.warn(`WGB: deleteDoc non-blocking synchronous error (${error?.code || 'error'}):`, error?.message || error);
  }
}