// =============================================================
// TalentStd System - Google Apps Script Backend (code.gs)
// ระบบรับนักเรียนความสามารถพิเศษ
// =============================================================

// ==================== CONSTANTS ====================
var MASTER_KEY = "amhandsomeandcooltidgun";
var MAX_LOG_DAYS = 90;
var MAX_VARIANT = 200;
var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

var SHEETS = {
  CONFIG: 'config',
  USER: 'user',
  STUDENT: 'student',
  ADMISSION: 'admission',
  CRITERIA: 'criteria',
  SCORES: 'scores',
  LOG: 'log'
};

// ==================== ENTRY POINTS ====================

function doGet(e) {
  try {
    var params = e.parameter || {};
    var callback = params.callback;
    var result = processRequest(params);
    var jsonStr = JSON.stringify(result);

    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + jsonStr + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService
      .createTextOutput(jsonStr)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    var errResult = { success: false, error: error.toString() };
    var cb = (e.parameter || {}).callback;
    var errJson = JSON.stringify(errResult);
    if (cb) {
      return ContentService
        .createTextOutput(cb + '(' + errJson + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService
      .createTextOutput(errJson)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (lockErr) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Server busy, please try again.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  try {
    var params = {};
    if (e.postData && e.postData.contents) {
      params = JSON.parse(e.postData.contents);
    }
    var result = processRequest(params);
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// ==================== REQUEST PROCESSOR ====================

function processRequest(params) {
  var action = params.action;

  // Public endpoints
  if (action === 'ping') return { success: true, message: 'pong', timestamp: new Date().toISOString() };

  // Verify authentication keys
  if (!verifyKeys(params.key1, params.key2)) {
    return { success: false, error: 'Invalid authentication keys' };
  }

  switch (action) {
    // Auth
    case 'login_admin':  return loginAdmin(params);
    case 'login_judge':  return loginJudge(params);

    // Config
    case 'get_config':   return getConfigHandler(params);
    case 'set_config':   return setConfigHandler(params);

    // Admissions (การรับนักเรียน)
    case 'get_admissions':    return getAdmissions(params);
    case 'create_admission':  return createAdmission(params);
    case 'update_admission':  return updateAdmission(params);
    case 'delete_admission':  return deleteAdmission(params);

    // Judges (กรรมการ)
    case 'get_judges':    return getJudges(params);
    case 'create_judge':  return createJudge(params);
    case 'update_judge':  return updateJudge(params);
    case 'delete_judge':  return deleteJudge(params);

    // Students (นักเรียน)
    case 'get_students':    return getStudents(params);
    case 'create_student':  return createStudent(params);
    case 'update_student':  return updateStudent(params);
    case 'delete_student':  return deleteStudent(params);

    // Criteria (เกณฑ์การประเมิน)
    case 'get_criteria':   return getCriteria(params);
    case 'save_criteria':  return saveCriteria(params);

    // Scores (คะแนน)
    case 'get_scores':               return getScores(params);
    case 'save_scores':              return saveScores(params);
    case 'get_report':               return getReport(params);
    case 'get_admission_dashboard':  return getAdmissionDashboard(params);

    // Logs
    case 'archive_logs':   return archiveLogs();

    default:
      return { success: false, error: 'Unknown action: ' + action };
  }
}

// ==================== AUTHENTICATION ====================

function hashString(str) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    str,
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(b) {
    return ('0' + (b & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function verifyKeys(key1, key2) {
  if (!key1 || !key2) return false;
  if (key2 !== MASTER_KEY) return false;
  return verifyDynamicKey(key1);
}

function verifyDynamicKey(key) {
  if (!key) return false;
  var len = key.length;
  if (len < 8 || len > 12) return false;

  for (var v = 1; v <= MAX_VARIANT; v++) {
    var hash = hashString(MASTER_KEY + '|' + v);
    var candidate = '';
    for (var i = 0; i < len; i++) {
      var byte = parseInt(hash.slice(i * 2, i * 2 + 2), 16);
      candidate += CHARS[byte % CHARS.length];
    }
    if (candidate === key) return true;
  }
  return false;
}

function generateDynamicKey(variant, length) {
  var hash = hashString(MASTER_KEY + '|' + variant);
  var key = '';
  for (var i = 0; i < length; i++) {
    var byte = parseInt(hash.slice(i * 2, i * 2 + 2), 16);
    key += CHARS[byte % CHARS.length];
  }
  return key;
}

function loginAdmin(params) {
  var pin = String(params.pin || '');
  if (!pin) return { success: false, error: 'PIN required' };

  var adminPin = getConfigValue('admin_pin');
  if (pin !== adminPin) {
    addLog('system', 'admin', 'login_failed', 'Invalid admin PIN attempt');
    return { success: false, error: 'Invalid PIN' };
  }

  addLog('admin', 'admin', 'login', 'Admin logged in successfully');
  return { success: true, role: 'admin' };
}

function loginJudge(params) {
  var pin = String(params.pin || '');
  if (!pin) return { success: false, error: 'PIN required' };

  var sheet = getSheet(SHEETS.USER);
  if (!sheet) return { success: false, error: 'No users found' };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Columns: id, firstName, lastName, position, pin, role, isActive, createdAt
    if (String(row[4]) === pin && row[5] === 'judge' && row[6] === true) {
      var judge = {
        id: row[0],
        firstName: row[1],
        lastName: row[2],
        position: row[3],
        role: 'judge'
      };
      addLog(String(row[0]), 'judge', 'login', row[1] + ' ' + row[2] + ' logged in');
      return { success: true, role: 'judge', judge: judge };
    }
  }

  addLog('unknown', 'judge', 'login_failed', 'Invalid judge PIN: ' + pin);
  return { success: false, error: 'Invalid PIN or account inactive' };
}

// ==================== CONFIG ====================

function getConfigValue(key) {
  var sheet = getOrCreateSheet(SHEETS.CONFIG);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) return String(data[i][1]);
  }
  return null;
}

function setConfigValue(key, value, description) {
  var sheet = getOrCreateSheet(SHEETS.CONFIG);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value, description || '']);
}

function getConfigHandler(params) {
  var keyName = params.key_name;
  if (keyName) {
    return { success: true, key: keyName, value: getConfigValue(keyName) };
  }
  var sheet = getOrCreateSheet(SHEETS.CONFIG);
  var data = sheet.getDataRange().getValues();
  var config = {};
  for (var i = 1; i < data.length; i++) {
    config[data[i][0]] = data[i][1];
  }
  return { success: true, config: config };
}

function setConfigHandler(params) {
  var keyName = params.key_name;
  var value = params.value;
  if (!keyName) return { success: false, error: 'key_name required' };
  setConfigValue(keyName, value);
  return { success: true };
}

// ==================== ADMISSIONS (การรับนักเรียน) ====================

function getAdmissions(params) {
  var year = params.year || '';
  var sheetName = year ? SHEETS.ADMISSION + '_' + year : SHEETS.ADMISSION;
  var sheet = getSheet(sheetName);
  if (!sheet) return { success: true, admissions: [] };

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, admissions: [] };

  var admissions = data.slice(1)
    .filter(function(row) { return row[0] !== ''; })
    .map(function(row) {
      return {
        id: row[0],
        name: row[1],
        level: row[2],
        description: row[3],
        isActive: row[4],
        createdAt: row[5]
      };
    });

  return { success: true, admissions: admissions };
}

function createAdmission(params) {
  var data = {};
  try { data = JSON.parse(params.data || '{}'); } catch(e) { return { success: false, error: 'Invalid data JSON' }; }
  if (!data.name) return { success: false, error: 'name required' };

  var sheet = getOrCreateSheet(SHEETS.ADMISSION);
  ensureHeaders(sheet, ['id', 'name', 'level', 'description', 'isActive', 'createdAt']);

  var id = generateId();
  var now = new Date().toISOString();
  sheet.appendRow([id, data.name, data.level || '', data.description || '', true, now]);

  addLog('admin', 'admin', 'create_admission', 'Created: ' + data.name);
  return { success: true, id: id };
}

function updateAdmission(params) {
  var data = {};
  try { data = JSON.parse(params.data || '{}'); } catch(e) { return { success: false, error: 'Invalid data JSON' }; }
  if (!data.id) return { success: false, error: 'id required' };

  var sheet = getOrCreateSheet(SHEETS.ADMISSION);
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      if (data.name !== undefined)        sheet.getRange(i + 1, 2).setValue(data.name);
      if (data.level !== undefined)       sheet.getRange(i + 1, 3).setValue(data.level);
      if (data.description !== undefined) sheet.getRange(i + 1, 4).setValue(data.description);
      if (data.isActive !== undefined)    sheet.getRange(i + 1, 5).setValue(data.isActive);
      return { success: true };
    }
  }
  return { success: false, error: 'Admission not found' };
}

function deleteAdmission(params) {
  if (!params.id) return { success: false, error: 'id required' };
  return deleteRowById(SHEETS.ADMISSION, params.id);
}

// ==================== JUDGES (กรรมการ) ====================

function getJudges(params) {
  var sheet = getSheet(SHEETS.USER);
  if (!sheet) return { success: true, judges: [] };

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, judges: [] };

  var judges = data.slice(1)
    .filter(function(row) { return row[0] !== '' && row[5] === 'judge'; })
    .map(function(row) {
      return {
        id: row[0],
        firstName: row[1],
        lastName: row[2],
        position: row[3],
        pin: row[4],
        isActive: row[6],
        createdAt: row[7]
      };
    });

  return { success: true, judges: judges };
}

function createJudge(params) {
  var data = {};
  try { data = JSON.parse(params.data || '{}'); } catch(e) { return { success: false, error: 'Invalid data JSON' }; }
  if (!data.firstName || !data.lastName) return { success: false, error: 'firstName and lastName required' };

  var sheet = getOrCreateSheet(SHEETS.USER);
  ensureHeaders(sheet, ['id', 'firstName', 'lastName', 'position', 'pin', 'role', 'isActive', 'createdAt']);

  var id = generateId();
  var pin = generatePin();
  var now = new Date().toISOString();
  sheet.appendRow([id, data.firstName, data.lastName, data.position || '', pin, 'judge', true, now]);

  addLog('admin', 'admin', 'create_judge', 'Created judge: ' + data.firstName + ' ' + data.lastName);
  return { success: true, id: id, pin: pin };
}

function updateJudge(params) {
  var data = {};
  try { data = JSON.parse(params.data || '{}'); } catch(e) { return { success: false, error: 'Invalid data JSON' }; }
  if (!data.id) return { success: false, error: 'id required' };

  var sheet = getOrCreateSheet(SHEETS.USER);
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      if (data.firstName !== undefined) sheet.getRange(i + 1, 2).setValue(data.firstName);
      if (data.lastName !== undefined)  sheet.getRange(i + 1, 3).setValue(data.lastName);
      if (data.position !== undefined)  sheet.getRange(i + 1, 4).setValue(data.position);
      if (data.isActive !== undefined)  sheet.getRange(i + 1, 7).setValue(data.isActive);
      return { success: true };
    }
  }
  return { success: false, error: 'Judge not found' };
}

function deleteJudge(params) {
  if (!params.id) return { success: false, error: 'id required' };
  return deleteRowById(SHEETS.USER, params.id);
}

// ==================== STUDENTS (นักเรียน) ====================

function getStudents(params) {
  var year = params.year || '';
  var admissionId = params.admissionId || '';
  var sheetName = year ? SHEETS.STUDENT + '_' + year : SHEETS.STUDENT;
  var sheet = getSheet(sheetName);
  if (!sheet) return { success: true, students: [] };

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, students: [] };

  var students = data.slice(1)
    .filter(function(row) { return row[0] !== ''; })
    .map(function(row) {
      var info = {};
      try { info = JSON.parse(row[5] || '{}'); } catch(e) {}
      return Object.assign({
        id: row[0],
        prefix: row[1],
        firstName: row[2],
        lastName: row[3],
        classLv: row[4],
        admissionId: row[6],
        createdAt: row[7]
      }, info);
    });

  if (admissionId) {
    students = students.filter(function(s) { return s.admissionId === admissionId; });
  }

  return { success: true, students: students };
}

function createStudent(params) {
  var data = {};
  try { data = JSON.parse(params.data || '{}'); } catch(e) { return { success: false, error: 'Invalid data JSON' }; }
  if (!data.firstName || !data.lastName) return { success: false, error: 'firstName and lastName required' };

  var sheet = getOrCreateSheet(SHEETS.STUDENT);
  ensureHeaders(sheet, ['id', 'prefix', 'firstName', 'lastName', 'classLv', 'info', 'admissionId', 'createdAt']);

  var id = generateId();
  var now = new Date().toISOString();
  var info = {};
  ['gpa', 'sch', 'tel'].forEach(function(k) { if (data[k] !== undefined && data[k] !== '') info[k] = data[k]; });
  sheet.appendRow([id, data.prefix || '', data.firstName, data.lastName,
                   data.classLv || '', JSON.stringify(info), data.admissionId || '', now]);

  return { success: true, id: id };
}

function updateStudent(params) {
  var data = {};
  try { data = JSON.parse(params.data || '{}'); } catch(e) { return { success: false, error: 'Invalid data JSON' }; }
  if (!data.id) return { success: false, error: 'id required' };

  var sheet = getOrCreateSheet(SHEETS.STUDENT);
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      if (data.prefix !== undefined)      sheet.getRange(i + 1, 2).setValue(data.prefix);
      if (data.firstName !== undefined)   sheet.getRange(i + 1, 3).setValue(data.firstName);
      if (data.lastName !== undefined)    sheet.getRange(i + 1, 4).setValue(data.lastName);
      if (data.classLv !== undefined)     sheet.getRange(i + 1, 5).setValue(data.classLv);
      if (data.admissionId !== undefined) sheet.getRange(i + 1, 7).setValue(data.admissionId);
      // Merge info JSON
      var existing = {};
      try { existing = JSON.parse(rows[i][5] || '{}'); } catch(e) {}
      ['gpa', 'sch', 'tel'].forEach(function(k) { if (data[k] !== undefined) existing[k] = data[k]; });
      sheet.getRange(i + 1, 6).setValue(JSON.stringify(existing));
      return { success: true };
    }
  }
  return { success: false, error: 'Student not found' };
}

function deleteStudent(params) {
  if (!params.id) return { success: false, error: 'id required' };
  return deleteRowById(SHEETS.STUDENT, params.id);
}

// ==================== CRITERIA (เกณฑ์การประเมิน) ====================
// criteriaJson format:
// [{ "name": "ด้านคอมพิวเตอร์", "items": [{ "name": "การติดตั้ง", "maxScore": 10 }] }]

function getCriteria(params) {
  var admissionId = params.admissionId;
  if (!admissionId) return { success: false, error: 'admissionId required' };

  var sheet = getSheet(SHEETS.CRITERIA);
  if (!sheet) return { success: true, criteria: [] };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === admissionId) {
      try {
        var criteria = JSON.parse(data[i][1]);
        return { success: true, criteria: criteria, updatedAt: data[i][2] };
      } catch (e) {
        return { success: false, error: 'Corrupted criteria data' };
      }
    }
  }
  return { success: true, criteria: [] };
}

function saveCriteria(params) {
  var data = {};
  try { data = JSON.parse(params.data || '{}'); } catch(e) { return { success: false, error: 'Invalid data JSON' }; }
  if (!data.admissionId) return { success: false, error: 'admissionId required' };
  if (!data.criteria)    return { success: false, error: 'criteria required' };

  var sheet = getOrCreateSheet(SHEETS.CRITERIA);
  ensureHeaders(sheet, ['admissionId', 'criteriaJson', 'updatedAt']);

  var now = new Date().toISOString();
  var criteriaJson = JSON.stringify(data.criteria);
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.admissionId) {
      sheet.getRange(i + 1, 2).setValue(criteriaJson);
      sheet.getRange(i + 1, 3).setValue(now);
      return { success: true };
    }
  }

  sheet.appendRow([data.admissionId, criteriaJson, now]);
  return { success: true };
}

// ==================== SCORES (คะแนน) ====================
// scoresJson format:
// [{ "criteriaIndex": 0, "itemIndex": 0, "score": 8 }, ...]

function getScores(params) {
  var studentId  = params.studentId  || '';
  var admissionId = params.admissionId || '';
  var judgeId    = params.judgeId    || '';

  var sheet = getSheet(SHEETS.SCORES);
  if (!sheet) return { success: true, scores: [] };

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, scores: [] };

  var scores = data.slice(1)
    .filter(function(row) { return row[0] !== ''; })
    .map(function(row) {
      return {
        id: row[0],
        judgeId: row[1],
        studentId: row[2],
        admissionId: row[3],
        scoresJson: row[4],
        submittedAt: row[5]
      };
    });

  if (studentId)   scores = scores.filter(function(s) { return s.studentId === studentId; });
  if (admissionId) scores = scores.filter(function(s) { return s.admissionId === admissionId; });
  if (judgeId)     scores = scores.filter(function(s) { return s.judgeId === judgeId; });

  scores = scores.map(function(s) {
    try {
      return Object.assign({}, s, { scores: JSON.parse(s.scoresJson) });
    } catch (e) {
      return Object.assign({}, s, { scores: [] });
    }
  });

  return { success: true, scores: scores };
}

function saveScores(params) {
  var data = {};
  try { data = JSON.parse(params.data || '{}'); } catch(e) { return { success: false, error: 'Invalid data JSON' }; }
  if (!data.judgeId || !data.studentId || !data.admissionId) {
    return { success: false, error: 'judgeId, studentId, admissionId required' };
  }

  var sheet = getOrCreateSheet(SHEETS.SCORES);
  ensureHeaders(sheet, ['id', 'judgeId', 'studentId', 'admissionId', 'scoresJson', 'submittedAt']);

  var now = new Date().toISOString();
  var scoresJson = JSON.stringify(data.scores || []);
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === data.judgeId &&
        rows[i][2] === data.studentId &&
        rows[i][3] === data.admissionId) {
      sheet.getRange(i + 1, 5).setValue(scoresJson);
      sheet.getRange(i + 1, 6).setValue(now);
      addLog(data.judgeId, 'judge', 'save_scores', 'Student: ' + data.studentId);
      return { success: true };
    }
  }

  var id = generateId();
  sheet.appendRow([id, data.judgeId, data.studentId, data.admissionId, scoresJson, now]);
  addLog(data.judgeId, 'judge', 'save_scores', 'Student: ' + data.studentId);
  return { success: true, id: id };
}

function getReport(params) {
  var admissionId = params.admissionId;
  var studentId   = params.studentId;
  if (!admissionId || !studentId) {
    return { success: false, error: 'admissionId and studentId required' };
  }

  var criteriaResult = getCriteria({ admissionId: admissionId });
  if (!criteriaResult.success) return criteriaResult;
  var criteriaList = criteriaResult.criteria || [];

  var scoresResult = getScores({ studentId: studentId, admissionId: admissionId });
  if (!scoresResult.success) return scoresResult;
  var scoresList = scoresResult.scores || [];

  var judgesResult = getJudges({});
  var allJudges = judgesResult.judges || [];
  var activeJudges = allJudges.filter(function(j) { return j.isActive === true; });

  var judgesWithScores = scoresList.map(function(s) {
    var judge = allJudges.filter(function(j) { return j.id === s.judgeId; })[0];
    return Object.assign({}, s, {
      judgeName: judge ? judge.firstName + ' ' + judge.lastName : 'Unknown',
      judgePosition: judge ? judge.position : ''
    });
  });

  var report = criteriaList.map(function(category, catIdx) {
    var items = category.items.map(function(item, itemIdx) {
      var allScores = scoresList.map(function(s) {
        var entry = (s.scores || []).filter(function(sc) {
          return sc.criteriaIndex === catIdx && sc.itemIndex === itemIdx;
        })[0];
        return entry ? entry.score : null;
      }).filter(function(v) { return v !== null; });

      var avg = allScores.length > 0
        ? allScores.reduce(function(a, b) { return a + b; }, 0) / allScores.length
        : 0;

      return Object.assign({}, item, { average: Math.round(avg * 100) / 100, scores: allScores });
    });

    return Object.assign({}, category, { items: items });
  });

  var totalMax = 0;
  var totalAvg = 0;
  report.forEach(function(cat) {
    cat.items.forEach(function(item) {
      totalMax += item.maxScore;
      totalAvg += item.average;
    });
  });

  var isComplete = scoresList.length >= activeJudges.length && activeJudges.length > 0;

  return {
    success: true,
    report: report,
    judges: judgesWithScores,
    activeJudges: activeJudges,
    totalMax: totalMax,
    totalAvg: Math.round(totalAvg * 100) / 100,
    isComplete: isComplete,
    judgesScored: scoresList.length,
    totalJudges: activeJudges.length
  };
}

function getAdmissionDashboard(params) {
  var admissionId = params.admissionId;
  if (!admissionId) return { success: false, error: 'admissionId required' };

  var studentsResult = getStudents({ admissionId: admissionId });
  var students = studentsResult.students || [];

  var judgesResult = getJudges({});
  var allJudges = judgesResult.judges || [];
  var activeJudges = allJudges.filter(function(j) { return j.isActive === true; });
  var totalJudges = activeJudges.length;

  var scoresResult = getScores({ admissionId: admissionId });
  var allScores = scoresResult.scores || [];

  var completeCount = 0;
  var studentsWithStatus = students.map(function(student) {
    var studentScores = allScores.filter(function(s) { return s.studentId === student.id; });
    var judgesScored = studentScores.length;
    var isComplete = totalJudges > 0 && judgesScored >= totalJudges;
    if (isComplete) completeCount++;
    return Object.assign({}, student, {
      judgesScored: judgesScored,
      totalJudges: totalJudges,
      isComplete: isComplete
    });
  });

  return {
    success: true,
    students: studentsWithStatus,
    judges: activeJudges,
    totalStudents: students.length,
    completeCount: completeCount
  };
}

// ==================== LOG MANAGEMENT ====================

function addLog(userId, role, action, details) {
  try {
    var sheet = getOrCreateSheet(SHEETS.LOG);
    ensureHeaders(sheet, ['id', 'userId', 'role', 'action', 'details', 'timestamp']);
    sheet.appendRow([generateId(), userId, role, action, details, new Date().toISOString()]);
  } catch (e) {
    Logger.log('Log error: ' + e.toString());
  }
}

function archiveLogs() {
  var sheet = getSheet(SHEETS.LOG);
  if (!sheet) return { success: true, archived: 0 };

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, archived: 0 };

  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MAX_LOG_DAYS);

  var headers   = [data[0]];
  var oldRows   = [];
  var keepRows  = [];

  for (var i = 1; i < data.length; i++) {
    var ts = new Date(data[i][5]);
    if (ts < cutoff) {
      oldRows.push(data[i]);
    } else {
      keepRows.push(data[i]);
    }
  }

  if (oldRows.length === 0) return { success: true, archived: 0 };

  // Archive to year-specific sheet
  var oldestYear  = new Date(oldRows[0][5]).getFullYear();
  var thaiYear    = oldestYear + 543;
  var archiveName = 'log_' + thaiYear;
  var archiveSheet = getOrCreateSheet(archiveName);
  ensureHeaders(archiveSheet, ['id', 'userId', 'role', 'action', 'details', 'timestamp']);
  oldRows.forEach(function(row) { archiveSheet.appendRow(row); });

  // Rewrite main log sheet keeping only recent entries
  sheet.clearContents();
  var allKeep = headers.concat(keepRows);
  allKeep.forEach(function(row, idx) {
    sheet.getRange(idx + 1, 1, 1, row.length).setValues([row]);
  });

  return { success: true, archived: oldRows.length, archiveSheet: archiveName };
}

// ==================== TRIGGER SETUP ====================

function setupDailyArchiveTrigger() {
  // Remove existing triggers first
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'scheduledArchiveLogs') {
      ScriptApp.deleteTrigger(t);
    }
  });
  // Set up daily trigger at 1 AM
  ScriptApp.newTrigger('scheduledArchiveLogs')
    .timeBased()
    .everyDays(1)
    .atHour(1)
    .create();
  Logger.log('Daily archive trigger set up.');
}

function scheduledArchiveLogs() {
  var result = archiveLogs();
  Logger.log('Archived logs: ' + result.archived);
}

// ==================== UTILITY FUNCTIONS ====================

function getOrCreateSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function ensureHeaders(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }
  var firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var isEmpty  = firstRow.every(function(c) { return c === ''; });
  if (isEmpty) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function generateId() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 16);
}

function generatePin() {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

function deleteRowById(sheetName, id) {
  var sheet = getSheet(sheetName);
  if (!sheet) return { success: false, error: 'Sheet not found: ' + sheetName };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Record not found' };
}

// ==================== INITIAL SETUP ====================
// Run this once after deploying to set up the spreadsheet structure.

function initializeSpreadsheet() {
  var configSheet = getOrCreateSheet(SHEETS.CONFIG);
  ensureHeaders(configSheet, ['key', 'value', 'description']);

  var thaiYear = new Date().getFullYear() + 543;
  var defaults = [
    ['admin_pin',    '12345678', 'Admin PIN (8 digits) - CHANGE THIS'],
    ['current_year', String(thaiYear), 'Current Thai Buddhist Era year'],
    ['app_url',      'https://your-username.github.io/talentstd', 'App URL for QR Code'],
    ['school_name',  'โรงเรียนตัวอย่าง', 'School name shown on reports'],
    ['system_name',  'TalentStd', 'System display name']
  ];

  var existing = configSheet.getDataRange().getValues().slice(1).map(function(r) { return r[0]; });
  defaults.forEach(function(row) {
    if (existing.indexOf(row[0]) === -1) configSheet.appendRow(row);
  });

  getOrCreateSheet(SHEETS.USER);
  ensureHeaders(getSheet(SHEETS.USER), ['id','firstName','lastName','position','pin','role','isActive','createdAt']);

  getOrCreateSheet(SHEETS.STUDENT);
  ensureHeaders(getSheet(SHEETS.STUDENT), ['id','prefix','firstName','lastName','classLv','info','admissionId','createdAt']);

  getOrCreateSheet(SHEETS.ADMISSION);
  ensureHeaders(getSheet(SHEETS.ADMISSION), ['id','name','level','description','isActive','createdAt']);

  getOrCreateSheet(SHEETS.CRITERIA);
  ensureHeaders(getSheet(SHEETS.CRITERIA), ['admissionId','criteriaJson','updatedAt']);

  getOrCreateSheet(SHEETS.SCORES);
  ensureHeaders(getSheet(SHEETS.SCORES), ['id','judgeId','studentId','admissionId','scoresJson','submittedAt']);

  getOrCreateSheet(SHEETS.LOG);
  ensureHeaders(getSheet(SHEETS.LOG), ['id','userId','role','action','details','timestamp']);

  Logger.log('✅ TalentStd spreadsheet initialized successfully!');
  Logger.log('⚠️  Remember to change admin_pin in config sheet!');
  Logger.log('⚠️  Remember to update app_url in config sheet after deploying frontend!');
}
