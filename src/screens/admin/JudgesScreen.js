// =============================================
// JudgesScreen - จัดการกรรมการตัดสิน
// =============================================
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, commonStyles } from '../../utils/theme';
import { api } from '../../services/api';
import ModalComponent from '../../components/ModalComponent';

export default function JudgesScreen() {
  const [judges, setJudges] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchJudges();
  }, []);

  async function fetchJudges() {
    const res = await api.getJudges();
    if (res.success) setJudges(res.judges);
  }

  return (
    <View style={commonStyles.screen}>
      <Text style={styles.title}>กรรมการตัดสิน</Text>
      <Button title="เพิ่มกรรมการ" onPress={() => setModalVisible(true)} />
      <FlatList
        data={judges}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>{item.firstName} {item.lastName}</Text>
            {/* ปุ่มแก้ไข/ลบ */}
          </View>
        )}
      />
      <ModalComponent visible={modalVisible} onClose={() => setModalVisible(false)}>
        <Text>ฟอร์มเพิ่ม/แก้ไขกรรมการ (TODO)</Text>
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
