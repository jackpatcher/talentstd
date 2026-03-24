// =============================================
// TalentStd - IndexedDB Cache Service
// All data is AES-encrypted before storage.
// Falls back to in-memory cache on native/SSR.
// =============================================

import { Platform } from 'react-native';
import { encrypt, decrypt } from '../utils/crypto';

const DB_NAME    = 'talentstd_cache';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

let _db = null;
const _mem = new Map(); // memory fallback

// -------- IndexedDB helpers --------

async function openDB() {
  if (_db) return _db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'cacheKey' });
      }
    };

    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror   = (e) => reject(e.target.error);
  });
}

function useIDB() {
  return Platform.OS === 'web' && typeof indexedDB !== 'undefined';
}

// -------- Public API --------

/**
 * Store `data` for `key` with a TTL (minutes, default 60).
 */
export async function setCache(key, data, ttlMinutes = 60) {
  const encrypted = encrypt(data);
  const expiry    = Date.now() + ttlMinutes * 60 * 1000;

  if (useIDB()) {
    try {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE_NAME, 'readwrite');
        const req = tx.objectStore(STORE_NAME).put({ cacheKey: key, data: encrypted, expiry });
        req.onsuccess = resolve;
        req.onerror   = reject;
      });
      return;
    } catch (err) {
      console.warn('[Cache] IndexedDB write failed, falling back to memory:', err);
    }
  }

  _mem.set(key, { data: encrypted, expiry });
}

/**
 * Retrieve cached value for `key`. Returns null if missing or expired.
 */
export async function getCache(key) {
  if (useIDB()) {
    try {
      const db   = await openDB();
      const item = await new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror   = reject;
      });

      if (!item) return null;
      if (item.expiry < Date.now()) { await removeCache(key); return null; }
      return decrypt(item.data);
    } catch (err) {
      console.warn('[Cache] IndexedDB read failed:', err);
    }
  }

  const item = _mem.get(key);
  if (!item) return null;
  if (item.expiry < Date.now()) { _mem.delete(key); return null; }
  return decrypt(item.data);
}

/**
 * Remove a single cache entry.
 */
export async function removeCache(key) {
  if (useIDB()) {
    try {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE_NAME, 'readwrite');
        const req = tx.objectStore(STORE_NAME).delete(key);
        req.onsuccess = resolve;
        req.onerror   = reject;
      });
    } catch (err) {
      console.warn('[Cache] IndexedDB delete failed:', err);
    }
  }
  _mem.delete(key);
}

/**
 * Clear all cache entries.
 */
export async function clearCache() {
  if (useIDB()) {
    try {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE_NAME, 'readwrite');
        const req = tx.objectStore(STORE_NAME).clear();
        req.onsuccess = resolve;
        req.onerror   = reject;
      });
    } catch (err) {
      console.warn('[Cache] IndexedDB clear failed:', err);
    }
  }
  _mem.clear();
}

// -------- Cache Key Constants --------

export const CACHE_KEYS = {
  ADMISSIONS:       'admissions',
  JUDGES:           'judges',
  STUDENTS:         'students',
  CONFIG:           'config',
  CRITERIA_PREFIX:  'criteria_',   // append admissionId
  SCORES_PREFIX:    'scores_',     // append studentId_admissionId
};
