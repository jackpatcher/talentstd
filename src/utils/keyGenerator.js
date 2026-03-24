// =============================================
// TalentStd - Dynamic Key Generator
//
// Key 2 (Master Key) : "amhandsomeandcooltidgun"  — static, hardcoded in both ends
// Key 1 (Dynamic Key): 8–12 alphanumeric uppercase chars, deterministically derived
//                      from the Master Key via SHA-256(masterKey + '|' + variant).
//
// The GAS backend uses the same algorithm, so it can verify any key produced here.
// =============================================

import { sha256 } from './crypto';

const MASTER_KEY = 'amhandsomeandcooltidgun';
const CHARS      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MAX_VARIANT = 200;

/** Derive a key of given length for a specific variant index (1..MAX_VARIANT). */
function deriveKey(variant, length) {
  const hash = sha256(MASTER_KEY + '|' + variant);
  let key = '';
  for (let i = 0; i < length; i++) {
    const byte = parseInt(hash.slice(i * 2, i * 2 + 2), 16);
    key += CHARS[byte % CHARS.length];
  }
  return key;
}

/** Return the master key (Key 2). */
export function getMasterKey() {
  return MASTER_KEY;
}

/** Generate a fixed deterministic key (variant 1, length 10) for default API auth. */
export function getDefaultKey() {
  return deriveKey(1, 10);
}

/**
 * Generate a specific key.
 * @param {number} variant  1–200
 * @param {number} length   8–12
 */
export function generateDynamicKey(variant = 1, length = 10) {
  if (variant < 1 || variant > MAX_VARIANT) throw new Error('Variant must be 1–' + MAX_VARIANT);
  if (length  < 8 || length  > 12)         throw new Error('Length must be 8–12');
  return deriveKey(variant, length);
}

/**
 * Verify that `key` can be derived from the master key.
 * Tries all variants and lengths 8–12.
 */
export function verifyDynamicKey(key) {
  if (!key || key.length < 8 || key.length > 12) return false;
  const len = key.length;
  for (let v = 1; v <= MAX_VARIANT; v++) {
    if (deriveKey(v, len) === key) return true;
  }
  return false;
}

/**
 * Generate `count` random distinct keys for the admin to pick one.
 * Returns an array of { variant, length, key }.
 */
export function generateKeyOptions(count = 6) {
  const options     = [];
  const usedVariants = new Set();

  while (options.length < count) {
    const variant = Math.floor(Math.random() * MAX_VARIANT) + 1;
    if (usedVariants.has(variant)) continue;
    usedVariants.add(variant);
    const length = 8 + Math.floor(Math.random() * 5); // 8–12
    options.push({ variant, length, key: deriveKey(variant, length) });
  }
  return options;
}
