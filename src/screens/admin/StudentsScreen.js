// =============================================
// StudentsScreen - จัดการรายชื่อนักเรียน (เลือกการรับก่อน)
// =============================================
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Pressable, TextInput, Alert,
  ScrollView, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../utils/theme';
import { api } from '../../services/api';
import { getCache, setCache, removeCache } from '../../services/cache';
import ModalComponent from '../../components/ModalComponent';
import ToastComponent from '../../components/ToastComponent';
import GlobalLoadingModal from '../../components/GlobalLoadingModal';

const PREFIX_OPTIONS = ['นาย', 'นางสาว', 'เด็กชาย', 'เด็กหญิง'];
const CLASS_LV_OPTIONS = ['ม.ต้น', 'ม.ปลาย'];
const EMPTY_FORM = { prefix: '', firstName: '', lastName: '', classLv: '', gpa: '', sch: '', tel: '' };

export default function StudentsScreen({ route }) {
  const preselected = route?.params?.admission || null;
  const [step, setStep] = useState(preselected ? 'list' : 'pick'); // 'pick' | 'list'
  const [admissions, setAdmissions] = useState([]);
  const [selAdmission, setSelAdmission] = useState(preselected);
  const [students, setStudents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    if (preselected) {
      selectAdmission(preselected);
    } else {
      fetchAdmissions();
    }
  }, []);

  async function fetchAdmissions(forceRefresh = false) {
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

  async function selectAdmission(adm) {
    setSelAdmission(adm);
    const cacheKey = `students_${adm.id}`;
    const cached = await getCache(cacheKey);
    if (cached) { setStudents(cached); setStep('list'); return; }
    setLoading(true);
    const res = await api.getStudents(adm.id);
    if (res.success) {
      setStudents(res.students || []);
      await setCache(cacheKey, res.students || [], 5);
    }
    setLoading(false);
    setStep('list');
  }

  async function refreshStudents() {
    const cacheKey = `students_${selAdmission.id}`;
    await removeCache(cacheKey);
    const res = await api.getStudents(selAdmission.id);
    if (res.success) {
      setStudents(res.students || []);
      await setCache(cacheKey, res.students || [], 5);
    }
  }

  function openAdd() { setSelected(null); setForm(EMPTY_FORM); setModalVisible(true); }
  function openEdit(item) {
    setSelected(item);
    setForm({
      prefix: item.prefix || '',
      firstName: item.firstName || '',
      lastName: item.lastName || '',
      classLv: item.classLv || '',
      gpa: item.gpa || '',
      sch: item.sch || '',
      tel: item.tel || '',
    });
    setModalVisible(true);
  }

  async function handleSave() {
    if (!form.firstName.trim() || !form.lastName.trim()) return;
    setSaving(true);
    const payload = { ...form, admissionId: selAdmission.id };
    const res = selected
      ? await api.updateStudent({ id: selected.id, ...payload })
      : await api.createStudent(payload);
    setSaving(false);
    if (res.success) {
      setToast({ visible: true, message: selected ? 'แก้ไขสำเร็จ' : 'เพิ่มนักเรียนสำเร็จ', type: 'success' });
      setModalVisible(false);
      refreshStudents();
    } else {
      setToast({ visible: true, message: res.error || 'เกิดข้อผิดพลาด', type: 'error' });
    }
  }

  async function handleDelete(item) {
    Alert.alert('ยืนยันการลบ', `ลบ ${item.firstName} ${item.lastName} ใช่หรือไม่?`, [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบ', style: 'destructive', onPress: async () => {
          const res = await api.deleteStudent(item.id);
          if (res.success) {
            setToast({ visible: true, message: 'ลบสำเร็จ', type: 'success' });
            refreshStudents();
          }
        },
      },
    ]);
  }

  // ── Step 1: Pick Admission ──────────────────────────────────
  if (step === 'pick') {
    return (
      <View style={S.root}>
        <GlobalLoadingModal visible={loading} />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={[S.pageTitle, { fontFamily: 'Sarabun_700Bold' }]}>รายชื่อนักเรียน</Text>
          <Text style={[S.pageSubtitle, { fontFamily: 'Sarabun_400Regular' }]}>
            เลือกประเภทการรับเพื่อจัดการรายชื่อนักเรียน
          </Text>
          {admissions.length === 0 && !loading && (
            <View style={S.emptyBox}>
              <Ionicons name="school-outline" size={48} color={COLORS.textMuted} />
              <Text style={[S.emptyText, { fontFamily: 'Sarabun_400Regular' }]}>
                ยังไม่มีการรับนักเรียน{'\n'}กรุณาเพิ่มในหน้า "การรับนักเรียน" ก่อน
              </Text>
            </View>
          )}
          {admissions.map(adm => (
            <Pressable key={adm.id} onPress={() => selectAdmission(adm)} style={S.pickCard}>
              <View style={S.pickIconWrap}>
                <Ionicons name="people-circle-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={[S.pickName, { fontFamily: 'Sarabun_600SemiBold' }]}>{adm.name}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </Pressable>
          ))}
        </ScrollView>
        <ToastComponent {...toast} onHide={() => setToast({ ...toast, visible: false })} />
      </View>
    );
  }

  // ── Step 2: Student List ────────────────────────────────────
  return (
    <View style={S.root}>
      <GlobalLoadingModal visible={loading} />

      <View style={S.header}>
        {!preselected && (
          <Pressable onPress={() => setStep('pick')} style={S.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[S.headerTitle, { fontFamily: 'Sarabun_700Bold' }]} numberOfLines={1}>
            {selAdmission?.name}
          </Text>
          <Text style={[S.headerSub, { fontFamily: 'Sarabun_400Regular' }]}>
            {students.length} คน
          </Text>
        </View>
        <Pressable onPress={openAdd} style={S.addBtn}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={[S.addBtnText, { fontFamily: 'Sarabun_600SemiBold' }]}>เพิ่ม</Text>
        </Pressable>
      </View>

      <FlatList
        data={students}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={
          !loading && (
            <View style={S.emptyBox}>
              <Ionicons name="person-add-outline" size={48} color={COLORS.textMuted} />
              <Text style={[S.emptyText, { fontFamily: 'Sarabun_400Regular' }]}>
                ยังไม่มีรายชื่อนักเรียน
              </Text>
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <View style={S.card}>
            <View style={S.numBadge}>
              <Text style={[S.numText, { fontFamily: 'Sarabun_700Bold' }]}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[S.studentName, { fontFamily: 'Sarabun_600SemiBold' }]}>
                {item.prefix}{item.firstName} {item.lastName}
              </Text>
              {(item.classLv || item.gpa || item.previousSchool || item.phone) ? (
                <Text style={[S.studentMeta, { fontFamily: 'Sarabun_400Regular' }]}>
                  {[
                    item.classLv && item.classLv,
                    item.gpa && `เกรด: ${item.gpa}`,
                    item.sch && item.sch,
                    item.phone && `โทร: ${item.phone}`,
                  ].filter(Boolean).join('  ·  ')}
                </Text>
              ) : null}
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
          {selected ? 'แก้ไขนักเรียน' : 'เพิ่มนักเรียน'}
        </Text>
        {/* คำนำหน้า */}
        <Text style={[S.fieldLabel, { fontFamily: FONTS.medium }]}>คำนำหน้า</Text>
        <View style={S.chipRow}>
          {PREFIX_OPTIONS.map(opt => (
            <Pressable
              key={opt}
              onPress={() => setForm({ ...form, prefix: opt })}
              style={[S.chip, form.prefix === opt && S.chipActive]}
            >
              <Text style={[S.chipText, { fontFamily: FONTS.regular }, form.prefix === opt && S.chipTextActive]}>
                {opt}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ชื่อ - นามสกุล */}
        <View style={{ marginBottom: 12 }}>
          <Text style={[S.fieldLabel, { fontFamily: FONTS.medium }]}>ชื่อ *</Text>
          <TextInput
            style={[S.input, { fontFamily: FONTS.regular }]}
            placeholder="ชื่อนักเรียน"
            value={form.firstName}
            onChangeText={v => setForm({ ...form, firstName: v })}
          />
        </View>
        <View style={{ marginBottom: 12 }}>
          <Text style={[S.fieldLabel, { fontFamily: FONTS.medium }]}>นามสกุล *</Text>
          <TextInput
            style={[S.input, { fontFamily: FONTS.regular }]}
            placeholder="นามสกุลนักเรียน"
            value={form.lastName}
            onChangeText={v => setForm({ ...form, lastName: v })}
          />
        </View>

        {/* ระดับชั้น */}
        <Text style={[S.fieldLabel, { fontFamily: FONTS.medium }]}>ระดับชั้น</Text>
        <View style={S.chipRow}>
          {CLASS_LV_OPTIONS.map(opt => (
            <Pressable
              key={opt}
              onPress={() => setForm({ ...form, classLv: opt })}
              style={[S.chip, form.classLv === opt && S.chipActive]}
            >
              <Text style={[S.chipText, { fontFamily: FONTS.regular }, form.classLv === opt && S.chipTextActive]}>
                {opt}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* เกรดเฉลี่ย */}
        <View style={{ marginBottom: 12 }}>
          <Text style={[S.fieldLabel, { fontFamily: FONTS.medium }]}>เกรดเฉลี่ย 5 เทอม</Text>
          <TextInput
            style={[S.input, { fontFamily: FONTS.regular }]}
            placeholder="เช่น 3.75"
            value={form.gpa}
            onChangeText={v => setForm({ ...form, gpa: v })}
            keyboardType="decimal-pad"
          />
        </View>

        {/* โรงเรียนเดิม */}
        <View style={{ marginBottom: 12 }}>
          <Text style={[S.fieldLabel, { fontFamily: FONTS.medium }]}>โรงเรียนเดิม</Text>
          <TextInput
            style={[S.input, { fontFamily: FONTS.regular }]}
            placeholder="ชื่อโรงเรียนเดิม"
            value={form.sch}
            onChangeText={v => setForm({ ...form, sch: v })}
          />
        </View>

        {/* เบอร์โทรศัพท์ */}
        <View style={{ marginBottom: 12 }}>
          <Text style={[S.fieldLabel, { fontFamily: FONTS.medium }]}>เบอร์โทรศัพท์</Text>
          <TextInput
            style={[S.input, { fontFamily: FONTS.regular }]}
            placeholder="เบอร์โทรนักเรียน/ผู้ปกครอง"
            value={form.tel}
            onChangeText={v => setForm({ ...form, tel: v })}
            keyboardType="phone-pad"
          />
        </View>

        <Pressable
          onPress={handleSave}
          disabled={saving || !form.firstName.trim() || !form.lastName.trim()}
          style={[S.saveBtn, { opacity: saving || !form.firstName.trim() ? 0.5 : 1, marginTop: 8 }]}
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
  pageTitle: { fontSize: 22, color: COLORS.text, marginBottom: 4 },
  pageSubtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
  emptyBox: { alignItems: 'center', paddingVertical: 64 },
  emptyText: { color: COLORS.textMuted, marginTop: 12, fontSize: 15, textAlign: 'center' },
  pickCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    gap: 12,
  },
  pickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickName: { flex: 1, fontSize: 16, color: COLORS.text },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textMuted },
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
  numBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
  },
  numText: { color: '#fff', fontSize: 13 },
  studentName: { fontSize: 15, color: COLORS.text },
  studentMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
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
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 14, color: COLORS.textMuted },
  chipTextActive: { color: '#fff' },
});
