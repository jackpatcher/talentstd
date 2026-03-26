// =============================================
// TalentStd - API Client
// Uses JSONP on Web (avoids CORS), plain fetch on native.
// =============================================

import { Platform } from 'react-native';
import { getDefaultKey, getMasterKey } from '../utils/keyGenerator';
import { API_URL } from '../config';

// ---- Config ----

// Use API_URL from config.js as default
let _apiUrl = API_URL;

export function setApiUrl(url)  { _apiUrl = url; }
export function getApiUrl()     { return _apiUrl; }

// ---- JSONP (Web) ----

function callJSONP(params) {
  return new Promise((resolve, reject) => {
    const cbName = `_tscb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const qs = new URLSearchParams({
      ...params,
      callback: cbName,
      key1: getDefaultKey(),
      key2: getMasterKey(),
    });

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Request timeout (30s)'));
    }, 30_000);

    const script = document.createElement('script');

    function cleanup() {
      clearTimeout(timeout);
      delete window[cbName];
      script.parentNode?.removeChild(script);
    }

    window[cbName] = (data) => { cleanup(); resolve(data); };

    script.onerror = () => { cleanup(); reject(new Error('Network error')); };
    script.src     = `${_apiUrl}?${qs.toString()}`;
    document.head.appendChild(script);
  });
}

// ---- Fetch (Native / SSR) ----

async function callFetch(params) {
  const qs = new URLSearchParams({
    ...params,
    key1: getDefaultKey(),
    key2: getMasterKey(),
  });

  const res = await fetch(`${_apiUrl}?${qs.toString()}`, {
    method:  'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ---- Common dispatcher ----

export async function callAPI(params) {
  if (!_apiUrl) {
    throw new Error('API URL not configured. Please set it in Admin → Settings.');
  }

  if (Platform.OS === 'web') {
    return callJSONP(params);
  }
  return callFetch(params);
}

// ---- High-level API methods ----

export const api = {
  // ── Auth ──────────────────────────────────────
  loginAdmin:  (pin)  => callAPI({ action: 'login_admin', pin }),
  loginJudge:  (pin)  => callAPI({ action: 'login_judge', pin }),

  // ── Config ────────────────────────────────────
  getConfig:   ()          => callAPI({ action: 'get_config' }),
  setConfig:   (key, val)  => callAPI({ action: 'set_config', key_name: key, value: val }),

  // ── Admissions ────────────────────────────────
  getAdmissions:   (year)    => callAPI({ action: 'get_admissions', ...(year ? { year } : {}) }),
  createAdmission: (data)    => callAPI({ action: 'create_admission', data: JSON.stringify(data) }),
  updateAdmission: (data)    => callAPI({ action: 'update_admission', data: JSON.stringify(data) }),
  deleteAdmission: (id)      => callAPI({ action: 'delete_admission', id }),

  // ── Judges ────────────────────────────────────
  getJudges:   ()     => callAPI({ action: 'get_judges' }),
  createJudge: (data) => callAPI({ action: 'create_judge', data: JSON.stringify(data) }),
  updateJudge: (data) => callAPI({ action: 'update_judge', data: JSON.stringify(data) }),
  deleteJudge: (id)   => callAPI({ action: 'delete_judge', id }),

  // ── Students ──────────────────────────────────
  getStudents:   (admissionId) => callAPI({ action: 'get_students', ...(admissionId ? { admissionId } : {}) }),
  createStudent: (data)        => callAPI({ action: 'create_student', data: JSON.stringify(data) }),
  updateStudent: (data)        => callAPI({ action: 'update_student', data: JSON.stringify(data) }),
  deleteStudent: (id)          => callAPI({ action: 'delete_student', id }),

  // ── Criteria ──────────────────────────────────
  getCriteria:  (admissionId)          => callAPI({ action: 'get_criteria', admissionId }),
  saveCriteria: (admissionId, criteria) => callAPI({
    action: 'save_criteria',
    data:   JSON.stringify({ admissionId, criteria }),
  }),

  // ── Scores ────────────────────────────────────
  getScores:  (params) => callAPI({ action: 'get_scores',  ...params }),
  saveScores: (data)   => callAPI({ action: 'save_scores', data: JSON.stringify(data) }),
  getReport:  (admissionId, studentId) => callAPI({ action: 'get_report', admissionId, studentId }),

  // ── Logs ──────────────────────────────────────
  archiveLogs: () => callAPI({ action: 'archive_logs' }),
};
