// =============================================
// AdmissionsScreen - จัดการชื่อการรับนักเรียน
// =============================================
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../utils/theme';
import { api } from '../../services/api';
import { getCache, setCache, removeCache } from '../../services/cache';
import ModalComponent from '../../components/ModalComponent';
import ToastComponent from '../../components/ToastComponent';
import GlobalLoadingModal from '../../components/GlobalLoadingModal';

export default function AdmissionsScreen({ navigation }) {
  const [admissions, setAdmissions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formName, setFormName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => { fetchData(); }, []);

  async function fetchData(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = await getCache('admissions');
      if (cached) { setAdmissions(cached); return; }
    }
    setLoading(true);
    const res = await api.getAdmissions();
    if (res.success) {
      setAdmissions(res.admissions || []);
      await setCache('admissions', res.admissions || [], 10);
    }
    setLoading(false);
  }

  function openAdd() { setSelected(null); setFormName(''); setModalVisible(true); }
  function openEdit(item) { setSelected(item); setFormName(item.name); setModalVisible(true); }

  async function handleSave() {
    if (!formName.trim()) return;
    setSaving(true);
    const res = selected
      ? await api.updateAdmission({ id: selected.id, name: formName.trim() })
      : await api.createAdmission({ name: formName.trim() });
    setSaving(false);
    if (res.success) {
      setToast({ visible: true, message: selected ? 'แก้ไขสำเร็จ' : 'เพิ่มสำเร็จ', type: 'success' });
      setModalVisible(false);
      await removeCache('admissions');
      fetchData(true);
    } else {
      setToast({ visible: true, message: res.error || 'เกิดข้อผิดพลาด', type: 'error' });
    }
  }

  async function handleDelete(item) {
    Alert.alert('ยืนยันการลบ', `ลบ "${item.name}" ใช่หรือไม่?`, [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบ', style: 'destructive', onPress: async () => {
          const res = await api.deleteAdmission(item.id);
          if (res.success) {
            setToast({ visible: true, message: 'ลบสำเร็จ', type: 'success' });
            await removeCache('admissions');
            fetchData(true);
          }
        },
      },
    ]);
  }

  return (
    <View style={S.root}>
      <GlobalLoadingModal visible={loading} />

      {/* Header */}
      <View style={S.header}>
        <Text style={[S.headerTitle, { fontFamily: FONTS.bold }]}>การรับนักเรียน</Text>
        <Pressable onPress={openAdd} style={S.addBtn}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={[S.addBtnText, { fontFamily: FONTS.semiBold }]}>เพิ่ม</Text>
        </Pressable>
      </View>

      <FlatList
        data={admissions}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={
          !loading && (
            <View style={S.emptyBox}>
              <Ionicons name="folder-open-outline" size={48} color={COLORS.textMuted} />
              <Text style={[S.emptyText, { fontFamily: FONTS.regular }]}>
                ยังไม่มีข้อมูลการรับนักเรียน
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [S.card, { opacity: pressed ? 0.88 : 1 }]}
            onPress={() => navigation.navigate('AdmissionDetail', { admission: item })}
          >
            <View style={S.cardIconWrap}>
              <Ionicons name="school-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={[S.cardName, { fontFamily: FONTS.medium }]}>{item.name}</Text>
            <View style={S.actionRow}>
              <Pressable onPress={() => openEdit(item)} style={S.editBtn} hitSlop={8}>
                <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
              </Pressable>
              <Pressable onPress={() => handleDelete(item)} style={S.delBtn} hitSlop={8}>
                <Ionicons name="trash-outline" size={16} color={COLORS.error} />
              </Pressable>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={{ marginLeft: 4 }} />
          </Pressable>
        )}
      />

      {/* Modal */}
      <ModalComponent visible={modalVisible} onClose={() => setModalVisible(false)}>
        <Text style={[S.modalTitle, { fontFamily: 'Sarabun_700Bold' }]}>
          {selected ? 'แก้ไขการรับนักเรียน' : 'เพิ่มการรับนักเรียน'}
        </Text>
        <TextInput
          style={[S.input, { fontFamily: FONTS.regular }]}
          placeholder="เช่น คอมพิวเตอร์ ม.ต้น"
          value={formName}
          onChangeText={setFormName}
          autoFocus
        />
        <Pressable
          onPress={handleSave}
          disabled={saving || !formName.trim()}
          style={[S.saveBtn, { opacity: saving || !formName.trim() ? 0.5 : 1 }]}
        >
          <Text style={[S.saveBtnText, { fontFamily: FONTS.semiBold }]}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </Text>
        </Pressable>
      </ModalComponent>

      <ToastComponent {...toast} onHide={() => setToast({ ...toast, visible: false })} />
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: { fontSize: 20, color: COLORS.text },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  addBtnText: { color: '#fff', fontSize: 14 },
  emptyBox: { alignItems: 'center', paddingVertical: 64 },
  emptyText: { color: COLORS.textMuted, marginTop: 12, fontSize: 15, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    gap: 12,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardName: { flex: 1, fontSize: 15, color: COLORS.text },
  actionRow: { flexDirection: 'row', gap: 8 },
  editBtn: { padding: 8, borderRadius: 8, backgroundColor: COLORS.primaryLight },
  delBtn: { padding: 8, borderRadius: 8, backgroundColor: COLORS.errorLight },
  modalTitle: { fontSize: 18, color: COLORS.text, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    marginBottom: 16,
  },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15 },
});
