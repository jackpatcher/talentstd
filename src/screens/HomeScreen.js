import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '../utils/theme';

export default function HomeScreen() {
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>TalentStd</Text>
        <Text style={styles.subtitle}>ระบบรับนักเรียนความสามารถพิเศษ</Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>เกี่ยวกับโปรแกรม</Text>
          <Text style={styles.text}>
            TalentStd คือระบบบริหารจัดการการรับสมัครและประเมินนักเรียนความสามารถพิเศษ
            สำหรับโรงเรียนหรือหน่วยงานการศึกษา รองรับการทำงานทั้งบนมือถือ แท็บเล็ต และเดสก์ท็อป
          </Text>
          <Text style={styles.sectionTitle}>ฟีเจอร์หลัก</Text>
          <Text style={styles.text}>
            - ระบบรับสมัครและจัดการข้อมูลนักเรียน
            {'\n'}- ระบบประเมินคะแนนโดยกรรมการ (ออนไลน์)
            {'\n'}- ระบบรายงานผลและพิมพ์รายงาน (A4)
            {'\n'}- ระบบล็อกอิน 2 ระดับ (Admin/กรรมการ)
            {'\n'}- ระบบ Cache และเข้ารหัสข้อมูล (Web)
            {'\n'}- รองรับการใช้งานหลายปีการศึกษา
          </Text>
          <Text style={styles.sectionTitle}>วิธีใช้งานเบื้องต้น</Text>
          <Text style={styles.text}>
            1. แอดมินล็อกอินเพื่อจัดการข้อมูลพื้นฐาน (ประเภทการรับ, กรรมการ, นักเรียน, เกณฑ์)
            {'\n'}2. กรรมการล็อกอินเพื่อประเมินคะแนนนักเรียนแต่ละคน
            {'\n'}3. ตรวจสอบผลและพิมพ์รายงานได้จากหน้า Dashboard
          </Text>
        </View>
      </View>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: FONTS.extraBold,
    fontSize: FONT_SIZES.xxxl,
    color: COLORS.primary,
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 520,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }
      : {
          shadowColor: COLORS.black,
          shadowOpacity: 0.08,
          shadowRadius: 8,
        }
    ),
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.primaryDark,
    marginTop: 16,
    marginBottom: 4,
  },
  text: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 22,
  },
});
