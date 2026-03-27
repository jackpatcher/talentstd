// =============================================
// JudgesScreen - จัดการกรรมการตัดสิน
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

export default function JudgesScreen() {
  const [judges, setJudges] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', position: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => { fetchData(); }, []);

  async function fetchData(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = await getCache('judges');
      if (cached) { setJudges(cached); return; }
    }
    setLoading(true);
    const res = await api.getJudges();
    if (res.success) {
      setJudges(res.judges || []);
      await setCache('judges', res.judges || [], 10);
    }
    setLoading(false);
  }

  function openAdd() {
    setSelected(null);
    setForm({ firstName: '', lastName: '', position: '' });
    setModalVisible(true);
  }
  function openEdit(item) {
    setSelected(item);
    setForm({ firstName: item.firstName, lastName: item.lastName, position: item.position });
    setModalVisible(true);
  }

  async function handleSave() {
    if (!form.firstName.trim() || !form.lastName.trim()) return;
    setSaving(true);
    const res = selected
      ? await api.updateJudge({ id: selected.id, ...form })
      : await api.createJudge(form);
    setSaving(false);
    if (res.success) {
      setToast({ visible: true, message: selected ? 'แก้ไขสำเร็จ' : 'เพิ่มกรรมการสำเร็จ', type: 'success' });
      setModalVisible(false);
      await removeCache('judges');
      fetchData(true);
    } else {
      setToast({ visible: true, message: res.error || 'เกิดข้อผิดพลาด', type: 'error' });
    }
  }

  async function handleDelete(item) {
    Alert.alert('ยืนยันการลบ', `ลบ ${item.firstName} ${item.lastName} ใช่หรือไม่?`, [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบ', style: 'destructive', onPress: async () => {
          const res = await api.deleteJudge(item.id);
          if (res.success) {
            setToast({ visible: true, message: 'ลบสำเร็จ', type: 'success' });
            await removeCache('judges');
            fetchData(true);
          }
        },
      },
    ]);
  }

  return (
    <View style={S.root}>
      <GlobalLoadingModal visible={loading} />

      <View style={S.header}>
        <Text style={[S.headerTitle, { fontFamily: 'Sarabun_700Bold' }]}>กรรมการตัดสิน</Text>
        <Pressable onPress={openAdd} style={S.addBtn}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={[S.addBtnText, { fontFamily: 'Sarabun_600SemiBold' }]}>เพิ่ม</Text>
        </Pressable>
      </View>

      <FlatList
        data={judges}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={
          !loading && (
            <View style={S.emptyBox}>
              <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
              <Text style={[S.emptyText, { fontFamily: 'Sarabun_400Regular' }]}>ยังไม่มีกรรมการ</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={S.card}>
            <View style={S.avatar}>
              <Text style={[S.avatarText, { fontFamily: 'Sarabun_700Bold' }]}>
                {item.firstName?.[0] || '?'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[S.judgeName, { fontFamily: 'Sarabun_600SemiBold' }]}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={[S.judgePos, { fontFamily: 'Sarabun_400Regular' }]}>{item.position}</Text>
              {item.pin && (
                <View style={S.pinRow}>
                  <Ionicons name="key-outline" size={13} color={COLORS.textMuted} />
                  <Text style={[S.pinText, { fontFamily: 'Sarabun_400Regular' }]}>
                    รหัส: <Text style={{ fontFamily: 'Sarabun_700Bold', letterSpacing: 2 }}>{item.pin}</Text>
                  </Text>
                </View>
              )}
            </View>
            <View style={S.actionRow}>
              <Pressable onPress={() => openEdit(item)} style={S.editBtn}>
                <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
              </Pressable>
              <Pressable onPress={() => handleDelete(item)} style={S.delBtn}>
                <Ionicons name="trash-outline" size={16} color={COLORS.error} />
              </Pressable>
            </View>
          </View>
        )}
      />

      <ModalComponent visible={modalVisible} onClose={() => setModalVisible(false)}>
        <Text style={[S.modalTitle, { fontFamily: 'Sarabun_700Bold' }]}>
          {selected ? 'แก้ไขกรรมการ' : 'เพิ่มกรรมการ'}
        </Text>
        {[
          { key: 'firstName', label: 'ชื่อ', placeholder: 'ชื่อกรรมการ' },
          { key: 'lastName', label: 'นามสกุล', placeholder: 'นามสกุลกรรมการ' },
          { key: 'position', label: 'ตำแหน่ง', placeholder: 'เช่น ครู / อาจารย์' },
        ].map(f => (
          <View key={f.key} style={{ marginBottom: 12 }}>
            <Text style={[S.fieldLabel, { fontFamily: 'Sarabun_500Medium' }]}>{f.label}</Text>
            <TextInput
              style={[S.input, { fontFamily: 'Sarabun_400Regular' }]}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChangeText={v => setForm({ ...form, [f.key]: v })}
            />
          </View>
        ))}
        {!selected && (
          <View style={S.hintBox}>
            <Ionicons name="information-circle-outline" size={15} color={COLORS.info} />
            <Text style={[S.hintText, { fontFamily: 'Sarabun_400Regular' }]}>
              รหัส PIN 8 หลักจะถูกสร้างอัตโนมัติ
            </Text>
          </View>
        )}
        <Pressable
          onPress={handleSave}
          disabled={saving || !form.firstName.trim() || !form.lastName.trim()}
          style={[S.saveBtn, { opacity: saving || !form.firstName.trim() ? 0.5 : 1, marginTop: 12 }]}
        >
          <Text style={[S.saveBtnText, { fontFamily: 'Sarabun_600SemiBold' }]}>
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
  emptyText: { color: COLORS.textMuted, marginTop: 12, fontSize: 15 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
  },
  avatarText: { color: '#fff', fontSize: 17 },
  judgeName: { fontSize: 15, color: COLORS.text },
  judgePos: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  pinText: { fontSize: 13, color: COLORS.textMuted },
  actionRow: { flexDirection: 'row', gap: 8 },
  editBtn: { padding: 8, borderRadius: 8, backgroundColor: COLORS.primaryLight },
  delBtn: { padding: 8, borderRadius: 8, backgroundColor: COLORS.errorLight },
  modalTitle: { fontSize: 18, color: COLORS.text, marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoLight,
    borderRadius: 10,
    padding: 10,
    gap: 6,
    marginTop: 4,
  },
  hintText: { fontSize: 13, color: COLORS.info, flex: 1 },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15 },
});
