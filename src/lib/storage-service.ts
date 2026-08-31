import { FirebaseStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Storage File Metadata Interface
 */
export interface StorageUploadResult {
  downloadUrl: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

/**
 * Client-Side Image Resizer & Compressor
 * Scales down large camera/gallery photos before upload to optimize storage and bandwidth.
 */
export async function compressImage(file: File, maxWidth = 1024, maxHeight = 1024, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If SVG or non-image, return file as is
    if (!file.type.startsWith('image/') || file.type.includes('svg')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          file.type === 'image/png' ? 'image/png' : 'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Upload Athlete / Student Photo to Firebase Storage
 */
export async function uploadPlayerPhoto(
  storage: FirebaseStorage,
  schoolId: string,
  playerId: string,
  fileOrBlob: File | Blob,
  fileName = 'profile.jpg'
): Promise<StorageUploadResult> {
  let blobToUpload = fileOrBlob;
  if (fileOrBlob instanceof File) {
    blobToUpload = await compressImage(fileOrBlob, 800, 800, 0.85);
  }

  const storagePath = `schools/${schoolId}/players/${playerId}/${Date.now()}_${fileName}`;
  const storageRef = ref(storage, storagePath);

  const snapshot = await uploadBytesResumable(storageRef, blobToUpload, {
    contentType: (fileOrBlob as File).type || 'image/jpeg',
    customMetadata: {
      schoolId,
      playerId,
      uploadedAt: new Date().toISOString()
    }
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);

  return {
    downloadUrl,
    storagePath,
    fileName,
    fileSize: blobToUpload.size,
    contentType: snapshot.metadata.contentType || 'image/jpeg',
    uploadedAt: new Date().toISOString()
  };
}

/**
 * Upload School Document or Game Rule PDF to Firebase Storage
 */
export async function uploadSchoolDocument(
  storage: FirebaseStorage,
  schoolId: string,
  folder: 'game_rules' | 'reports' | 'signatures' | 'documents',
  file: File
): Promise<StorageUploadResult> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `schools/${schoolId}/${folder}/${Date.now()}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  const snapshot = await uploadBytesResumable(storageRef, file, {
    contentType: file.type || 'application/octet-stream',
    customMetadata: {
      schoolId,
      category: folder,
      uploadedAt: new Date().toISOString()
    }
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);

  return {
    downloadUrl,
    storagePath,
    fileName: file.name,
    fileSize: file.size,
    contentType: file.type,
    uploadedAt: new Date().toISOString()
  };
}

/**
 * Delete File from Firebase Storage safely
 */
export async function deleteStorageFile(storage: FirebaseStorage, storagePath: string): Promise<boolean> {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.warn('WGB Storage: Failed to delete object or already deleted:', storagePath, error);
    return false;
  }
}
