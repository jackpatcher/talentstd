// =============================================
// AdmissionsScreen - จัดการชื่อการรับนักเรียน
// =============================================
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, commonStyles } from '../../utils/theme';
import { api } from '../../services/api';
import ModalComponent from '../../components/ModalComponent';

export default function AdmissionsScreen() {
  const [admissions, setAdmissions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchAdmissions();
  }, []);

  async function fetchAdmissions() {
    const res = await api.getAdmissions();
    if (res.success) setAdmissions(res.admissions);
  }

  return (
    <View style={commonStyles.screen}>
      <Text style={styles.title}>ชื่อการรับนักเรียน</Text>
      <Button title="เพิ่มการรับนักเรียน" onPress={() => setModalVisible(true)} />
      <FlatList
        data={admissions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>{item.name}</Text>
            {/* ปุ่มแก้ไข/ลบ */}
          </View>
        )}
      />
      <ModalComponent visible={modalVisible} onClose={() => setModalVisible(false)}>
        <Text>ฟอร์มเพิ่ม/แก้ไข (TODO)</Text>
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
