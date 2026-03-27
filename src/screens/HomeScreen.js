// =============================================
// HomeScreen - หน้าหลัก
// =============================================
import React from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DRAWER_WIDTH } from '../utils/theme';

const FEATURES = [
  {
    icon: 'school-outline',
    title: 'จัดการการรับนักเรียน',
    desc: 'เพิ่ม/แก้ไข ประเภทการรับนักเรียน/เพิ่ม/แก้ไข ประเภทการรับนักเรียน เพิ่ม/แก้ไข ประเภทการรับนักเรียน',
    color: '#2563EB',
    bg: '#DBEAFE',
  },
  {
    icon: 'people-outline',
    title: 'กรรมการตัดสิน',
    desc: 'จัดการรายชื่อกรรมการพร้อม PIN PIN',
    color: '#0D9488',
    bg: '#CCFBF1',
  },
  {
    icon: 'person-outline',
    title: 'รายชื่อนักเรียน',
    desc: 'นำเข้าและจัดการรายชื่อผู้สมัคร',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  {
    icon: 'ribbon-outline',
    title: 'เกณฑ์การให้คะแนน',
    desc: 'วางเกณฑ์ตามหมวดพร้อมคะแนนสูงสุด',
    color: '#D97706',
    bg: '#FEF3C7',
  },
  {
    icon: 'bar-chart-outline',
    title: 'รายงานผล',
    desc: 'สรุปคะแนนและออกรายงาน A4 A4',
    color: '#0284C7',
    bg: '#E0F2FE',
  },
  {
    icon: 'qr-code-outline',
    title: 'QR Code QR Code กรรมการ',
    desc: 'สแกนเข้าระบบเพื่อให้คะแนน',
    color: '#16A34A',
    bg: '#DCFCE7',
  },
];

const STEPS = [
  { no: '1', icon: 'settings-outline',   text: 'ตั้งค่า API URL ที่หน้า Settings API URL ตั้งค่า API URL ที่หน้า Settings Settings', color: '#2563EB' },
  { no: '2', icon: 'create-outline',     text: 'สร้างประเภทการรับ กรรมการ และนักเรียน สร้างประเภทการรับ กรรมการ และนักเรียน สร้างประเภทการรับ กรรมการ และนักเรียน', color: '#0D9488' },
  { no: '3', icon: 'scan-outline',       text: 'ให้กรรมการเข้าระบบด้วย QR Code และกรอกคะแนน QR Code ให้กรรมการเข้าระบบด้วย QR Code และกรอกคะแนน', color: '#7C3AED' },
  { no: '4', icon: 'print-outline',      text: 'ตรวจสอบและออกรายงาน A4 A4', color: '#D97706' },
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();

  // Subtract sidebar (80px on tablet/desktop) and horizontal padding (16*2)
  const contentWidth = width - DRAWER_WIDTH - 32;
  const CARD_GAP = 12;
  const CARD_PAD = 16;

  // Responsive columns: 1 / 2 / 3 based on available space
  const numCols = contentWidth >= 700 ? 3 : contentWidth >= 400 ? 2 : 1;
  const cardWidth = (contentWidth - CARD_GAP * (numCols - 1)) / numCols;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      {/* ── Hero Banner ─────────────────────────── */}
      <View style={styles.hero}>
        <View style={styles.heroIconWrap}>
          <Ionicons name="trophy" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.heroTitle}>TalentStd</Text>
        <Text style={styles.heroSub}>ระบบรับนักเรียนความสามารถพิเศษ</Text>
        <View style={styles.heroBadge}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#FFFFFF99" />
          <Text style={styles.heroBadgeText}>Secure · Fast · Reliable</Text>
        </View>
      </View>

      {/* ── Feature Cards ───────────────────────── */}
      <Text style={styles.sectionLabel}>ฟีเจอร์หลัก</Text>
      <View style={[styles.grid, { gap: CARD_GAP }]}>
        {FEATURES.map((f, i) => (
          <View key={i} style={[styles.card, { width: cardWidth }]}>
            <View style={[styles.cardIcon, { backgroundColor: f.bg }]}>
              <Ionicons name={f.icon} size={18} color={f.color} />
            </View>
            <Text style={styles.cardTitle}>{f.title}</Text>
            <Text style={styles.cardDesc}>{f.desc}</Text>
            <View style={[styles.cardAccent, { backgroundColor: f.color }]} />
          </View>
        ))}
      </View>

      {/* ── Steps ───────────────────────────────── */}
      <Text style={styles.sectionLabel}>ขั้นตอนการใช้งาน</Text>
      <View style={styles.stepsCard}>
        {STEPS.map((step, idx) => (
          <View
            key={step.no}
            style={[styles.stepRow, idx < STEPS.length - 1 && styles.stepBorder]}
          >
            <View style={[styles.stepBadge, { backgroundColor: step.color }]}>
              <Text style={styles.stepNo}>{step.no}</Text>
            </View>
            <View style={styles.stepIconWrap}>
              <Ionicons name={step.icon} size={16} color={step.color} />
            </View>
            <Text style={styles.stepText}>{step.text}</Text>
          </View>
        ))}
      </View>

      {/* ── Footer ──────────────────────────────── */}
      <View style={styles.footer}>
        <Ionicons name="logo-google" size={14} color={COLORS.textMuted} />
        <Text style={styles.footerText}>  TalentStd v1.0  ·  Expo & Google Sheets</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 16, paddingBottom: 32 },

  // Hero
  hero: {
    backgroundColor: '#1D4ED8',
    borderRadius: 20,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  heroIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF22',
    borderWidth: 2,
    borderColor: '#FFFFFF44',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: 'Sarabun_800ExtraBold',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 3,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: 'Sarabun_400Regular',
    color: '#FFFFFFCC',
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF18',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF33',
  },
  heroBadgeText: {
    fontSize: 12,
    fontFamily: 'Sarabun_400Regular',
    color: '#FFFFFFBB',
    marginLeft: 4,
  },

  // Section label
  sectionLabel: {
    fontSize: 15,
    fontFamily: 'Sarabun_700Bold',
    color: COLORS.textSecondary,
    marginBottom: 12,
    marginLeft: 2,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontFamily: 'Sarabun_700Bold',
    color: COLORS.text,
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 11,
    fontFamily: 'Sarabun_400Regular',
    color: COLORS.textMuted,
    lineHeight: 15,
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 3,
    height: '100%',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },

  // Steps
  stepsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  stepBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNo: {
    fontSize: 13,
    fontFamily: 'Sarabun_700Bold',
    color: '#FFFFFF',
  },
  stepIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepText: {
    fontSize: 13,
    fontFamily: 'Sarabun_400Regular',
    color: COLORS.text,
    flex: 1,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Sarabun_400Regular',
    color: COLORS.textMuted,
  },
});
