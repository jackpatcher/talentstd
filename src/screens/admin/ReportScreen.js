// =============================================
// ReportScreen - รายงานผลคะแนนและตรวจสอบความครบถ้วน
// =============================================
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, commonStyles } from '../../utils/theme';
import { api } from '../../services/api';

export default function ReportScreen() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    // TODO: ต้องเลือก admissionId, studentId ก่อน (mock)
    const res = await api.getReport('admissionId-mock', 'studentId-mock');
    if (res.success) setReport(res);
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>รายงานผลคะแนน</Text>
      {report ? (
        <View>
          <Text>คะแนนรวม: {report.totalAvg} / {report.totalMax}</Text>
          <Text>กรรมการที่กรอกครบ: {report.judgesScored} / {report.totalJudges}</Text>
          <Text>สถานะ: {report.isComplete ? 'ครบถ้วน' : 'ยังไม่ครบ'}</Text>
          {/* TODO: ตารางคะแนน, ลายเซ็นกรรมการ, ปุ่มพิมพ์ */}
        </View>
      ) : (
        <Text>กำลังโหลด...</Text>
      )}
      <Button title="โหลดใหม่" onPress={fetchReport} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  title: {
    ...FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
});
