// =============================================
// CriteriaScreen - จัดการลักษณะความสามารถและเกณฑ์
// =============================================
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, commonStyles } from '../../utils/theme';
import { api } from '../../services/api';
import ModalComponent from '../../components/ModalComponent';

export default function CriteriaScreen() {
  const [criteria, setCriteria] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchCriteria();
  }, []);

  async function fetchCriteria() {
    // TODO: ต้องเลือก admissionId ก่อน (mock)
    const res = await api.getCriteria('admissionId-mock');
    if (res.success) setCriteria(res.criteria);
  }

  return (
    <View style={commonStyles.screen}>
      <Text style={styles.title}>ลักษณะความสามารถ/เกณฑ์</Text>
      <Button title="เพิ่มลักษณะ/เกณฑ์" onPress={() => setModalVisible(true)} />
      <FlatList
        data={criteria}
        keyExtractor={(item, idx) => idx + ''}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>{item.name}</Text>
            {/* ปุ่มแก้ไข/ลบ */}
          </View>
        )}
      />
      <ModalComponent visible={modalVisible} onClose={() => setModalVisible(false)}>
        <Text>ฟอร์มเพิ่ม/แก้ไขลักษณะ/เกณฑ์ (TODO)</Text>
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
