// =============================================
// JudgeStudentsScreen - ดูรายชื่อนักเรียนที่ต้องประเมิน
// =============================================
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, commonStyles } from '../../utils/theme';
import { api } from '../../services/api';

export default function JudgeStudentsScreen({ navigation }) {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    // TODO: ต้องเลือก admissionId ก่อน (mock)
    const res = await api.getStudents('admissionId-mock');
    if (res.success) setStudents(res.students);
  }

  return (
    <View style={commonStyles.screen}>
      <Text style={styles.title}>นักเรียนที่ต้องประเมิน</Text>
      <FlatList
        data={students}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>{item.firstName} {item.lastName}</Text>
            <Button title="ประเมิน" onPress={() => navigation.navigate('JudgeScore', { student: item })} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    margin: SPACING.md,
  },
  itemRow: {
    ...commonStyles.row,
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  itemText: {
    ...FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
});
