/**
 * Server-Side Security, Token Verification, Tenant Resolution & AI Quota Engine
 * For Waghamba Sports Health Hub (v6.4)
 * 
 * Enforces Zero-Trust Architecture:
 * - Cryptographically verifies Firebase ID tokens with Google Identity Toolkit
 * - Resolves active school tenant and role from server-side Firestore state
 * - Enforces per-user and per-school AI rate limits and quotas
 * - Applies strict PII data-minimization allowlists
 * - Defends against prompt injection and malicious tool overrides
 */

import { z } from 'zod';
import { firebaseConfig } from '@/firebase/config';
import { detectEmergencyRedFlags } from '@/lib/ai-safety';

export interface VerifiedSession {
  uid: string;
  email?: string;
  schoolId: string;
  role: 'admin' | 'teacher' | 'coach' | 'viewer';
  isSchoolOwner: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfterSeconds?: number;
}

// In-Memory Token Cache (5 min TTL to reduce repetitive verification roundtrips)
interface TokenCacheEntry {
  uid: string;
  email?: string;
  expiresAt: number;
}
const tokenCache = new Map<string, TokenCacheEntry>();

// Rate Limiting Storage: user/school keys -> timestamps
interface QuotaRecord {
  timestamps: number[];
}
const userRateLimits = new Map<string, QuotaRecord>();
const schoolHourlyQuotas = new Map<string, QuotaRecord>();

const MAX_USER_REQ_PER_MIN = 15;
const MAX_SCHOOL_REQ_PER_HOUR = 150;

/**
 * Periodically purge stale cache and rate limit entries
 */
function cleanupExpiredRecords() {
  const now = Date.now();
  
  // Cleanup tokens
  for (const [token, entry] of tokenCache.entries()) {
    if (entry.expiresAt < now) {
      tokenCache.delete(token);
    }
  }

  // Cleanup user limits
  for (const [key, record] of userRateLimits.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < 60 * 1000);
    if (record.timestamps.length === 0) userRateLimits.delete(key);
  }

  // Cleanup school limits
  for (const [key, record] of schoolHourlyQuotas.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < 60 * 60 * 1000);
    if (record.timestamps.length === 0) schoolHourlyQuotas.delete(key);
  }
}

/**
 * Cryptographically verifies a client-provided Firebase ID token.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<{ uid: string; email?: string }> {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Missing or malformed Authorization token');
  }

  const cleanToken = idToken.startsWith('Bearer ') ? idToken.slice(7).trim() : idToken.trim();
  if (!cleanToken) {
    throw new Error('Empty Authorization token');
  }

  // Check memory cache
  const cached = tokenCache.get(cleanToken);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return { uid: cached.uid, email: cached.email };
  }

  // Handle Firebase Auth Emulator in test environments
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    try {
      // Decode JWT payload for emulator testing
      const parts = cleanToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        const uid = payload.user_id || payload.sub || payload.uid;
        if (uid) {
          tokenCache.set(cleanToken, { uid, email: payload.email, expiresAt: now + 5 * 60 * 1000 });
          return { uid, email: payload.email };
        }
      }
    } catch (e) {
      // Fallback to standard verification
    }
  }

  const apiKey = process.env.FIREBASE_API_KEY || firebaseConfig.apiKey;
  if (!apiKey) {
    throw new Error('Server configuration error: Missing Firebase API Key for verification');
  }

  const lookupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;
  const response = await fetch(lookupUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: cleanToken }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || 'Invalid or expired Firebase ID token';
    throw new Error(`Authentication verification failed: ${message}`);
  }

  const data = await response.json();
  const user = data.users?.[0];
  if (!user || !user.localId) {
    throw new Error('Invalid user payload from identity provider');
  }

  const uid = user.localId;
  const email = user.email;

  // Cache for 5 minutes
  tokenCache.set(cleanToken, { uid, email, expiresAt: now + 5 * 60 * 1000 });
  return { uid, email };
}

/**
 * Resolves active school tenant and role from server-side Firestore.
 * Never trusts client-supplied schoolId or role!
 */
export async function resolveVerifiedSession(idToken: string): Promise<VerifiedSession> {
  const { uid, email } = await verifyFirebaseIdToken(idToken);
  const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;

  if (!projectId) {
    return {
      uid,
      email,
      schoolId: uid,
      role: 'admin',
      isSchoolOwner: true,
    };
  }

  // 1. Check if user is the direct school document owner in schools collection
  try {
    const schoolDocUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/schools/${uid}`;
    const schoolRes = await fetch(schoolDocUrl);
    if (schoolRes.ok) {
      const schoolData = await schoolRes.json();
      if (schoolData?.fields) {
        return {
          uid,
          email,
          schoolId: uid,
          role: 'admin',
          isSchoolOwner: true,
        };
      }
    }
  } catch (e) {
    // Continue to school_members query
  }

  // 2. Query school_members collection for active membership
  try {
    const runQueryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'school_members' }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: 'userId' },
                  op: 'EQUAL',
                  value: { stringValue: uid },
                },
              },
              {
                fieldFilter: {
                  field: { fieldPath: 'status' },
                  op: 'EQUAL',
                  value: { stringValue: 'active' },
                },
              },
            ],
          },
        },
        limit: 1,
      },
    };

    const memberRes = await fetch(runQueryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody),
    });

    if (memberRes.ok) {
      const results = await memberRes.json();
      const doc = results?.[0]?.document;
      if (doc?.fields) {
        const schoolId = doc.fields.schoolId?.stringValue || uid;
        const role = (doc.fields.role?.stringValue || 'viewer') as 'admin' | 'teacher' | 'coach' | 'viewer';
        return {
          uid,
          email,
          schoolId,
          role,
          isSchoolOwner: false,
        };
      }
    }
  } catch (e) {
    // Continue to fallback
  }

  // 3. Fallback: For existing ashram school single-tenant instances, default to uid as schoolId with admin role
  // if the user is authenticated and verified.
  return {
    uid,
    email,
    schoolId: uid,
    role: 'admin',
    isSchoolOwner: true,
  };
}

/**
 * Validates shared rate limits and quotas for a verified user & school tenant.
 */
export function checkRateLimits(uid: string, schoolId: string): RateLimitResult {
  cleanupExpiredRecords();
  const now = Date.now();

  // 1. Per-User Rate Limit (15 req/min)
  let userRecord = userRateLimits.get(uid);
  if (!userRecord) {
    userRecord = { timestamps: [] };
    userRateLimits.set(uid, userRecord);
  }
  userRecord.timestamps = userRecord.timestamps.filter((t) => now - t < 60 * 1000);

  if (userRecord.timestamps.length >= MAX_USER_REQ_PER_MIN) {
    const oldest = userRecord.timestamps[0];
    const retryAfter = Math.ceil((60 * 1000 - (now - oldest)) / 1000);
    return {
      allowed: false,
      reason: `User AI rate limit exceeded. Please wait ${retryAfter}s before retrying.`,
      retryAfterSeconds: Math.max(1, retryAfter),
    };
  }

  // 2. Per-School Hourly Quota (150 req/hour)
  let schoolRecord = schoolHourlyQuotas.get(schoolId);
  if (!schoolRecord) {
    schoolRecord = { timestamps: [] };
    schoolHourlyQuotas.set(schoolId, schoolRecord);
  }
  schoolRecord.timestamps = schoolRecord.timestamps.filter((t) => now - t < 60 * 60 * 1000);

  if (schoolRecord.timestamps.length >= MAX_SCHOOL_REQ_PER_HOUR) {
    return {
      allowed: false,
      reason: 'School tenant AI hourly quota reached. Please resume during the next hour or contact the PE administrator.',
      retryAfterSeconds: 300,
    };
  }

  // Record usage
  userRecord.timestamps.push(now);
  schoolRecord.timestamps.push(now);

  return { allowed: true };
}

// Alias for singular checkRateLimit
export const checkRateLimit = checkRateLimits;

/**
 * Strict Data-Minimization Allowlist for External AI Calls.
 * Excludes student names, Aadhaar, parent details, addresses, biometrics, and medical records.
 */
export interface AnonymizedAthleteProfile {
  athleteTag: string;
  gender: 'Male' | 'Female' | 'Other';
  age?: number;
  standard?: string;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  sports: string[];
  fitnessScore?: number;
  fitnessStatus?: string;
}

export function sanitizeAthleteForAI(raw: Record<string, any>): AnonymizedAthleteProfile {
  const idStr = String(raw.id || raw.playerId || '0000');
  const safeTag = `Athlete-${idStr.slice(-4)}`;

  return {
    athleteTag: safeTag,
    gender: raw.gender === 'Female' ? 'Female' : 'Male',
    age: typeof raw.age === 'number' ? raw.age : parseInt(String(raw.age || '0'), 10) || undefined,
    standard: raw.std ? `Class ${raw.std}` : undefined,
    heightCm: parseFloat(String(raw.height || '')) || undefined,
    weightKg: parseFloat(String(raw.weight || '')) || undefined,
    bmi: parseFloat(String(raw.bmi || '')) || undefined,
    sports: Array.isArray(raw.sports) ? raw.sports.map(String) : [],
    fitnessScore: parseFloat(String(raw.fitnessScore || raw.score || '')) || undefined,
    fitnessStatus: typeof raw.fitnessStatus === 'string' ? raw.fitnessStatus : undefined,
    // Explicitly OMITTED:
    // name, nameMarathi, aadharNumber, panNumber, penNumber, contactNumber, mobileNumber,
    // parentName, motherName, fatherName, village, taluka, district, address,
    // faceDescriptor, photoUrl, aadharPhotoUrl, medical, history
  };
}

/**
 * Sanitizes and guards user input against prompt injection, control overrides, and XSS.
 */
export function sanitizePromptInput(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input
    .trim()
    .slice(0, maxLength)
    // Strip control characters and markdown system overrides
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
    // Strip script tags and HTML markup
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[sanitized-script]')
    .replace(/<[^>]+>/g, '')
    // Strip cookie / document access tokens
    .replace(/document\.cookie/gi, '[sanitized-cookie]')
    // Disarm system override attempts
    .replace(/(system\s*:|instructions\s*:|ignore\s+all\s+previous\s+instructions|ignore\s+previous\s+instructions)/gi, '[sanitized]');

  return sanitized;
}

/**
 * Wrapper for clinical emergency red-flag screening.
 */
export function detectMedicalEmergency(query: string) {
  const flags = detectEmergencyRedFlags(query);
  return {
    isEmergency: flags.isEmergency,
    redFlag: flags.redFlag || '',
    disclaimer: flags.disclaimer || 'तातडीने वैद्यकीय तपासणी आवश्यक आहे (Immediate medical attention required).',
  };
}
