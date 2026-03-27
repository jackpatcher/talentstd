// =============================================
// CriteriaScreen - จัดการลักษณะความสามารถและเกณฑ์
// เลือกการรับนักเรียนก่อน แล้วจัดการเกณฑ์ใน-state แล้วบันทึกทั้งกลุ่ม
// =============================================
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Pressable, TextInput,
  ScrollView, Alert, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../utils/theme';
import { api } from '../../services/api';
import { getCache, setCache, removeCache } from '../../services/cache';
import ModalComponent from '../../components/ModalComponent';
import ToastComponent from '../../components/ToastComponent';
import GlobalLoadingModal from '../../components/GlobalLoadingModal';

export default function CriteriaScreen({ route }) {
  const preselected = route?.params?.admission || null;
  const [step, setStep] = useState(preselected ? 'edit' : 'pick'); // 'pick' | 'edit'
  const [admissions, setAdmissions] = useState([]);
  const [selAdmission, setSelAdmission] = useState(preselected);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [expanded, setExpanded] = useState({});

  const [catModal, setCatModal] = useState(false);
  const [editCatIdx, setEditCatIdx] = useState(null);
  const [catName, setCatName] = useState('');

  const [subModal, setSubModal] = useState(false);
  const [subCatIdx, setSubCatIdx] = useState(null);
  const [editSubIdx, setEditSubIdx] = useState(null);
  const [subForm, setSubForm] = useState({ name: '', maxScore: '' });

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
    const cacheKey = `criteria_${adm.id}`;
    const cached = await getCache(cacheKey);
    if (cached) { setCategories(cached); setExpanded({}); setStep('edit'); return; }
    setLoading(true);
    const res = await api.getCriteria(adm.id);
    if (res.success) {
      setCategories(res.criteria || []);
      await setCache(cacheKey, res.criteria || [], 10);
    }
    setLoading(false);
    setExpanded({});
    setStep('edit');
  }

  function toggleExpand(idx) {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  }

  function openAddCat() { setEditCatIdx(null); setCatName(''); setCatModal(true); }
  function openEditCat(idx) { setEditCatIdx(idx); setCatName(categories[idx].name); setCatModal(true); }

  function handleSaveCat() {
    if (!catName.trim()) return;
    setCategories(prev => {
      const next = [...prev];
      if (editCatIdx !== null) {
        next[editCatIdx] = { ...next[editCatIdx], name: catName.trim() };
      } else {
        next.push({ name: catName.trim(), items: [] });
      }
      return next;
    });
    setCatModal(false);
  }

  function handleDeleteCat(idx) {
    Alert.alert('ยืนยัน', `ลบ "${categories[idx].name}"?`, [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ลบ', style: 'destructive', onPress: () => {
        setCategories(prev => prev.filter((_, i) => i !== idx));
      }},
    ]);
  }

  function openAddSub(catIdx) {
    setSubCatIdx(catIdx); setEditSubIdx(null);
    setSubForm({ name: '', maxScore: '' }); setSubModal(true);
  }
  function openEditSub(catIdx, subIdx) {
    const sub = categories[catIdx].items[subIdx];
    setSubCatIdx(catIdx); setEditSubIdx(subIdx);
    setSubForm({ name: sub.name, maxScore: String(sub.maxScore) }); setSubModal(true);
  }

  function handleSaveSub() {
    if (!subForm.name.trim() || !subForm.maxScore) return;
    const item = { name: subForm.name.trim(), maxScore: Number(subForm.maxScore) };
    setCategories(prev => prev.map((cat, i) => {
      if (i !== subCatIdx) return cat;
      const items = [...cat.items];
      if (editSubIdx !== null) { items[editSubIdx] = item; } else { items.push(item); }
      return { ...cat, items };
    }));
    setSubModal(false);
  }

  function handleDeleteSub(catIdx, subIdx) {
    setCategories(prev => prev.map((cat, i) => {
      if (i !== catIdx) return cat;
      return { ...cat, items: cat.items.filter((_, j) => j !== subIdx) };
    }));
  }

  async function handleSave() {
    setSaving(true);
    const res = await api.saveCriteria(selAdmission.id, categories);
    setSaving(false);
    if (res.success) {
      await removeCache(`criteria_${selAdmission.id}`);
      setToast({ visible: true, message: 'บันทึกเกณฑ์สำเร็จ', type: 'success' });
    } else {
      setToast({ visible: true, message: res.error || 'เกิดข้อผิดพลาด', type: 'error' });
    }
  }

  return (
    <View style={S.root}>
      <GlobalLoadingModal visible={loading} />

      {/* ── Step 1: Pick Admission ── */}
      {step === 'pick' && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={[S.pageTitle, { fontFamily: 'Sarabun_700Bold' }]}>เกณฑ์การประเมิน</Text>
          <Text style={[S.pageSubtitle, { fontFamily: 'Sarabun_400Regular' }]}>
            เลือกประเภทการรับเพื่อจัดการเกณฑ์คะแนน
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
                <Ionicons name="star-outline" size={20} color={COLORS.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[S.pickName, { fontFamily: 'Sarabun_600SemiBold' }]}>{adm.name}</Text>
                {adm.level ? (
                  <Text style={[S.pickSub, { fontFamily: 'Sarabun_400Regular' }]}>{adm.level}</Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* ── Step 2: Edit Criteria ── */}
      {step === 'edit' && (
        <View style={{ flex: 1 }}>
          <View style={S.header}>
            <Pressable onPress={() => setStep('pick')} style={S.backBtn}>
              <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={[S.headerTitle, { fontFamily: 'Sarabun_700Bold' }]} numberOfLines={1}>
                {selAdmission?.name}
              </Text>
              <Text style={[S.headerSub, { fontFamily: 'Sarabun_400Regular' }]}>
                {categories.length} ด้าน · {categories.reduce((s, c) => s + (c.items?.length || 0), 0)} หัวข้อ
              </Text>
            </View>
            <Pressable onPress={openAddCat} style={[S.actionBtn, { backgroundColor: COLORS.accent }]}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={[S.actionBtnText, { fontFamily: 'Sarabun_600SemiBold' }]}>เพิ่มด้าน</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={[S.actionBtn, { backgroundColor: COLORS.primary, opacity: saving ? 0.6 : 1 }]}
            >
              <Ionicons name="save-outline" size={16} color="#fff" />
              <Text style={[S.actionBtnText, { fontFamily: 'Sarabun_600SemiBold' }]}>
                {saving ? 'บันทึก...' : 'บันทึก'}
              </Text>
            </Pressable>
          </View>

          <FlatList
            data={categories}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}
            ListEmptyComponent={(
              <View style={S.emptyBox}>
                <Ionicons name="layers-outline" size={48} color={COLORS.textMuted} />
                <Text style={[S.emptyText, { fontFamily: 'Sarabun_400Regular' }]}>
                  ยังไม่มีด้านความสามารถ กดเพิ่มด้านได้เลย
                </Text>
              </View>
            )}
            renderItem={({ item: cat, index: catIdx }) => (
              <View style={S.catCard}>
                {/* Category header row */}
                <Pressable onPress={() => toggleExpand(catIdx)} style={S.catRow}>
                  <View style={S.catIconWrap}>
                    <Ionicons name="star-outline" size={15} color="#fff" />
                  </View>
                  <Text style={[S.catName, { fontFamily: 'Sarabun_600SemiBold' }]}>{cat.name}</Text>
                  <Text style={[S.catCount, { fontFamily: 'Sarabun_400Regular' }]}>
                    {cat.items?.length || 0} หัวข้อ
                  </Text>
                  <View style={S.catActions}>
                    <Pressable onPress={() => openEditCat(catIdx)} style={S.iconBtn}>
                      <Ionicons name="pencil-outline" size={14} color={COLORS.primary} />
                    </Pressable>
                    <Pressable onPress={() => handleDeleteCat(catIdx)} style={S.iconBtnDel}>
                      <Ionicons name="trash-outline" size={14} color={COLORS.error} />
                    </Pressable>
                    <Ionicons
                      name={expanded[catIdx] ? 'chevron-up' : 'chevron-down'}
                      size={18} color={COLORS.textMuted}
                    />
                  </View>
                </Pressable>

                {/* Sub-items */}
                {expanded[catIdx] && (
                  <View style={S.subList}>
                    {(cat.items || []).map((sub, subIdx) => (
                      <View key={subIdx} style={S.subRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={[S.subName, { fontFamily: 'Sarabun_500Medium' }]}>
                            {subIdx + 1}. {sub.name}
                          </Text>
                          <Text style={[S.subScore, { fontFamily: 'Sarabun_400Regular' }]}>
                            คะแนนเต็ม: {sub.maxScore}
                          </Text>
                        </View>
                        <View style={S.subActions}>
                          <Pressable onPress={() => openEditSub(catIdx, subIdx)} style={S.iconBtnSm}>
                            <Ionicons name="pencil-outline" size={13} color={COLORS.primary} />
                          </Pressable>
                          <Pressable onPress={() => handleDeleteSub(catIdx, subIdx)} style={S.iconBtnSmDel}>
                            <Ionicons name="trash-outline" size={13} color={COLORS.error} />
                          </Pressable>
                        </View>
                      </View>
                    ))}
                    <Pressable onPress={() => openAddSub(catIdx)} style={S.addSubBtn}>
                      <Ionicons name="add-circle" size={17} color={COLORS.secondary} />
                      <Text style={[S.addSubText, { fontFamily: 'Sarabun_500Medium' }]}>เพิ่มหัวข้อย่อย</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          />
        </View>
      )}

      {/* Category modal */}
      <ModalComponent visible={catModal} onClose={() => setCatModal(false)}>
        <Text style={[S.modalTitle, { fontFamily: 'Sarabun_700Bold' }]}>
          {editCatIdx !== null ? 'แก้ไขด้านความสามารถ' : 'เพิ่มด้านความสามารถ'}
        </Text>
        <TextInput
          style={[S.input, { fontFamily: 'Sarabun_400Regular', marginBottom: 16 }]}
          placeholder="เช่น ด้านคอมพิวเตอร์"
          value={catName}
          onChangeText={setCatName}
          autoFocus
        />
        <Pressable
          onPress={handleSaveCat}
          disabled={!catName.trim()}
          style={[S.saveBtnAccent, { opacity: !catName.trim() ? 0.5 : 1 }]}
        >
          <Text style={[S.saveBtnText, { fontFamily: 'Sarabun_600SemiBold' }]}>บันทึก</Text>
        </Pressable>
      </ModalComponent>

      {/* Sub-criteria modal */}
      <ModalComponent visible={subModal} onClose={() => setSubModal(false)}>
        <Text style={[S.modalTitle, { fontFamily: 'Sarabun_700Bold' }]}>
          {editSubIdx !== null ? 'แก้ไขหัวข้อย่อย' : 'เพิ่มหัวข้อย่อย'}
        </Text>
        <View style={{ marginBottom: 12 }}>
          <Text style={[S.fieldLabel, { fontFamily: 'Sarabun_500Medium' }]}>ชื่อหัวข้อ</Text>
          <TextInput
            style={[S.input, { fontFamily: 'Sarabun_400Regular' }]}
            placeholder="เช่น การติดตั้งโปรแกรม"
            value={subForm.name}
            onChangeText={v => setSubForm({ ...subForm, name: v })}
            autoFocus
          />
        </View>
        <View style={{ marginBottom: 16 }}>
          <Text style={[S.fieldLabel, { fontFamily: 'Sarabun_500Medium' }]}>คะแนนเต็ม</Text>
          <TextInput
            style={[S.input, { fontFamily: 'Sarabun_400Regular' }]}
            placeholder="เช่น 20"
            keyboardType="numeric"
            value={subForm.maxScore}
            onChangeText={v => setSubForm({ ...subForm, maxScore: v })}
          />
        </View>
        <Pressable
          onPress={handleSaveSub}
          disabled={!subForm.name.trim() || !subForm.maxScore}
          style={[S.saveBtnSecondary, { opacity: !subForm.name.trim() || !subForm.maxScore ? 0.5 : 1 }]}
        >
          <Text style={[S.saveBtnText, { fontFamily: 'Sarabun_600SemiBold' }]}>บันทึก</Text>
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
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickName: { fontSize: 16, color: COLORS.text },
  pickSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 8,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, color: COLORS.text },
  headerSub: { fontSize: 11, color: COLORS.textMuted },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  actionBtnText: { color: '#fff', fontSize: 13 },
  catCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  catIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catName: { flex: 1, fontSize: 15, color: COLORS.text },
  catCount: { fontSize: 12, color: COLORS.textMuted },
  catActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: { padding: 6, borderRadius: 7, backgroundColor: COLORS.primaryLight },
  iconBtnDel: { padding: 6, borderRadius: 7, backgroundColor: COLORS.errorLight },
  subList: {
    backgroundColor: COLORS.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  subName: { fontSize: 14, color: COLORS.text },
  subScore: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  subActions: { flexDirection: 'row', gap: 6, marginLeft: 8 },
  iconBtnSm: { padding: 5, borderRadius: 6, backgroundColor: COLORS.primaryLight },
  iconBtnSmDel: { padding: 5, borderRadius: 6, backgroundColor: COLORS.errorLight },
  addSubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  addSubText: { fontSize: 13, color: COLORS.secondary },
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
  saveBtnAccent: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnSecondary: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 15 },
});
