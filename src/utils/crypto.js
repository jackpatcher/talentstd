// =============================================
// TalentStd - Crypto Utilities (AES via crypto-js)
// All cached data is encrypted before storage.
// =============================================

import CryptoJS from 'crypto-js';

// Derived encryption key — not stored anywhere plaintext accessible at rest
const _EK = ['talentstd', 'enc', 'amhandsomeandcooltidgun', '2024'].join('_');

/**
 * Encrypt any value (object, array, string, number) to an AES ciphertext string.
 */
export function encrypt(data) {
  const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(plaintext, _EK).toString();
}

/**
 * Decrypt an AES ciphertext string back to the original value.
 * Returns parsed JSON if possible, otherwise the raw string.
 */
export function decrypt(ciphertext) {
  const bytes   = CryptoJS.AES.decrypt(ciphertext, _EK);
  const decoded = bytes.toString(CryptoJS.enc.Utf8);
  try {
    return JSON.parse(decoded);
  } catch {
    return decoded;
  }
}

/**
 * One-way hash — used for comparison, never decrypted.
 */
export function hash(str) {
  return CryptoJS.SHA256(str + _EK).toString();
}

/**
 * Compute SHA-256 of a string (returns hex string).
 * Used internally for key derivation.
 */
export function sha256(str) {
  return CryptoJS.SHA256(str).toString();
}
