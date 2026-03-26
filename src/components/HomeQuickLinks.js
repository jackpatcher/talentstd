import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, FONT_SIZES } from '../utils/theme';

export default function HomeQuickLinks() {
  const navigation = useNavigation();
  const links = [
    { label: 'เข้าสู่ระบบแอดมิน', screen: 'AdminLogin' },
    { label: 'จัดการประเภทการรับ', screen: 'Admissions' },
    { label: 'จัดการกรรมการ', screen: 'Judges' },
    { label: 'จัดการนักเรียน', screen: 'Students' },
    { label: 'จัดการเกณฑ์/ความสามารถ', screen: 'Criteria' },
    { label: 'รายงานผล/พิมพ์', screen: 'Report' },
    { label: 'ตั้งค่า', screen: 'Settings' },
    { label: 'เข้าสู่ระบบกรรมการ', screen: 'JudgeLogin' },
  ];
  return (
    <View style={styles.linksWrap}>
      <Text style={styles.quickTitle}>เมนูลัด</Text>
      <View style={styles.linksRow}>
        {links.map(link => (
          <TouchableOpacity
            key={link.screen}
            style={styles.linkBtn}
            onPress={() => navigation.navigate(link.screen)}
          >
            <Text style={styles.linkText}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  linksWrap: {
    marginTop: 32,
    alignItems: 'center',
    width: '100%',
  },
  quickTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  linkBtn: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
  },
  linkText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primaryDark,
  },
});
