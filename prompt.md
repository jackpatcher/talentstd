สวมบทบาทเป็น Expert Full-Stack Developer (React Native Expo & Google Apps Script)
ฉันต้องการให้คุณสร้างโค้ดสำหรับระบบที่พร้อมใช้งานจริงชื่อว่า "talentStd" (ระบบรับนักเรียนความสามารถพิเศษ)

กรุณาอ่านความต้องการด้านล่างอย่างละเอียดและสร้างโค้ดออกมาทีละขั้นตอน โดยแยกตามไฟล์ให้ชัดเจน

### 1. Tech Stack & Environment
- **Frontend:** React Native Expo (ตั้งค่าให้รองรับ Web/PWA, iOS และ Android) สามารถ Deploy ขึ้น GitHub Pages ได้
- **Backend:** Google Apps Script (GAS) ทำหน้าที่เป็น API โดยใช้ Google Sheets เป็นฐานข้อมูล
- **การจัดการไฟล์:** สำหรับ Backend ให้รวมโค้ดทั้งหมดไว้ในไฟล์ `code.gs` สำหรับ Frontend ให้จัดโครงสร้างโฟลเดอร์ตามมาตรฐาน Expo (เช่น components, screens, services, utils)

### 2. Frontend Requirements (React Native Expo)
- **UI/UX & Responsiveness:**
  - Tablet/Desktop: แสดง Sidebar Menu ด้านซ้าย (มีไอคอน + ข้อความอยู่ใต้ไอคอน) และพื้นที่ Content อยู่ด้านขวา
  - Mobile: เปลี่ยนจาก Drawer Menu เป็น Bottom Navigation โดยอัตโนมัติตามขนาดหน้าจอ
- **Theme & Typography:**
  - Font: ใช้ฟอนต์ "TH Sarabun" ทั้งระบบ
  - Colors: ใช้โทนสีอุ่นเกือบขาว (Warm Off-White เช่น #FBFBF9) สำหรับพื้นหลัง และสีเกือบดำ (Off-Black เช่น #2C2C2C) สำหรับตัวหนังสือ ห้ามใช้สีขาวล้วนและดำล้วน
- **Components:** สร้างโมดูล Component ให้สวยงามและเรียกใช้งานง่าย:
  - `ModalComponent` (สำหรับแสดง Popup หรือ Form)
  - `ToastComponent` (สำหรับแจ้งเตือนผู้ใช้)
  - `GlobalLoadingModal` (แสดง Modal บล็อกหน้าจอระหว่างรอโหลดข้อมูลชุดใหญ่ และรอจนจบกระบวนการจึงจะปิดได้)
- **Caching & Security (เน้นทำงานบน Web):**
  - เมื่อเริ่มแอป ให้โหลดข้อมูลที่จำเป็นมาเก็บไว้ใน `IndexedDB` เป็น Cache 
  - ข้อมูลที่เก็บลง Cache **ต้องถูกเข้ารหัส (Encrypt)** เสมอ (เช่น ใช้ `crypto-js`)
- **Authentication/Security Keys:**
  - มีระบบส่งข้อมูลด้วย Key 2 ชุดในการเข้าถึง DB
  - Key 2 (Master Key): ใช้ข้อความคือ "amhandsomeandcooltidgun"
  - Key 1 (Dynamic Key): เป็นรหัสตัวเลขผสมตัวอักษรพิมพ์ใหญ่ 8-12 ตัว ที่สามารถสร้างได้หลายรูปแบบ แต่ต้องสกัดกลับมาเช็กได้ว่ามีรากฐานมาจาก Key 2 เท่านั้น
- **API Communication (สำคัญ):** - ใช้ `fetch` ส่งข้อมูลแบบ `POST` Request ด้วย JSON payload 
  - **ต้อง** ตั้งค่า `redirect: 'follow'` ใน fetch options เพื่อจัดการปัญหา CORS ของ Google Apps Script ได้อย่างสมบูรณ์โดยไม่ต้องใช้ JSONP
- **Routing (แบบ Next.js):** URL เป็นปลายทาง slug เช่น `/home`, `/judge/login`, `/admin/admissions` ใช้ Expo Linking config ร่วมกับ hash-based fallback เพื่อป้องกัน 404 บน GitHub Pages
- **OTP PIN Input:** ช่องกรอกรหัส PIN 8 หลักเป็นกล่องแบบ OTP (8 กล่องเรียงแถว) กรอกครบแล้ว submit อัตโนมัติทันที ทำเป็น component กลาง
- **Styling:** ใช้ **NativeWind (Tailwind RN)** สำหรับทุกส่วนของ UI (`className` prop) ติดตั้ง `nativewind`, `tailwindcss`, `metro.config.js`, `tailwind.config.js`, `global.css`

### 3. Backend Requirements (Google Apps Script - code.gs)
- **Concurrency Control (สำคัญมาก):** ในฟังก์ชัน `doPost()` ต้องใช้ `LockService.getScriptLock()` (ตั้งเวลา waitLock) เสมอ ก่อนที่จะเขียนข้อมูลลงชีท เพื่อป้องกันปัญหากรรมการหลายคนกดเซฟคะแนนพร้อมกันแล้วข้อมูลทับซ้อนกัน
- **Database Architecture (Google Sheets):**
  - ข้อมูลที่มีโครงสร้างซับซ้อน (เช่น เกณฑ์คะแนนที่เชื่อมหลายตาราง) ให้แปลงเป็น JSON String แล้วเก็บลงในคอลัมน์เดียว 
  - **ระบบเก็บข้อมูลหลายปี:** ข้อมูลปีปัจจุบันให้ใช้ชื่อชีทปกติ (เช่น `user`) ส่วนข้อมูลเก่าให้ระบุ พ.ศ. ด้วย (เช่น `user_2568`) ระบบต้องรองรับการ Query ข้อมูลตามปีได้
  - **Log System:** เก็บ Log การเข้าระบบไว้ 90 วัน (ในชีทหลัก) หากเกินให้มี Trigger ดึงข้อมูลย้ายไปเก็บสะสมไว้ในชีท เช่น `log_2568`
  - มีชีท `config` สำหรับเก็บค่าแบบ Key-Value

### 4. Business Logic: ระบบ "talentStd"
**4.1 ระบบ Admin (เข้าระบบด้วยรหัสตัวเลข 8 ตัวจากชีท config):**
- CRUD ชื่อการรับนักเรียน (เช่น คอมพิวเตอร์ ม.ต้น, พละ ม.ปลาย)
- CRUD กรรมการตัดสิน (ชื่อ, สกุล, ตำแหน่ง) และสร้างรหัสตัวเลข 8 ตัวให้กรรมการแต่ละคนอัตโนมัติ
- CRUD รายชื่อนักเรียน
- CRUD ลักษณะความสามารถ (เช่น ด้านคอมพิวเตอร์)
  - สร้างเกณฑ์ และหัวข้อย่อยได้ พร้อมระบุ "คะแนนเต็ม" (เช่น หัวข้อ 1: 10 คะแนน, หัวข้อ 2: 20 คะแนน)
- **QR Code:** สร้าง QR Code ที่มีลิงก์ระบบให้กรรมการสแกนเข้า Login
- **ระบบ Report & Print:**
  - หน้า Dashboard เช็กว่ากรรมการทุกคนกรอกคะแนนนักเรียนครบหรือไม่
  - **การพิมพ์ A4:** ให้ใช้ `expo-print` (หรือสร้าง HTML String ที่ฝัง CSS `@media print`) เพื่อสั่งพิมพ์รายงานออกเป็น A4 แนวตั้ง
  - Layout: ด้านบนจัดกลาง (ชื่อการรับนักเรียน) -> ตาราง (เกณฑ์, หัวข้อย่อย, คะแนนเต็ม, คะแนนเฉลี่ยจากกรรมการทุกคน) -> คะแนนรวม -> ล่างสุดเป็นช่องเซ็นชื่อกรรมการ (2 คอลัมน์/แถว พร้อมชื่อ ตำแหน่ง วันที่)

**4.2 ระบบกรรมการ (เข้าระบบผ่านรหัส 8 ตัว):**
- ดูรายชื่อนักเรียนที่ต้องประเมิน
- กรอกคะแนนในแต่ละหัวข้อย่อย (มี Validation ดักไม่ให้กรอกเกินคะแนนเต็มของหัวข้อนั้นๆ)

**4.3 ระบบ Logout (ทั้ง Admin และ กรรมการ):**
- ทุกหน้าที่อยู่หลังจาก login ให้มีปุ่ม **ออกจากระบบ** แสดงสีเตือนไว้ที่ Header ด้านขวา
- กดแล้ว: ล้าง session cache แล้ว reset นำทางกลับหน้า Login ทันที

กรุณาเริ่มด้วยการสร้างโค้ด Backend (code.gs) ที่มี LockService และโครงสร้างชีทให้ครบถ้วนก่อน จากนั้นค่อยเริ่มเขียนโค้ดฝั่ง React Native



ENG VERSION
Act as an Expert Full-Stack Developer (React Native Expo & Google Apps Script).
I need you to generate a complete, production-ready codebase for a system called "talentStd" (Special Talent Student Admission System).

Please read the following requirements carefully and generate the code step-by-step, separated by files.

### 1. Tech Stack & Environment
- **Frontend:** React Native Expo (configured for Web/PWA, iOS, and Android). Deployable to GitHub Pages.
- **Backend:** Google Apps Script (GAS) acting as an API, using Google Sheets as the database.
- **File Management:** For backend, put everything in `code.gs`. For frontend, organize into standard Expo folders (e.g., components, screens, services, utils).

### 2. Frontend Requirements (React Native Expo)
- **UI/UX & Responsiveness:**
  - Tablet/Desktop: Display a Left sidebar Menu (Icon + Text bottom of icon) and right-side content area.
  - Mobile: Switch from Drawer to Bottom Navigation automatically based on screen size.
- **Theme & Typography:**
  - Font: Use "TH Sarabun" globally.
  - Colors: Use Warm Off-White (e.g., #FBFBF9) for backgrounds and Off-Black (e.g., #2C2C2C) for text. Strictly avoid pure white (#FFFFFF) or pure black (#000000).
- **Components:** Create beautiful, reusable modules for:
  - `ModalComponent` (for popups/forms).
  - `ToastComponent` (for global user notifications).
  - `GlobalLoadingModal` (blocks UI and waits until heavy data fetching finishes before closing).
- **Caching & Security (Web-focused):**
  - On app load, fetch all necessary data and cache it using `IndexedDB` to prioritize frontend processing.
  - The cached data MUST be encrypted (e.g., using `crypto-js`) before saving to prevent unauthorized reading.
- **Authentication/Security Keys:**
  - Implement a 2-key security system for API payload validation.
  - Key 2 (Master Seed): "amhandsomeandcooltidgun".
  - Key 1 (Dynamic Hash): An 8-12 character alphanumeric string (uppercase letters + numbers) generated deterministically using Key 2 as the root. The backend must be able to verify this relationship.
- **API Communication (CRITICAL):** Send JSON payloads via `POST` requests using `fetch()`.
  - You MUST include `redirect: 'follow'` in the fetch options. This handles Google Apps Script CORS issues for React Native Web without JSONP.
- **Routing (Next.js-style):** URLs must use slug-style paths (e.g., `/home`, `/judge/login`, `/admin/admissions`). Use Expo Linking deep-link config and hash-based fallback to prevent 404 errors on GitHub Pages.
- **OTP PIN Input:** The 8-digit PIN entry screen must use an OTP-style UI — 8 individual boxes in a row. When all 8 digits are filled, submit fires automatically. Extract into a reusable `OtpPinInput` component.
- **Styling:** Use **NativeWind (Tailwind for React Native)** for all UI styling (`className` prop on all components). Setup requires `nativewind`, `tailwindcss`, `metro.config.js` with `withNativeWind`, `tailwind.config.js` with custom brand colors, and a `global.css` entry point.

### 3. Backend Requirements (Google Apps Script - code.gs)
- **Concurrency Control (CRITICAL):** Inside `doPost()`, you MUST implement `LockService.getScriptLock()` with a `waitLock` timer before writing any data to the sheets. This prevents data race conditions and overwrites when multiple judges submit scores simultaneously.
- **Database Architecture (Google Sheets):**
  - **JSON Stringification:** For complex relational data (like nested rubrics/scores), stringify the JSON object and save it into a single column to minimize sheet complexity and speed up queries.
  - **Archiving Logic:** Use base sheet names for the current year (e.g., `user`). For older data, query sheets with Buddhist year suffixes (e.g., `user_2568`). The API must dynamically handle historical data queries.
  - **Log Rotation:** Keep system access logs in the main `log` sheet for 90 days. Write a GAS trigger/function to automatically move logs older than 90 days to an archive sheet (e.g., `log_2568`).
  - **Config Sheet:** Maintain a `config` sheet storing key-value pairs (e.g., Admin PIN).

### 4. Business Logic: "talentStd" System
**4.1 Admin Features (Login via 8-digit numeric PIN from `config` sheet):**
- CRUD Admission Types (e.g., Computer Junior High, PE Senior High).
- CRUD Judges (Name, Surname, Position). Auto-generate an 8-digit numeric login PIN for each judge.
- CRUD Students.
- CRUD Talent Categories & Dynamic Scoring Rubric:
  - Create categories (e.g., Computer, Robotics).
  - Add nested Sub-criteria and assign a "Max Score" for each (e.g., Sub 1: Installation [Max 10], Sub 2: Usage Proficiency [Max 20]).
- **Judge Access Generation:** Generate a single URL + QR Code for Judges to scan and access the login portal easily.
- **Reporting System & Printing:**
  - Dashboard to track if ALL judges have completed scoring for ALL students.
  - **A4 Printing:** Use `expo-print` (or inject an HTML string with CSS `@media print`) to generate an A4 Portrait PDF/Print layout.
  - Document Layout: 
    - Top Center: Admission Type (Large Font).
    - Middle: Table showing Criteria -> Sub-criteria -> Max Score -> Average Score (calculated from all judges).
    - Bottom of Table: Total Score sum.
    - Very Bottom: Signature lines arranged in 2 columns per row (Name, Position, Date).

**4.2 Judge Features:**
- Login using the generated 8-digit PIN.
- View assigned students and scoring rubrics.
- Input scores for each sub-criteria. Implement UI validation so they cannot input a value higher than the defined Max Score.

**4.3 Logout System (Both Admin & Judge):**
- Every screen after login must show a prominent **Logout** button in the top-right header area (styled in warning/red color).
- On press: clear the session cache and immediately `navigation.reset()` back to the Login screen.

Please provide the code in logical chunks. Start with the `code.gs` for the backend logic, concurrency setup, and database structure instructions. Then proceed to the React Native setup.