// =============================================
// AdmissionsScreen - จัดการชื่อการรับนักเรียน
// =============================================
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, StyleSheet } from 'react-native';
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
  const [formLevels, setFormLevels] = useState([]);
  const [formYear, setFormYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [confirmDel, setConfirmDel] = useState({ visible: false, item: null });

  function parseInfo(item) {
    try { return JSON.parse(item.description || '{}'); } catch { return {}; }
  }

  function toggleLevel(lv) {
    setFormLevels(prev => prev.includes(lv) ? [] : [lv]);
  }

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

  function openAdd() {
    setSelected(null); setFormName(''); setFormLevels([]); setFormYear(String(new Date().getFullYear() + 543));
    setModalVisible(true);
  }
  function openEdit(item) {
    const info = parseInfo(item);
    setSelected(item);
    setFormName(item.name);
    setFormLevels(item.level ? item.level.split(',').map(s => s.trim()).filter(Boolean) : []);
    setFormYear(info.year || '');
    setModalVisible(true);
  }

  async function handleSave() {
    if (!formName.trim()) return;
    setSaving(true);
    const info = JSON.stringify({ year: formYear.trim() });
    const payload = { name: formName.trim(), level: formLevels.join(', '), description: info };
    const res = selected
      ? await api.updateAdmission({ id: selected.id, ...payload })
      : await api.createAdmission(payload);
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

  function handleDelete(item) { setConfirmDel({ visible: true, item }); }

  async function confirmDeleteItem() {
    const item = confirmDel.item;
    setConfirmDel({ visible: false, item: null });
    setDeleting(true);
    const res = await api.deleteAdmission(item.id);
    setDeleting(false);
    if (res.success) {
      setToast({ visible: true, message: 'ลบสำเร็จ', type: 'success' });
      await removeCache('admissions');
      fetchData(true);
    } else {
      setToast({ visible: true, message: res.error || 'เกิดข้อผิดพลาด', type: 'error' });
    }
  }

  return (
    <View style={S.root}>
      <GlobalLoadingModal
        visible={loading || saving || deleting}
        message={deleting ? 'กำลังลบข้อมูล...' : saving ? 'กำลังบันทึกข้อมูล...' : 'กำลังโหลดข้อมูล...'}
      />

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
            <View style={{ flex: 1 }}>
              <Text style={[S.cardName, { fontFamily: FONTS.medium }]}>{item.name}</Text>
              {(item.level || parseInfo(item).year) ? (
                <Text style={[S.cardSub, { fontFamily: FONTS.regular }]}>
                  {[item.level, parseInfo(item).year && `ปี ${parseInfo(item).year}`].filter(Boolean).join('  ·  ')}
                </Text>
              ) : null}
            </View>
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

      {/* Form Modal */}
      <ModalComponent visible={modalVisible} onClose={() => setModalVisible(false)}>
        <Text style={[S.modalTitle, { fontFamily: FONTS.bold }]}>
          {selected ? 'แก้ไขการรับนักเรียน' : 'เพิ่มการรับนักเรียน'}
        </Text>

        <Text style={[S.fieldLabel, { fontFamily: FONTS.medium }]}>ชื่อประเภทการรับ *</Text>
        <TextInput
          style={[S.input, { fontFamily: FONTS.regular }]}
          placeholder="เช่น หุ่นยนต์และโดรน 2569"
          value={formName}
          onChangeText={setFormName}
          autoFocus
        />

        <Text style={[S.fieldLabel, { fontFamily: FONTS.medium }]}>ระดับชั้น</Text>
        <View style={S.chipRow}>
          {['ม.ต้น', 'ม.ปลาย'].map(lv => (
            <Pressable
              key={lv}
              onPress={() => toggleLevel(lv)}
              style={[S.chip, formLevels.includes(lv) && S.chipActive]}
            >
              <Text style={[S.chipText, { fontFamily: FONTS.regular }, formLevels.includes(lv) && S.chipTextActive]}>
                {lv}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[S.fieldLabel, { fontFamily: FONTS.medium }]}>ปีที่รับเข้า (พ.ศ.)</Text>
        <TextInput
          style={[S.input, { fontFamily: FONTS.regular }]}
          placeholder="เช่น 2569"
          value={formYear}
          onChangeText={setFormYear}
          keyboardType="number-pad"
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

      {/* Confirm Delete Modal */}
      <ModalComponent visible={confirmDel.visible} onClose={() => setConfirmDel({ visible: false, item: null })}>
        <Text style={[S.modalTitle, { fontFamily: FONTS.bold }]}>ยืนยันการลบ</Text>
        <Text style={{ fontFamily: FONTS.regular, fontSize: 15, color: COLORS.text, marginBottom: 20 }}>
          ลบ "{confirmDel.item?.name}" ใช่หรือไม่?
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={() => setConfirmDel({ visible: false, item: null })}
            style={{ flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}
          >
            <Text style={{ fontFamily: FONTS.medium, color: COLORS.textSecondary, fontSize: 15 }}>ยกเลิก</Text>
          </Pressable>
          <Pressable
            onPress={confirmDeleteItem}
            style={{ flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.error }}
          >
            <Text style={{ fontFamily: FONTS.semiBold, color: '#fff', fontSize: 15 }}>ลบ</Text>
          </Pressable>
        </View>
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
  cardName: { fontSize: 15, color: COLORS.text },
  cardSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
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
    marginBottom: 14,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 14, color: COLORS.textMuted },
  chipTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15 },
});
