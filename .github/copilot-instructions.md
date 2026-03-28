# TalentStd — Copilot Workspace Instructions

ไฟล์นี้ช่วยให้ AI เข้าใจโปรเจกต์ได้ทันที อ่านก่อนเริ่มแก้ไขโค้ดทุกครั้ง

---

## 1. โปรเจกต์คืออะไร

**TalentStd** — ระบบรับนักเรียนความสามารถพิเศษ  
Frontend: React Native Expo (Web/PWA/iOS/Android)  
Backend: Google Apps Script (GAS) + Google Sheets เป็น database  

---

## 2. Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | React Native Expo SDK 55, React 18 |
| Styling | NativeWind v4 (Tailwind CSS v3 — **ห้ามอัปเป็น v4**) |
| Font | Expo Google Fonts — Sarabun (ทุก weight) |
| Navigation | React Navigation v7, Stack + Drawer + Bottom Tabs |
| Cache | IndexedDB (web) + memory fallback (native), AES-encrypted via `crypto-js` |
| Backend | Google Apps Script, `doPost()` with LockService |
| Metro | `metro.config.cjs` (ตั้งใจ `.cjs` ไม่ใช่ `.js` — ห้ามเปลี่ยน) |

---

## 3. โครงสร้างไฟล์สำคัญ

```
src/
  config.js                  ← API URL ของ GAS
  services/
    api.js                   ← JSONP (web) / POST fetch (native), ส่ง key1+key2 ทุก call
    auth.js                  ← session management (getSession, logout)
    cache.js                 ← getCache / setCache / removeCache (TTL-based, AES encrypted)
  utils/
    theme.js                 ← COLORS, FONTS, FONT_SIZES, SPACING constants
    keyGenerator.js          ← Dynamic Key1 จาก Master Key2
    crypto.js                ← AES encrypt/decrypt
  navigation/
    AdminStack.js            ← Stack: AdminLogin → Admissions → AdmissionDetail → [Students/Criteria/Report/Judges/Settings]
    JudgeStack.js            ← Stack: JudgeLogin → JudgeStudents → JudgeScore
    DrawerNavigator.js       ← Drawer (tablet/desktop): Home | Judge | Admin
    BottomTabNavigator.js    ← Bottom tabs (mobile)
  screens/
    HomeScreen.js
    admin/
      AdminLoginScreen.js
      AdmissionsScreen.js    ← CRUD admission, กดการ์ด → AdmissionDetail
      AdmissionDetailScreen.js ← เมนูย่อย: นักเรียน/เกณฑ์/กรรมการ/รายงาน
      StudentsScreen.js      ← รับ route.params.admission (ข้าม pick step)
      CriteriaScreen.js      ← รับ route.params.admission (ข้าม pick step)
      JudgesScreen.js
      ReportScreen.js
      SettingsScreen.js
    judge/
      JudgeLoginScreen.js
      JudgeStudentsScreen.js
      JudgeScoreScreen.js
  components/
    ModalComponent.js
    ToastComponent.js
    GlobalLoadingModal.js
    HomeQuickLinks.js
    DrawerIconLabel.js
    OtpPinInput.js           ← 8-digit OTP box, auto-submit เมื่อครบ
```

---

## 4. Navigation Flow

```
DrawerNavigator (tablet/desktop) ─┬─ Home Tab
BottomTabNavigator (mobile)        ├─ Judge Tab → JudgeStack
                                   └─ Admin Tab → AdminStack

AdminStack:
  AdminLogin → Admissions → AdmissionDetail → Students
                                             → Criteria
                                             → Judges
                                             → Report
                           → Settings

JudgeStack:
  JudgeLogin → JudgeStudents → JudgeScore
```

---

## 5. Design System (theme.js)

- **Background**: `#F4F7FB` (warm off-white, ห้ามใช้ `#FFFFFF`)
- **Text**: `#0F172A` (off-black, ห้ามใช้ `#000000`)
- **Primary**: `#2563EB` (blue)
- **Secondary**: `#0D9488` (teal)
- **Error**: `#DC2626`
- **Font constants**: ใช้ `FONTS.regular`, `FONTS.medium`, `FONTS.semiBold`, `FONTS.bold`, `FONTS.extraBold` เสมอ — **ห้าม hardcode** `'Sarabun_700Bold'` ฯลฯ โดยตรง
- **Styling**: ใช้ `StyleSheet.create()` กับ `COLORS.*` / `FONTS.*` — admin screens ไม่ใช้ `className` prop

---

## 6. Security Keys

- **Key2 (Master Seed)**: `"amhandsomeandcooltidgun"`
- **Key1 (Dynamic)**: สร้างจาก Key2 ผ่าน `keyGenerator.js` — GAS ตรวจสอบได้
- ทุก API call แนบ `key1` + `key2` อัตโนมัติใน `api.js`

---

## 7. Cache Pattern (ทุก admin screen ใช้แบบนี้)

```js
// Read
const cached = await getCache('key');
if (cached) { setState(cached); return; }

// Fetch & write
const res = await api.getSomething();
if (res.success) {
  setState(res.data);
  await setCache('key', res.data, 10); // TTL 10 นาที
}

// Invalidate หลัง write
await removeCache('key');
fetchData(true);
```

Cache keys ที่ใช้: `admissions`, `judges`, `students_<admissionId>`, `criteria_<admissionId>`

---

## 8. ข้อควรระวัง (สำคัญมาก)

| ❌ ห้ามทำ | ✅ ทำแทน |
|-----------|----------|
| PowerShell `Get-Content` / `Set-Content` กับไฟล์มีภาษาไทย | ใช้ `node -e` + `fs.writeFileSync(path, content, 'utf8')` |
| `tailwindcss@4.x` | ต้องเป็น `tailwindcss@^3.4` เท่านั้น |
| เปลี่ยน `metro.config.cjs` เป็น `.js` | คงไว้เป็น `.cjs` เพื่อ Windows path compatibility |
| Script แก้ encoding ค้างอยู่ใน repo | ลบทิ้งทันทีหลังใช้ |
| Hardcode font string เช่น `'Sarabun_700Bold'` | ใช้ `FONTS.bold` จาก theme |

---

## 9. Backend (code.gs)

- `doPost()` ใช้ `LockService.getScriptLock()` ก่อน write ทุกครั้ง
- Sheet หลัก: `admissions`, `judges`, `students`, `criteria`, `scores`, `config`, `log`
- Sheet archive: `user_2568`, `log_2568` (เก็บข้อมูลเก่าตาม พ.ศ.)
- Config sheet: เก็บ Admin PIN (key: `adminPin`)

---

## 10. คำสั่ง Dev

```bash
npx expo start -c          # start with cache clear
npx expo start -c --web    # web only
```

Log การพัฒนา: ดูที่ `amLog.md` ในโฟลเดอร์ root

---

## 11. การสรุปประจำวัน (Daily Dev Log)

**ทุกครั้งที่ผู้ใช้ขอสรุปงานประจำวัน** ให้ทำตามขั้นตอนนี้เสมอ:

### ขั้นตอน
1. อ่าน `amLog.md` เพื่อดูว่าวันนี้มีการเปลี่ยนแปลงอะไรบ้าง
2. สรุปเป็น entry ใหม่และ **เพิ่มต่อใน `DEV_LOG` array** ใน `src/screens/AboutScreen.js` (เพิ่มที่ตำแหน่งบนสุดของ array)
3. อัปเดต `amLog.md` ถ้าจำเป็น

### รูปแบบ DEV_LOG entry
```js
{
  date: 'DD เดือน YYYY',   // เช่น '28 มีนาคม 2569' (พ.ศ.)
  title: 'สรุปหัวข้อสั้นๆ ของวัน',
  items: [
    { type: 'feat',     text: 'อธิบายฟีเจอร์ใหม่' },
    { type: 'fix',      text: 'อธิบายบักที่แก้' },
    { type: 'refactor', text: 'อธิบายการปรับโครงสร้าง' },
    { type: 'style',    text: 'อธิบายการเปลี่ยน UI/UX' },
    { type: 'learn',    text: 'อธิบายสิ่งที่เรียนรู้/บทเรียน' },
  ],
},
```

### ประเภท type ที่ใช้ได้
| type | ความหมาย |
|------|----------|
| `feat` | ฟีเจอร์ใหม่ |
| `fix` | แก้บัก |
| `refactor` | ปรับโครงสร้างโค้ด |
| `style` | เปลี่ยน UI/UX |
| `learn` | บทเรียน/สิ่งที่เรียนรู้ |

### ข้อควรระวัง
- ใช้ปี **พ.ศ.** เสมอ (ปี ค.ศ. + 543)
- เพิ่ม entry ใหม่ที่ **บนสุด** ของ DEV_LOG array (newest first)
- เขียน `text` ให้กระชับ เข้าใจได้ในบรรทัดเดียว
- เลือก `type` ให้ตรงกับลักษณะงานจริง
