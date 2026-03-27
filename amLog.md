# amLog — บันทึกการพัฒนา TalentStd

---

## 27 มีนาคม 2569 — "กวาดเข้ม + ปูทาง Flow การรับนักเรียน"

### หัวข้อหลักที่ทำวันนี้

1. **แก้ไข Thai text encoding เพิ่มเติม** — ไฟล์ที่ยังเหลือค้าง ได้แก่ `JudgeStudentsScreen.js`, `JudgeScoreScreen.js`, `GlobalLoadingModal.js`, `HomeQuickLinks.js`, `ModalComponent.js`, `ToastComponent.js`, `BottomTabNavigator.js`, `DrawerNavigator.js` ทั้งหมด 8 ไฟล์ — ลบ script ชั่วคราวทิ้งหลังใช้แล้ว
2. **สร้าง AdmissionDetailScreen** — หน้าเมนูย่อยสำหรับแต่ละรอบการรับนักเรียน (นักเรียน / เกณฑ์คะแนน / กรรมการ / รายงาน)
3. **ปรับ Navigation Flow** — กดการ์ด Admission → เข้า AdmissionDetail → เลือกจัดการส่วนต่างๆ ได้ทันที
4. **ปรับ StudentsScreen และ CriteriaScreen** — รับ `route.params.admission` เพื่อข้ามขั้นตอน "pick" เมื่อมาจาก AdmissionDetail

---

### สิ่งที่ได้เรียนรู้

- **PowerShell บน Windows Thai locale (CP874) ทำลาย UTF-8 ทุกครั้ง** — ห้ามใช้ `Get-Content` / `Set-Content` กับไฟล์ที่มีภาษาไทยเด็ดขาด ใช้ `node -e` + `fs.writeFileSync(path, content, 'utf8')` เท่านั้น
- **Script แก้ encoding ที่ run ซ้ำบนไฟล์ที่ถูกต้องแล้ว ยิ่งทำให้พัง** — ต้องมี guard check ก่อนเสมอ (เช่น ตรวจว่ามี Thai Unicode `\u0E00-\u0E7F` อยู่แล้วหรือยัง)
- **Script ชั่วคราวควรลบทิ้งทันทีหลังใช้** — ไม่ควรทิ้งไว้ใน repo

---

### สิ่งที่ดี ✅

- ทุกไฟล์ในโปรเจกต์ไม่มี FFFD (�) เหลืออยู่เลย
- Navigation flow ถูกต้องตาม prompt — กดรายการการรับนักเรียนแล้วเข้าจัดการได้ทันที
- ไม่มี compile error ใดๆ ในไฟล์ที่แก้ไข

---

### สิ่งที่ควรปรับปรุง 🔧

- ควรกำหนด encoding `utf8` ตั้งแต่แรกเมื่อสร้างหรือแก้ไขไฟล์ที่มีภาษาไทย
- `ReportScreen` และหน้า judge บางหน้ายังใช้ font string แบบ hardcode (`'Sarabun_700Bold'`) แทน `FONTS.bold` จาก theme
- `JudgesScreen` ยังไม่ได้ผูกกับ admission — ควรกรองกรรมการตาม admission ในอนาคต

---
