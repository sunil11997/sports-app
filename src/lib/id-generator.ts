/**
 * Robust, collision-resistant ID generator for Waghamba Sports Health Hub.
 * Replaces non-secure, collision-prone Math.random() implementations.
 */

/**
 * Generates a collision-resistant identifier using Web Crypto API when available,
 * with a high-entropy fallback for legacy environments.
 * 
 * @param prefix Optional prefix for semantic identification (e.g. 'std', 'att', 'inj')
 * @returns Unique string ID, e.g. 'std_1725700000000_a1b2c3d4e5f6'
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now();
  let randomHex = '';

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    randomHex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // High-entropy fallback using timestamp and multi-variable pseudo-randomness
    const perf = typeof performance !== 'undefined' ? Math.floor(performance.now() * 1000) : 0;
    const rand1 = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
    const rand2 = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
    randomHex = `${rand1}${rand2}_${perf.toString(16)}`;
  }

  return prefix ? `${prefix}_${timestamp}_${randomHex.substring(0, 12)}` : `${timestamp}_${randomHex.substring(0, 12)}`;
}

/**
 * Generates a valid UUID v4 compliant string.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // RFC4122 v4 compliant fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
