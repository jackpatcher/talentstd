// =============================================
// AboutScreen - เกี่ยวกับระบบ + ประวัติการพัฒนา
// =============================================
import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TextInput, Pressable,
  StyleSheet, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../utils/theme';

// ── ประเภท badge ──────────────────────────────────────────────
const BADGE = {
  feat:     { label: 'ฟีเจอร์ใหม่',   color: COLORS.primary,   bg: COLORS.primaryLight,  icon: 'sparkles-outline' },
  fix:      { label: 'แก้บัก',         color: COLORS.success,   bg: COLORS.successLight,  icon: 'checkmark-circle-outline' },
  refactor: { label: 'ปรับโครงสร้าง', color: COLORS.accent,    bg: '#EDE9FE',             icon: 'construct-outline' },
  learn:    { label: 'บทเรียน',        color: COLORS.warning,   bg: COLORS.warningLight,  icon: 'bulb-outline' },
  style:    { label: 'UI/UX',          color: COLORS.info,      bg: COLORS.infoLight,     icon: 'color-palette-outline' },
};

// ── รายการ package ──────────────────────────────────────────
const PACKAGES = [
  { group: 'Core',       icon: 'cube-outline',          items: [
    { name: 'expo',                    version: '55.0.8' },
    { name: 'react',                   version: '19.2.0' },
    { name: 'react-native',            version: '0.83.2' },
  ]},
  { group: 'Navigation', icon: 'navigate-outline',       items: [
    { name: 'react-navigation/native', version: '6.1.10' },
    { name: 'react-navigation/stack',  version: '6.3.20' },
    { name: 'react-navigation/drawer', version: '6.6.6' },
    { name: 'react-navigation/bottom-tabs', version: '6.5.11' },
  ]},
  { group: 'Styling',    icon: 'color-palette-outline',  items: [
    { name: 'nativewind',              version: '4.2.3' },
    { name: 'tailwindcss',             version: '3.4.19' },
  ]},
  { group: 'Font',       icon: 'text-outline',           items: [
    { name: '@expo-google-fonts/sarabun', version: '0.2.3' },
    { name: 'expo-font',               version: '55.0.4' },
  ]},
  { group: 'Utility',    icon: 'settings-outline',       items: [
    { name: 'crypto-js',               version: '4.2.0' },
    { name: 'expo-print',              version: '55.0.9' },
    { name: 'react-native-qrcode-svg', version: '6.2.0' },
    { name: 'expo-linking',            version: '55.0.8' },
  ]},
];

// dominant type → accent color ของการ์ด
function accentColor(items) {
  const count = {};
  items.forEach(({ type }) => { count[type] = (count[type] || 0) + 1; });
  const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || 'feat';
  return BADGE[top]?.color || COLORS.primary;
}

// ── ประวัติการพัฒนา ────────────────────────────────────────────
const DEV_LOG = [
  {
    date: '28 มีนาคม 2569',
    title: 'ปรับปรุง Schema นักเรียน + ปรับแต่ง About Screen',
    items: [
      { type: 'fix',      text: 'แก้ปุ่ม back ซ้อนกันใน StudentsScreen เมื่อมาจาก AdmissionDetail — ซ่อน internal back arrow เมื่อมี preselected' },
      { type: 'refactor', text: 'ลบ fields studentCode, class, level ออกจาก student schema ทั้ง frontend และ backend' },
      { type: 'feat',     text: 'เพิ่ม classLv (ม.ต้น / ม.ปลาย) แบบ chip selector กดเลือกได้ทันที' },
      { type: 'feat',     text: 'เพิ่ม gpa (เกรดเฉลี่ย 5 เทอม), sch (โรงเรียนเดิม), tel (เบอร์โทรศัพท์)' },
      { type: 'style',    text: 'เปลี่ยน prefix (คำนำหน้า) จาก TextInput เป็น chip buttons — นาย / นางสาว / เด็กชาย / เด็กหญิง' },
      { type: 'refactor', text: 'ปรับ student schema ใช้ JSON column "info" เพื่อความยืดหยุ่น — เพิ่ม field ในอนาคตไม่ต้องแตะ sheet structure' },
      { type: 'feat',     text: 'สร้างหน้า "เกี่ยวกับ" พร้อมประวัติการพัฒนาและ search ตามวันที่' },
      { type: 'feat',     text: 'Dependencies section toggle — กด header เพื่อซ่อน/แสดงรายการ packages ได้' },
      { type: 'style',    text: 'About Screen การ์ดแสดง items ครบทุกรายการ ไม่ตัดเหลือ +N อีกต่อไป' },
      { type: 'feat',     text: 'ค้นหาเนื้อหาภายในการ์ดได้ (ไม่ใช่แค่หัวข้อ) พร้อม highlight ข้อความที่ตรง' },
      { type: 'fix',      text: 'แก้ search input active border — เปลี่ยนเป็นสี primary แทนกรอบดำ, outlineWidth: 0' },
      { type: 'fix',      text: 'แก้การ์ดล้นจอ — เปลี่ยนเป็น flex: 1, minWidth: 0 ควบคุมด้วย grid' },
      { type: 'style',    text: 'ย้าย PackagesSection ไว้เหนือช่องค้นหา เพื่อ UX ที่ดีขึ้น' },
    ],
  },
  {
    date: '27 มีนาคม 2569',
    title: 'กวาดเข้ม + ปูทาง Flow การรับนักเรียน',
    items: [
      { type: 'fix',      text: 'แก้ไข Thai text encoding ในไฟล์ที่เหลือทั้ง 8 ไฟล์ (JudgeStudentsScreen, JudgeScoreScreen, GlobalLoadingModal, HomeQuickLinks, ModalComponent, ToastComponent, BottomTabNavigator, DrawerNavigator)' },
      { type: 'feat',     text: 'สร้าง AdmissionDetailScreen — หน้าเมนูย่อยสำหรับแต่ละรอบการรับนักเรียน (นักเรียน / เกณฑ์คะแนน / กรรมการ / รายงาน)' },
      { type: 'refactor', text: 'ปรับ Navigation Flow: กดการ์ด Admission → AdmissionDetail → เลือกจัดการส่วนต่างๆ ได้ทันที' },
      { type: 'refactor', text: 'ปรับ StudentsScreen และ CriteriaScreen รับ route.params.admission ข้ามขั้นตอน pick' },
      { type: 'learn',    text: 'PowerShell + Windows Thai locale (CP874) ทำลาย UTF-8 ทุกครั้ง — ต้องใช้ node -e + fs.writeFileSync(path, content, "utf8") เท่านั้น' },
      { type: 'learn',    text: 'Script แก้ encoding ที่รันซ้ำบนไฟล์ที่ถูกต้องแล้วจะยิ่งทำให้พัง — ต้องมี guard check ก่อนเสมอ' },
    ],
  },
];

// ── Component หลัก ────────────────────────────────────────────
export default function AboutScreen() {
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);

  // responsive: 2 col เมื่อ >= 480, 1 col เมื่อแคบ
  const SIDE_PAD = 16;
  const GAP = 12;
  const numCols = width >= 480 ? 2 : 1;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DEV_LOG;
    return DEV_LOG.filter(
      day =>
        day.date.toLowerCase().includes(q) ||
        day.title.toLowerCase().includes(q) ||
        day.items.some(item => item.text.toLowerCase().includes(q))
    );
  }, [search]);

  // สร้าง rows สำหรับ 2-col grid
  const rows = [];
  for (let i = 0; i < filtered.length; i += numCols) {
    rows.push(filtered.slice(i, i + numCols));
  }

  return (
    <View style={S.root}>
      {/* ── Banner ── */}
      <View style={S.banner}>
        <View style={S.bannerIcon}>
          <Ionicons name="trophy" size={26} color="#fff" />
        </View>
        <View>
          <Text style={[S.appName, { fontFamily: FONTS.bold }]}>TalentStd</Text>
          <Text style={[S.appSub, { fontFamily: FONTS.regular }]}>ระบบรับนักเรียนความสามารถพิเศษ</Text>
        </View>
        <View style={S.versionBadge}>
          <Text style={[S.versionText, { fontFamily: FONTS.medium }]}>v1.0</Text>
        </View>
      </View>

      {/* ── Tech Stack Pills ── */}
      <View style={S.stackRow}>
        {['React Native Expo', 'GAS + Sheets', 'NativeWind v4'].map(t => (
          <View key={t} style={S.stackPill}>
            <Text style={[S.stackText, { fontFamily: FONTS.regular }]}>{t}</Text>
          </View>
        ))}
      </View>

      {/* ── Packages ── */}
      <PackagesSection />

      {/* ── Search ── */}
      <View style={[S.searchWrap, focused && { borderColor: COLORS.primary }]}>
        <Ionicons name="search-outline" size={16} color={focused ? COLORS.primary : COLORS.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={[S.searchInput, { fontFamily: FONTS.regular }]}
          placeholder="ค้นหาวันที่ หรือเนื้อหา..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
          </Pressable>
        )}
      </View>

      {/* ── Grid ── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={S.list} showsVerticalScrollIndicator={false}>

        {filtered.length === 0 && (
          <View style={S.empty}>
            <Ionicons name="search-outline" size={40} color={COLORS.border} />
            <Text style={[S.emptyText, { fontFamily: FONTS.regular }]}>ไม่พบรายการที่ตรงกับการค้นหา</Text>
          </View>
        )}

        {rows.map((row, ri) => (
          <View key={ri} style={[S.row, { gap: GAP, marginBottom: GAP }]}>
            {row.map((day, di) => (
              <SummaryCard
                key={di}
                day={day}
                numCols={numCols}
                search={search.trim().toLowerCase()}
              />
            ))}
            {/* ถ้า row มี col เดียว ใส่ spacer เพื่อ align */}
            {row.length < numCols && numCols === 2 && (
              <View style={{ flex: 1 }} />
            )}
          </View>
        ))}

        {/* Footer */}
        <View style={S.footer}>
          <Ionicons name="code-slash-outline" size={14} color={COLORS.textMuted} />
          <Text style={[S.footerText, { fontFamily: FONTS.regular }]}>
            พัฒนาโดย แอม  ·  {DEV_LOG.length} วัน  ·  {DEV_LOG.reduce((s, d) => s + d.items.length, 0)} รายการ
          </Text>
        </View>
      </ScrollView>

    </View>
  );
}

// ── Packages Section ───────────────────────────────────────
function PackagesSection() {
  const [open, setOpen] = React.useState(false);
  const total = PACKAGES.reduce((s, g) => s + g.items.length, 0);

  return (
    <View style={S.pkgWrap}>
      <Pressable
        onPress={() => setOpen(v => !v)}
        style={({ pressed }) => [S.pkgHeader, { opacity: pressed ? 0.75 : 1 }]}
      >
        <Ionicons name="layers-outline" size={15} color={COLORS.textSecondary} />
        <Text style={[S.pkgHeaderText, { fontFamily: FONTS.semiBold }]}>Dependencies</Text>
        <Text style={[S.pkgCount, { fontFamily: FONTS.regular }]}>{total} packages</Text>
        <Ionicons
          name={open ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={14}
          color={COLORS.textMuted}
          style={{ marginLeft: 'auto' }}
        />
      </Pressable>
      {open && (
        <View style={S.pkgBody}>
          {PACKAGES.map(group => (
            <View key={group.group} style={S.pkgGroup}>
              <View style={S.pkgGroupLabel}>
                <Ionicons name={group.icon} size={12} color={COLORS.textMuted} />
                <Text style={[S.pkgGroupText, { fontFamily: FONTS.semiBold }]}>{group.group}</Text>
              </View>
              {group.items.map(pkg => (
                <View key={pkg.name} style={S.pkgRow}>
                  <Text style={[S.pkgName, { fontFamily: FONTS.regular }]}>{pkg.name}</Text>
                  <Text style={[S.pkgVersion, { fontFamily: FONTS.medium }]}>v{pkg.version}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Summary Card (grid item) ─────────────────────────────────
function SummaryCard({ day, numCols, search }) {
  const accent = accentColor(day.items);

  return (
    <View style={[S.card, { flex: 1, minWidth: 0 }]}>
      {/* เส้นซ้าย accent */}
      <View style={[S.cardAccentBar, { backgroundColor: accent }]} />

      <View style={S.cardBody}>
        {/* Date + count */}
        <View style={S.cardTopRow}>
          <Text style={[S.cardDate, { fontFamily: FONTS.semiBold, color: accent }]}>{day.date}</Text>
          <View style={[S.cardBadge, { backgroundColor: accent + '20' }]}>
            <Text style={[S.cardBadgeText, { fontFamily: FONTS.bold, color: accent }]}>{day.items.length}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[S.cardTitle, { fontFamily: FONTS.bold }]}>{day.title}</Text>

        {/* Items — แสดงทั้งหมด */}
        <View style={S.previewList}>
          {day.items.map((item, ii) => {
            const b = BADGE[item.type] || BADGE.feat;
            const isMatch = search && item.text.toLowerCase().includes(search);
            return (
              <View
                key={ii}
                style={[
                  S.previewRow,
                  isMatch && { backgroundColor: b.bg, borderRadius: 6, paddingHorizontal: 4 },
                ]}
              >
                <View style={[S.typeChip, { backgroundColor: b.bg }]}>
                  <Ionicons name={b.icon} size={11} color={b.color} />
                </View>
                <Text style={[S.previewText, { fontFamily: isMatch ? FONTS.semiBold : FONTS.regular, color: isMatch ? b.color : COLORS.textSecondary }]}>
                  {item.text}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  // Banner
  banner: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  bannerIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  appName: { fontSize: 20, color: '#fff' },
  appSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  versionBadge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  versionText: { fontSize: 12, color: '#fff' },

  // Packages
  pkgWrap: {
    marginBottom: 12,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight,
    borderRadius: 12, overflow: 'hidden',
  },
  pkgHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 11,
  },
  pkgHeaderText: { fontSize: 13, color: COLORS.textSecondary },
  pkgCount: { fontSize: 12, color: COLORS.textMuted },
  pkgBody: { borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingHorizontal: 14, paddingVertical: 10, gap: 12 },
  pkgGroup: { gap: 4 },
  pkgGroupLabel: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  pkgGroupText: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  pkgRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 },
  pkgName: { fontSize: 12, color: COLORS.text },
  pkgVersion: { fontSize: 12, color: COLORS.primary },

  // Stack pills
  stackRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  stackPill: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  stackText: { fontSize: 12, color: COLORS.textSecondary },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text, padding: 0, outlineWidth: 0 },

  // Grid
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  row: { flexDirection: 'row' },

  // Summary Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardAccentBar: { width: 5 },
  cardBody: { flex: 1, minWidth: 0, padding: 14, gap: 6 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardDate: { fontSize: 12 },
  cardBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  cardBadgeText: { fontSize: 12 },
  cardTitle: { fontSize: 13, color: COLORS.text, lineHeight: 20, marginBottom: 2 },

  // Content preview
  previewList: { gap: 6 },
  previewRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  typeChip: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  previewText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  previewMore: { fontSize: 11, marginTop: 2 },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 14, color: COLORS.textMuted },

  // Footer
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 8 },
  footerText: { fontSize: 12, color: COLORS.textMuted },

  // Modal overlay
  overlay: { flex: 1, backgroundColor: COLORS.overlay },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '75%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 10,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
    borderLeftWidth: 5, borderTopLeftRadius: 24,
  },
  sheetDate: { fontSize: 12, marginBottom: 2 },
  sheetTitle: { fontSize: 17, color: COLORS.text },
  closeBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center', alignItems: 'center', marginLeft: 8,
  },
  sheetBody: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  detailBadge: {
    width: 30, height: 30, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center', marginTop: 1,
  },
  detailType: { fontSize: 11, marginBottom: 2 },
  detailText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
});
