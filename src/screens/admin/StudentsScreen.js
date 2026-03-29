// =============================================
// StudentsScreen - จัดการรายชื่อนักเรียน (เลือกการรับก่อน)
// =============================================
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Pressable, TextInput,
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
const EMPTY_FORM = { prefix: '', firstName: '', lastName: '', gpa: '', sch: '', tel: '' };

export default function StudentsScreen({ route }) {
  const raw = route?.params?.admission;
  const preselected = (raw && typeof raw === 'object' && raw.id) ? raw : null;
  const [step, setStep] = useState(preselected ? 'list' : 'pick'); // 'pick' | 'list'
  const [admissions, setAdmissions] = useState([]);
  const [selAdmission, setSelAdmission] = useState(preselected);
  const [students, setStudents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [confirmDel, setConfirmDel] = useState({ visible: false, item: null });

  // ── Admission CRUD states ──
  const [admModalVisible, setAdmModalVisible] = useState(false);
  const [admSelected, setAdmSelected] = useState(null);
  const [admFormName, setAdmFormName] = useState('');
  const [admFormLevels, setAdmFormLevels] = useState([]);
  const [admFormYear, setAdmFormYear] = useState('');
  const [confirmDelAdm, setConfirmDelAdm] = useState({ visible: false, item: null });

  function parseAdmInfo(item) {
    try { return JSON.parse(item.description || '{}'); } catch { return {}; }
  }
  function toggleAdmLevel(lv) {
    setAdmFormLevels(prev => prev.includes(lv) ? [] : [lv]);
  }

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

  // ── Admission CRUD functions ──
  function openAddAdm() {
    setAdmSelected(null); setAdmFormName(''); setAdmFormLevels([]);
    setAdmFormYear(String(new Date().getFullYear() + 543));
    setAdmModalVisible(true);
  }
  function openEditAdm(item) {
    const info = parseAdmInfo(item);
    setAdmSelected(item);
    setAdmFormName(item.name);
    setAdmFormLevels(item.level ? item.level.split(',').map(s => s.trim()).filter(Boolean) : []);
    setAdmFormYear(info.year || '');
    setAdmModalVisible(true);
  }

  async function handleSaveAdm() {
    if (!admFormName.trim()) return;
    setSaving(true);
    const info = JSON.stringify({ year: admFormYear.trim() });
    const payload = { name: admFormName.trim(), level: admFormLevels.join(', '), description: info };
    const res = admSelected
      ? await api.updateAdmission({ id: admSelected.id, ...payload })
      : await api.createAdmission(payload);
    setSaving(false);
    if (res.success) {
      setToast({ visible: true, message: admSelected ? 'แก้ไขสำเร็จ' : 'เพิ่มสำเร็จ', type: 'success' });
      setAdmModalVisible(false);
      await removeCache('admissions');
      fetchAdmissions(true);
    } else {
      setToast({ visible: true, message: res.error || 'เกิดข้อผิดพลาด', type: 'error' });
    }
  }

  function handleDeleteAdm(item) { setConfirmDelAdm({ visible: true, item }); }

  async function confirmDeleteAdm() {
    const item = confirmDelAdm.item;
    setConfirmDelAdm({ visible: false, item: null });
    setDeleting(true);
    const res = await api.deleteAdmission(item.id);
    setDeleting(false);
    if (res.success) {
      setToast({ visible: true, message: 'ลบสำเร็จ', type: 'success' });
      await removeCache('admissions');
      fetchAdmissions(true);
    } else {
      setToast({ visible: true, message: res.error || 'เกิดข้อผิดพลาด', type: 'error' });
    }
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
    setLoading(true);
    const res = await api.getStudents(selAdmission.id);
    if (res.success) {
      setStudents(res.students || []);
      await setCache(cacheKey, res.students || [], 5);
    }
    setLoading(false);
  }

  function openAdd() { setSelected(null); setForm(EMPTY_FORM); setModalVisible(true); }
  function openEdit(item) {
    setSelected(item);
    setForm({
      prefix: item.prefix || '',
      firstName: item.firstName || '',
      lastName: item.lastName || '',
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

  function handleDelete(item) {
    setConfirmDel({ visible: true, item });
  }

  async function confirmDeleteStudent() {
    const item = confirmDel.item;
    setConfirmDel({ visible: false, item: null });
    setDeleting(true);
    const res = await api.deleteStudent(item.id);
    setDeleting(false);
    if (res.success) {
      setToast({ visible: true, message: 'ลบสำเร็จ', type: 'success' });
      refreshStudents();
    } else {
      setToast({ visible: true, message: res.error || 'เกิดข้อผิดพลาด', type: 'error' });
    }
  }

  // ── Step 1: Pick Admission (with CRUD) ──────────────────────
  if (step === 'pick') {
    return (
      <View style={S.root}>
        <GlobalLoadingModal
          visible={loading || saving || deleting}
          message={deleting ? 'กำลังลบข้อมูล...' : saving ? 'กำลังบันทึกข้อมูล...' : 'กำลังโหลดข้อมูล...'}
        />

        {/* Breadcrumb header */}
        <View style={S.breadcrumbBar}>
          <View style={S.breadcrumbRow}>
            <Text style={[S.breadcrumbParent, { fontFamily: FONTS.regular }]}>แอดมิน</Text>
            <Ionicons name="chevron-forward" size={13} color={COLORS.textMuted} />
            <Text style={[S.breadcrumbCurrent, { fontFamily: FONTS.semiBold }]}>การรับเข้า</Text>
          </View>
          <Pressable onPress={openAddAdm} style={S.addBtn}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={[S.addBtnText, { fontFamily: FONTS.semiBold }]}>เพิ่ม</Text>
          </Pressable>
        </View>

        {/* Info cards */}
        <View style={S.infoCardRow}>
          <View style={[S.infoCard, { borderLeftColor: COLORS.primary }]}>
            <Text style={[S.infoCardNum, { fontFamily: FONTS.extraBold, color: COLORS.primary }]}>
              {admissions.length}
            </Text>
            <Text style={[S.infoCardLabel, { fontFamily: FONTS.regular }]}>ประเภทการรับ</Text>
          </View>
          <View style={[S.infoCard, { borderLeftColor: COLORS.secondary }]}>
            <Text style={[S.infoCardNum, { fontFamily: FONTS.extraBold, color: COLORS.secondary }]}>
              {admissions.length > 0 ? admissions.length : 0}
            </Text>
            <Text style={[S.infoCardLabel, { fontFamily: FONTS.regular }]}>รอบการแข่งขัน</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
          {admissions.length === 0 && !loading && (
            <View style={S.emptyBox}>
              <Ionicons name="school-outline" size={48} color={COLORS.textMuted} />
              <Text style={[S.emptyText, { fontFamily: FONTS.regular }]}>
                ยังไม่มีประเภทการรับ{'\n'}กดปุ่ม "+ เพิ่ม" เพื่อเริ่มต้น
              </Text>
            </View>
          )}
          {admissions.map(adm => (
            <View key={adm.id} style={S.pickCard}>
              <Pressable onPress={() => selectAdmission(adm)} style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
                <View style={S.pickIconWrap}>
                  <Ionicons name="people-circle-outline" size={22} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[S.pickName, { fontFamily: FONTS.semiBold }]}>{adm.name}</Text>
                  {(adm.level || parseAdmInfo(adm).year) ? (
                    <Text style={[S.pickSub, { fontFamily: FONTS.regular }]}>
                      {[adm.level, parseAdmInfo(adm).year && `ปี ${parseAdmInfo(adm).year}`].filter(Boolean).join('  ·  ')}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </Pressable>
              <View style={S.actionRow}>
                <Pressable onPress={() => openEditAdm(adm)} style={S.editBtn}>
                  <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
                </Pressable>
                <Pressable onPress={() => handleDeleteAdm(adm)} style={S.delBtn}>
                  <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Admission Form Modal */}
        <ModalComponent visible={admModalVisible} onClose={() => setAdmModalVisible(false)}>
          <Text style={[S.modalTitle, { fontFamily: FONTS.bold }]}>
            {admSelected ? 'แก้ไขประเภทการรับ' : 'เพิ่มประเภทการรับ'}
          </Text>

          <Text style={[S.fieldLabel, { fontFamily: FONTS.medium }]}>ชื่อประเภทการรับ *</Text>
          <TextInput
            style={[S.input, { fontFamily: FONTS.regular }]}
            placeholder="เช่น หุ่นยนต์และโดรน 2569"
            value={admFormName}
            onChangeText={setAdmFormName}
            autoFocus
          />

          <Text style={[S.fieldLabel, { fontFamily: FONTS.medium }]}>ระดับชั้น</Text>
          <View style={S.chipRow}>
            {['ม.ต้น', 'ม.ปลาย'].map(lv => (
              <Pressable
                key={lv}
                onPress={() => toggleAdmLevel(lv)}
                style={[S.chip, admFormLevels.includes(lv) && S.chipActive]}
              >
                <Text style={[S.chipText, { fontFamily: FONTS.regular }, admFormLevels.includes(lv) && S.chipTextActive]}>
                  {lv}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[S.fieldLabel, { fontFamily: FONTS.medium }]}>ปีที่รับเข้า (พ.ศ.)</Text>
          <TextInput
            style={[S.input, { fontFamily: FONTS.regular }]}
            placeholder="เช่น 2569"
            value={admFormYear}
            onChangeText={setAdmFormYear}
            keyboardType="number-pad"
          />

          <Pressable
            onPress={handleSaveAdm}
            disabled={saving || !admFormName.trim()}
            style={[S.saveBtn, { opacity: saving || !admFormName.trim() ? 0.5 : 1, marginTop: 4 }]}
          >
            <Text style={[S.saveBtnText, { fontFamily: FONTS.semiBold }]}>
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Text>
          </Pressable>
        </ModalComponent>

        {/* Confirm Delete Admission Modal */}
        <ModalComponent visible={confirmDelAdm.visible} onClose={() => setConfirmDelAdm({ visible: false, item: null })}>
          <Text style={[S.modalTitle, { fontFamily: FONTS.bold }]}>ยืนยันการลบ</Text>
          <Text style={[{ fontFamily: FONTS.regular, fontSize: 15, color: COLORS.text, marginBottom: 20 }]}>
            ลบ "{confirmDelAdm.item?.name}" ใช่หรือไม่?{'\n'}
            <Text style={{ color: COLORS.error, fontSize: 13 }}>รายชื่อนักเรียนทั้งหมดในประเภทนี้จะถูกลบด้วย</Text>
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={() => setConfirmDelAdm({ visible: false, item: null })}
              style={{ flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}
            >
              <Text style={{ fontFamily: FONTS.medium, color: COLORS.textSecondary, fontSize: 15 }}>ยกเลิก</Text>
            </Pressable>
            <Pressable
              onPress={confirmDeleteAdm}
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

  // ── Step 2: Student List ────────────────────────────────────
  return (
    <View style={S.root}>
      <GlobalLoadingModal
        visible={loading || saving || deleting}
        message={deleting ? 'กำลังลบข้อมูล...' : saving ? 'กำลังบันทึกข้อมูล...' : 'กำลังโหลดข้อมูล...'}
      />

      {/* Breadcrumb header */}
      <View style={S.breadcrumbBar}>
        <View style={S.breadcrumbRow}>
          {!preselected && (
            <Pressable onPress={() => setStep('pick')} style={[S.backBtn, { marginRight: 2 }]}>
              <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
            </Pressable>
          )}
          <Text style={[S.breadcrumbParent, { fontFamily: FONTS.regular }]}>การรับเข้า</Text>
          <Ionicons name="chevron-forward" size={13} color={COLORS.textMuted} />
          <Text style={[S.breadcrumbCurrent, { fontFamily: FONTS.semiBold }]} numberOfLines={1}>
            {selAdmission?.name}
          </Text>
        </View>
        <Pressable onPress={openAdd} style={S.addBtn}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={[S.addBtnText, { fontFamily: FONTS.semiBold }]}>เพิ่ม</Text>
        </Pressable>
      </View>

      {/* Info cards */}
      <View style={S.infoCardRow}>
        <View style={[S.infoCard, { borderLeftColor: COLORS.primary }]}>
          <Text style={[S.infoCardNum, { fontFamily: FONTS.extraBold, color: COLORS.primary }]}>
            {students.length}
          </Text>
          <Text style={[S.infoCardLabel, { fontFamily: FONTS.regular }]}>นักเรียนทั้งหมด</Text>
        </View>
        <View style={[S.infoCard, { borderLeftColor: COLORS.secondary }]}>
          <Text style={[S.infoCardNum, { fontFamily: FONTS.extraBold, color: COLORS.secondary }]}>
            {students.filter(s => s.gpa && s.sch).length}
          </Text>
          <Text style={[S.infoCardLabel, { fontFamily: FONTS.regular }]}>กรอกข้อมูลครบ</Text>
        </View>
      </View>

      <FlatList
        data={students}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={
          !loading && (
            <View style={S.emptyBox}>
              <Ionicons name="person-add-outline" size={48} color={COLORS.textMuted} />
              <Text style={[S.emptyText, { fontFamily: FONTS.regular }]}>
                ยังไม่มีรายชื่อนักเรียน
              </Text>
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <View style={S.card}>
            <View style={S.numBadge}>
              <Text style={[S.numText, { fontFamily: FONTS.bold }]}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[S.studentName, { fontFamily: FONTS.semiBold }]}>
                {item.prefix}{item.firstName} {item.lastName}
              </Text>
              {(item.gpa || item.sch || item.tel) ? (
                <Text style={[S.studentMeta, { fontFamily: FONTS.regular }]}>
                  {[
                    item.gpa && `เกรด: ${item.gpa}`,
                    item.sch && item.sch,
                    item.tel && `โทร: ${item.tel}`,
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
        <Text style={[S.modalTitle, { fontFamily: FONTS.bold }]}>
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

      {/* Confirm Delete Modal */}
      <ModalComponent visible={confirmDel.visible} onClose={() => setConfirmDel({ visible: false, item: null })}>
        <Text style={[S.modalTitle, { fontFamily: FONTS.bold }]}>ยืนยันการลบ</Text>
        <Text style={[{ fontFamily: FONTS.regular, fontSize: 15, color: COLORS.text, marginBottom: 20 }]}>
          ลบ {confirmDel.item?.prefix}{confirmDel.item?.firstName} {confirmDel.item?.lastName} ใช่หรือไม่?
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={() => setConfirmDel({ visible: false, item: null })}
            style={{ flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}
          >
            <Text style={{ fontFamily: FONTS.medium, color: COLORS.textSecondary, fontSize: 15 }}>ยกเลิก</Text>
          </Pressable>
          <Pressable
            onPress={confirmDeleteStudent}
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
  pageTitle: { fontSize: 22, color: COLORS.text, marginBottom: 4 },
  pageSubtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
  emptyBox: { alignItems: 'center', paddingVertical: 64 },
  emptyText: { color: COLORS.textMuted, marginTop: 12, fontSize: 15, textAlign: 'center' },
  breadcrumbBar: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  breadcrumbRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  breadcrumbParent: { fontSize: 13, color: COLORS.textMuted },
  breadcrumbCurrent: { fontSize: 14, color: COLORS.text },
  infoCardRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardNum: { fontSize: 28, lineHeight: 32 },
  infoCardLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  pickCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    gap: 8,
  },
  pickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickName: { fontSize: 16, color: COLORS.text },
  pickSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
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
