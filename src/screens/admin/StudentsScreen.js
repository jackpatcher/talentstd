// =============================================
// StudentsScreen - จัดการรายชื่อนักเรียน
// =============================================
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, commonStyles } from '../../utils/theme';
import { api } from '../../services/api';

import ModalComponent from '../../components/ModalComponent';
import GlobalLoadingModal from '../../components/GlobalLoadingModal';


export default function StudentsScreen() {
  const [students, setStudents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    const res = await api.getStudents();
    if (res.success) setStudents(res.students);
    setLoading(false);
  }

  return (
    <View style={commonStyles.screen}>
      <GlobalLoadingModal visible={loading} />
      <Text style={styles.title}>รายชื่อนักเรียน</Text>
      <Button title="เพิ่มนักเรียน" onPress={() => setModalVisible(true)} />
      <FlatList
        data={students}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>{item.firstName} {item.lastName}</Text>
            {/* ปุ่มแก้ไข/ลบ */}
          </View>
        )}
      />
      <ModalComponent visible={modalVisible} onClose={() => setModalVisible(false)}>
        <Text>ฟอร์มเพิ่ม/แก้ไขนักเรียน (TODO)</Text>
      </ModalComponent>
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
