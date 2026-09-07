/**
 * Privacy & Data Protection Utilities for Waghamba Sports Health Hub.
 * Enforces Aadhaar masking, PII minimization for AI, and client-side image compression.
 */

/**
 * Masks an Aadhaar number to display only the last 4 digits.
 * Input: "123456789012" or "1234 5678 9012"
 * Output: "•••• •••• 9012"
 */
export function maskAadhaar(raw?: string | null): string {
  if (!raw) return '---';
  const clean = raw.replace(/\D/g, '');
  if (clean.length === 0) return '---';
  if (clean.length <= 4) return `•••• •••• ${clean}`;
  const last4 = clean.slice(-4);
  return `•••• •••• ${last4}`;
}

/**
 * Validates whether an input string conforms to the 12-digit Indian Aadhaar format.
 */
export function isValidAadhaar(raw?: string | null): boolean {
  if (!raw) return false;
  const clean = raw.replace(/\D/g, '');
  if (clean.length !== 12) return false;
  // Aadhaar cannot start with 0 or 1
  if (clean[0] === '0' || clean[0] === '1') return false;
  // Exclude all identical digits (e.g. 222222222222)
  if (/^(\d)\1{11}$/.test(clean)) return false;
  return true;
}

/**
 * Sanitizes student information before sending it to any AI endpoint (Gemini / Genkit).
 * Completely eliminates Personally Identifiable Information (PII):
 * - Replaces real student name with an anonymous athlete tag.
 * - Strips Aadhaar number, parent names, contact numbers, and specific residential addresses.
 * - Retains only non-identifying physical & sports metrics (age, gender, sport, height, weight, BMI, fitness test values).
 */
export function sanitizeStudentForAI(student: Record<string, any>): Record<string, any> {
  const safeId = student.id ? `Athlete-${String(student.id).slice(-4)}` : 'Anonymous-Athlete';
  
  return {
    athleteId: safeId,
    age: student.age || (student.dob ? calculateAgeFromDOB(student.dob) : undefined),
    gender: student.gender || 'unspecified',
    standard: student.std ? `Class ${student.std}` : undefined,
    heightCm: student.height,
    weightKg: student.weight,
    bmi: student.bmi,
    sports: Array.isArray(student.sports) ? student.sports : [],
    fitnessScore: student.fitnessScore,
    fitnessLevel: student.fitnessLevel,
    // Strictly omit: name, nameMarathi, aadharNumber, aadharPhotoUrl, photoUrl, contactNumber, parentName, address
  };
}

function calculateAgeFromDOB(dobString: string): number | undefined {
  try {
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return undefined;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age > 0 && age < 100 ? age : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Compresses an image (File, Blob, or base64 DataURL) to a target dimension and quality.
 * Prevents saving large (1MB+) raw base64 data directly into Firestore documents.
 */
export async function compressImage(
  input: File | Blob | string,
  maxDimension: number = 800,
  quality: number = 0.75
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('compressImage can only be executed in a browser environment'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;

      // Scale proportionally if dimensions exceed maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Unable to obtain 2D canvas rendering context'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', quality);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, dataUrl, width, height });
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = (err) => reject(err);

    if (typeof input === 'string') {
      img.src = input;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(input);
    }
  });
}

/**
 * Tracks and releases Object URLs to prevent memory leaks in single-page applications.
 */
export class ObjectUrlManager {
  private urls = new Set<string>();

  create(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    this.urls.add(url);
    return url;
  }

  revoke(url: string): void {
    if (this.urls.has(url)) {
      URL.revokeObjectURL(url);
      this.urls.delete(url);
    }
  }

  revokeAll(): void {
    this.urls.forEach((url) => URL.revokeObjectURL(url));
    this.urls.clear();
  }
}
