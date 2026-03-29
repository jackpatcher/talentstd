// =============================================
// AdmissionDetailScreen - เมนูจัดการสำหรับการรับนักเรียนแต่ละรอบ
// =============================================
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../utils/theme';

const MENU_ITEMS = [
  {
    key: 'Students',
    icon: 'people-outline',
    label: 'จัดการนักเรียน',
    desc: 'เพิ่ม แก้ไข หรือลบรายชื่อนักเรียนที่เข้าร่วมรอบนี้',
    color: COLORS.primary,
    bgColor: COLORS.primaryLight,
  },
  {
    key: 'Criteria',
    icon: 'list-outline',
    label: 'จัดการเกณฑ์คะแนน',
    desc: 'กำหนดลักษณะความสามารถ หมวดหมู่ และคะแนนเต็มแต่ละหัวข้อ',
    color: COLORS.accent,
    bgColor: '#EDE9FE',
  },
  {
    key: 'Judges',
    icon: 'person-circle-outline',
    label: 'กรรมการตัดสิน',
    desc: 'ดูรายชื่อกรรมการและ PIN สำหรับเข้าระบบ',
    color: COLORS.secondary,
    bgColor: '#CCFBF1',
  },
  {
    key: 'Report',
    icon: 'bar-chart-outline',
    label: 'รายงานผลคะแนน',
    desc: 'สรุปคะแนน ตรวจสอบความครบถ้วน และพิมพ์รายงาน',
    color: COLORS.warning,
    bgColor: COLORS.warningLight,
  },
];

export default function AdmissionDetailScreen({ route, navigation }) {
  const raw = route.params?.admission;
  const admission = (raw && typeof raw === 'object' && raw.id) ? raw : null;

  function handleMenuPress(key) {
    navigation.navigate(key, { admission });
  }

  if (!admission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.textMuted} />
        <Text style={{ fontFamily: FONTS.regular, color: COLORS.textMuted, marginTop: 12, fontSize: 15 }}>
          ไม่พบข้อมูลการรับนักเรียน
        </Text>
        <Pressable
          onPress={() => navigation.navigate('Admissions')}
          style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: COLORS.primary, borderRadius: 12 }}
        >
          <Text style={{ fontFamily: FONTS.semiBold, color: '#fff', fontSize: 14 }}>กลับหน้าหลัก</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={S.root} contentContainerStyle={S.content}>
      {/* Admission header card */}
      <View style={S.headerCard}>
        <View style={S.headerIcon}>
          <Ionicons name="school" size={28} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[S.headerName, { fontFamily: FONTS.bold }]}>{admission?.name}</Text>
          <Text style={[S.headerSub, { fontFamily: FONTS.regular }]}>
            เลือกหัวข้อด้านล่างเพื่อจัดการรอบการรับนี้
          </Text>
        </View>
      </View>

      {/* Menu grid */}
      <View style={S.menuGrid}>
        {MENU_ITEMS.map(item => (
          <Pressable
            key={item.key}
            style={({ pressed }) => [S.menuCard, { opacity: pressed ? 0.85 : 1 }]}
            onPress={() => handleMenuPress(item.key)}
          >
            <View style={[S.menuIcon, { backgroundColor: item.bgColor }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={[S.menuLabel, { fontFamily: FONTS.semiBold, color: COLORS.text }]}>
              {item.label}
            </Text>
            <Text style={[S.menuDesc, { fontFamily: FONTS.regular, color: COLORS.textMuted }]}>
              {item.desc}
            </Text>
            <View style={S.menuArrow}>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, gap: 12 },
  headerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 4,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerName: { fontSize: 18, color: COLORS.text, marginBottom: 2 },
  headerSub: { fontSize: 13, color: COLORS.textMuted },
  menuGrid: { gap: 10 },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuLabel: { fontSize: 16, marginBottom: 4 },
  menuDesc: { fontSize: 13, lineHeight: 18 },
  menuArrow: { position: 'absolute', right: 16, top: '50%' },
});
