// =============================================
// TalentStd - Auth Service
// Handles login, session, and role state
// =============================================

import { api } from './api';
import { setCache, getCache, removeCache } from './cache';

const SESSION_KEY = 'session';

export async function loginAdmin(pin) {
  const res = await api.loginAdmin(pin);
  if (res.success) {
    await setCache(SESSION_KEY, { role: 'admin', ts: Date.now() }, 120);
  }
  return res;
}

export async function loginJudge(pin) {
  const res = await api.loginJudge(pin);
  if (res.success) {
    await setCache(SESSION_KEY, { role: 'judge', judge: res.judge, ts: Date.now() }, 120);
  }
  return res;
}

export async function logout() {
  await removeCache(SESSION_KEY);
}

export async function getSession() {
  return getCache(SESSION_KEY);
}

export async function isLoggedIn() {
  const session = await getSession();
  return !!session && (session.role === 'admin' || session.role === 'judge');
}

export async function getRole() {
  const session = await getSession();
  return session?.role || null;
}
