/**
 * Firebase Storage Media Manager
 * Waghamba Sports Health Hub
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  FirebaseStorage,
} from "firebase/storage";

/**
 * Resizes an image file or data URL to a compressed JPEG Blob (max 1280px, ~150KB).
 */
export async function compressImageToBlob(
  input: File | Blob | string,
  maxDimension = 1280,
  quality = 0.82
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get 2D canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas toBlob failed"));
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = (err) => {
      reject(new Error("Failed to load image for compression"));
    };

    if (typeof input === "string") {
      img.src = input;
    } else {
      img.src = URL.createObjectURL(input);
    }
  });
}

/**
 * Uploads a compressed image to Firebase Storage and returns its download URL and storage path.
 */
export async function uploadMediaToStorage(
  storage: FirebaseStorage,
  storagePath: string,
  imageInput: File | Blob | string,
  contentType = "image/jpeg"
): Promise<{ downloadUrl: string; storagePath: string }> {
  let blobToUpload: Blob;

  if (typeof imageInput === "string" || imageInput instanceof File || imageInput instanceof Blob) {
    if (contentType.startsWith("image/")) {
      blobToUpload = await compressImageToBlob(imageInput);
    } else {
      blobToUpload = typeof imageInput === "string" ? new Blob([imageInput], { type: contentType }) : imageInput;
    }
  } else {
    throw new Error("Invalid media input format");
  }

  const storageRef = ref(storage, storagePath);
  const snapshot = await uploadBytes(storageRef, blobToUpload, {
    contentType,
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);

  return {
    downloadUrl,
    storagePath,
  };
}

/**
 * Deletes a file from Firebase Storage safely.
 */
export async function deleteMediaFromStorage(
  storage: FirebaseStorage,
  storagePath: string
): Promise<boolean> {
  if (!storage || !storagePath) return false;
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    return true;
  } catch (err: any) {
    // If already deleted or not found, treat as success
    if (err?.code === "storage/object-not-found") return true;
    console.warn("Storage delete failed:", storagePath, err);
    return false;
  }
}
