// =============================================
// ReportScreen - รายงานผลคะแนนและ Dashboard ความครบถ้วน
// =============================================
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { COLORS, FONTS } from '../../utils/theme';
import { api } from '../../services/api';
import { getCache, setCache } from '../../services/cache';
import GlobalLoadingModal from '../../components/GlobalLoadingModal';
import ToastComponent from '../../components/ToastComponent';

export default function ReportScreen() {
  const [admissions, setAdmissions] = useState([]);
  const [selAdmission, setSelAdmission] = useState(null);
  const [dashboard, setDashboard] = useState(null);   // { students, judges, totalStudents, completeCount }
  const [selStudent, setSelStudent] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('admissions'); // 'admissions' | 'dashboard' | 'report'
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => { fetchAdmissions(); }, []);

  async function fetchAdmissions() {
    const cached = await getCache('admissions');
    if (cached) { setAdmissions(cached); return; }
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
    setLoading(true);
    const res = await api.getAdmissionDashboard(adm.id);
    if (res.success) setDashboard(res);
    setLoading(false);
    setStep('dashboard');
  }

  async function selectStudent(student) {
    setSelStudent(student);
    setLoading(true);
    const res = await api.getReport(selAdmission.id, student.id);
    if (res.success) setReport(res);
    setLoading(false);
    setStep('report');
  }

  function handlePrint() {
    if (!report) return;
    const admName = selAdmission?.name || '';
    const stuName = `${selStudent?.prefix || ''}${selStudent?.firstName || ''} ${selStudent?.lastName || ''}`.trim();
    const reportData = report.report || [];
    const judges = report.judges || [];

    const rows = reportData.flatMap(cat =>
      (cat.items || []).map(item => `
        <tr>
          <td>${cat.name}</td>
          <td>${item.name}</td>
          <td style="text-align:center">${item.maxScore}</td>
          <td style="text-align:center;font-weight:700;color:#2563EB">${(item.average ?? 0).toFixed(1)}</td>
        </tr>`)
    ).join('');

    const sigCells = judges.map(j => `
      <div class="sig-cell">
        <div class="sig-line"></div>
        <div class="sig-name">${j.judgeName}</div>
        <div class="sig-pos">${j.judgePosition || ''}</div>
        <div class="sig-pos">วันที่ ...................</div>
      </div>`).join('');

    const html = `<!DOCTYPE html>
<html lang="th"><head><meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Sarabun',sans-serif; font-size:14pt; color:#0F172A; padding:20mm 20mm 15mm; }
  h1 { text-align:center; font-size:20pt; font-weight:700; margin-bottom:4px; }
  h2 { text-align:center; font-size:14pt; font-weight:400; margin-bottom:16px; color:#475569; }
  table { width:100%; border-collapse:collapse; margin-bottom:12px; }
  th { background:#2563EB; color:#fff; padding:8px 10px; text-align:left; font-size:13pt; }
  td { padding:7px 10px; border-bottom:1px solid #E2E8F0; font-size:13pt; }
  tr:nth-child(even) td { background:#F8FAFC; }
  .total-row td { font-weight:700; font-size:14pt; background:#DBEAFE; }
  .sig-grid { display:flex; flex-wrap:wrap; gap:16px; margin-top:20px; }
  .sig-cell { flex:1; min-width:200px; text-align:center; padding:8px; }
  .sig-line { border-top:1px solid #0F172A; margin:48px 16px 8px; }
  .sig-name { font-weight:600; font-size:13pt; }
  .sig-pos { font-size:11pt; color:#64748B; margin-top:2px; }
  @media print { body { padding:15mm 15mm 12mm; } }
</style></head>
<body>
  <h1>${admName}</h1>
  <h2>${stuName}</h2>
  <table>
    <thead><tr>
      <th>ด้านความสามารถ</th><th>หัวข้อย่อย</th>
      <th style="text-align:center;width:80px">คะแนนเต็ม</th>
      <th style="text-align:center;width:80px">คะแนนเฉลี่ย</th>
    </tr></thead>
    <tbody>
      ${rows}
      <tr class="total-row">
        <td colspan="2">คะแนนรวม</td>
        <td style="text-align:center">${report.totalMax ?? 0}</td>
        <td style="text-align:center;color:#2563EB">${(report.totalAvg ?? 0).toFixed(1)}</td>
      </tr>
    </tbody>
  </table>
  <p style="font-size:11pt;color:#64748B;margin-bottom:4px">
    กรรมการผู้ประเมิน ${report.judgesScored}/${report.totalJudges} ท่าน
  </p>
  <div class="sig-grid">${sigCells}</div>
</body></html>`;

    Print.printAsync({ html }).catch(err =>
      setToast({ visible: true, message: 'ไม่สามารถพิมพ์ได้: ' + err.message, type: 'error' })
    );
  }

  return (
    <View style={S.root}>
      <GlobalLoadingModal visible={loading} />

      {/* ── Step: Select Admission ── */}
      {step === 'admissions' && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={[S.pageTitle, { fontFamily: 'Sarabun_700Bold' }]}>รายงานผลคะแนน</Text>
          <Text style={[S.pageSubtitle, { fontFamily: 'Sarabun_400Regular' }]}>
            เลือกประเภทการรับเพื่อดูรายงาน
          </Text>
          {admissions.length === 0 && !loading && (
            <View style={S.emptyBox}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
              <Text style={[S.emptyText, { fontFamily: 'Sarabun_400Regular' }]}>
                ยังไม่มีข้อมูลการรับนักเรียน
              </Text>
            </View>
          )}
          {admissions.map(adm => (
            <Pressable key={adm.id} onPress={() => selectAdmission(adm)} style={S.pickCard}>
              <View style={S.pickIconWrap}>
                <Ionicons name="school-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={[S.pickName, { fontFamily: 'Sarabun_600SemiBold' }]}>{adm.name}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* ── Step: Dashboard ── */}
      {step === 'dashboard' && dashboard && (
        <FlatList
          data={dashboard.students}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ListHeaderComponent={(
            <View>
              {/* Back + title */}
              <View style={S.dashHeader}>
                <Pressable onPress={() => setStep('admissions')} style={S.backBtn}>
                  <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={[S.dashTitle, { fontFamily: 'Sarabun_700Bold' }]}>{selAdmission?.name}</Text>
                  <Text style={[S.dashSub, { fontFamily: 'Sarabun_400Regular' }]}>
                    กรรมการ {dashboard.judges?.length || 0} คน
                  </Text>
                </View>
              </View>

              {/* Summary banner */}
              <View style={[
                S.banner,
                dashboard.completeCount === dashboard.totalStudents && dashboard.totalStudents > 0
                  ? S.bannerSuccess : S.bannerWarning,
              ]}>
                <Ionicons
                  name={dashboard.completeCount === dashboard.totalStudents && dashboard.totalStudents > 0
                    ? 'checkmark-circle' : 'time-outline'}
                  size={28}
                  color={dashboard.completeCount === dashboard.totalStudents && dashboard.totalStudents > 0
                    ? COLORS.success : COLORS.warning}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[S.bannerTitle, { fontFamily: 'Sarabun_700Bold' }]}>
                    {dashboard.completeCount === dashboard.totalStudents && dashboard.totalStudents > 0
                      ? 'กรรมการกรอกคะแนนครบแล้ว' : 'รอกรรมการกรอกคะแนน'}
                  </Text>
                  <Text style={[S.bannerSub, { fontFamily: 'Sarabun_400Regular' }]}>
                    ครบแล้ว {dashboard.completeCount} / {dashboard.totalStudents} คน
                  </Text>
                </View>
              </View>

              <Text style={[S.sectionLabel, { fontFamily: 'Sarabun_600SemiBold' }]}>
                นักเรียนทั้งหมด — กดเพื่อดูรายงาน
              </Text>
            </View>
          )}
          ListEmptyComponent={
            !loading && (
              <View style={S.emptyBox}>
                <Ionicons name="person-outline" size={48} color={COLORS.textMuted} />
                <Text style={[S.emptyText, { fontFamily: 'Sarabun_400Regular' }]}>
                  ยังไม่มีนักเรียนในการรับนี้
                </Text>
              </View>
            )
          }
          renderItem={({ item, index }) => (
            <Pressable onPress={() => selectStudent(item)} style={S.studentCard}>
              <View style={S.numBadge}>
                <Text style={[S.numText, { fontFamily: 'Sarabun_700Bold' }]}>{index + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[S.studentName, { fontFamily: 'Sarabun_600SemiBold' }]}>
                  {item.prefix}{item.firstName} {item.lastName}
                </Text>
                {item.studentCode ? (
                  <Text style={[S.studentMeta, { fontFamily: 'Sarabun_400Regular' }]}>
                    รหัส: {item.studentCode}
                  </Text>
                ) : null}
              </View>
              <View style={[S.badge, item.isComplete ? S.badgeOk : S.badgeWait]}>
                <Ionicons
                  name={item.isComplete ? 'checkmark-circle' : 'ellipse-outline'}
                  size={13}
                  color={item.isComplete ? COLORS.success : COLORS.warning}
                />
                <Text style={[
                  S.badgeText,
                  { fontFamily: 'Sarabun_500Medium', color: item.isComplete ? COLORS.success : COLORS.warning },
                ]}>
                  {item.judgesScored}/{item.totalJudges}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={{ marginLeft: 4 }} />
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}

      {/* ── Step: Report Detail ── */}
      {step === 'report' && report && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {/* Breadcrumb */}
          <View style={S.breadcrumb}>
            <Pressable onPress={() => setStep('admissions')}>
              <Text style={[S.breadItem, { fontFamily: 'Sarabun_500Medium' }]}>การรับนักเรียน</Text>
            </Pressable>
            <Ionicons name="chevron-forward" size={13} color={COLORS.textMuted} />
            <Pressable onPress={() => setStep('dashboard')}>
              <Text style={[S.breadItem, { fontFamily: 'Sarabun_500Medium' }]}>{selAdmission?.name}</Text>
            </Pressable>
            <Ionicons name="chevron-forward" size={13} color={COLORS.textMuted} />
            <Text style={[S.breadActive, { fontFamily: 'Sarabun_500Medium' }]}>
              {selStudent?.firstName}
            </Text>
          </View>

          {/* Status banner */}
          <View style={[S.banner, report.isComplete ? S.bannerSuccess : S.bannerWarning, { marginBottom: 16 }]}>
            <Ionicons
              name={report.isComplete ? 'checkmark-circle' : 'alert-circle'}
              size={24}
              color={report.isComplete ? COLORS.success : COLORS.warning}
            />
            <View>
              <Text style={[S.bannerTitle, {
                fontFamily: 'Sarabun_700Bold',
                color: report.isComplete ? COLORS.success : COLORS.warning,
              }]}>
                {report.isComplete ? 'กรรมการกรอกคะแนนครบแล้ว' : 'รอกรรมการกรอกคะแนน'}
              </Text>
              <Text style={[S.bannerSub, { fontFamily: 'Sarabun_400Regular' }]}>
                กรอกแล้ว {report.judgesScored}/{report.totalJudges} คน
              </Text>
            </View>
          </View>

          {/* Score card */}
          <View style={S.scoreCard}>
            <View style={S.scoreCardHeader}>
              <Text style={[S.scoreCardTitle, { fontFamily: 'Sarabun_700Bold' }]}>{selAdmission?.name}</Text>
              <Text style={[S.scoreCardSub, { fontFamily: 'Sarabun_400Regular' }]}>
                {selStudent?.prefix}{selStudent?.firstName} {selStudent?.lastName}
              </Text>
            </View>

            {(report.report || []).map((cat, ci) => (
              <View key={ci} style={S.catSection}>
                <View style={S.catHeaderBg}>
                  <Text style={[S.catHeaderText, { fontFamily: 'Sarabun_600SemiBold' }]}>{cat.name}</Text>
                </View>
                {(cat.items || []).map((item, ii) => (
                  <View key={ii} style={S.scoreRow}>
                    <Text style={[S.scoreLabel, { fontFamily: 'Sarabun_400Regular' }]}>{item.name}</Text>
                    <Text style={[S.scoreMax, { fontFamily: 'Sarabun_400Regular' }]}>
                      เต็ม {item.maxScore}
                    </Text>
                    <Text style={[S.scoreAvg, { fontFamily: 'Sarabun_700Bold' }]}>
                      {item.average != null ? item.average.toFixed(1) : '-'}
                    </Text>
                  </View>
                ))}
              </View>
            ))}

            <View style={S.totalRow}>
              <Text style={[S.totalLabel, { fontFamily: 'Sarabun_700Bold' }]}>คะแนนรวม</Text>
              <Text style={[S.totalScore, { fontFamily: 'Sarabun_800ExtraBold' }]}>
                {report.totalAvg?.toFixed(1)} / {report.totalMax}
              </Text>
            </View>
          </View>

          {/* Print button */}
          <Pressable onPress={handlePrint} style={S.printBtn}>
            <Ionicons name="print-outline" size={20} color="#fff" />
            <Text style={[S.printBtnText, { fontFamily: 'Sarabun_600SemiBold' }]}>พิมพ์รายงาน A4</Text>
          </Pressable>
        </ScrollView>
      )}

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
  // Dashboard
  dashHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  backBtn: { padding: 4 },
  dashTitle: { fontSize: 18, color: COLORS.text },
  dashSub: { fontSize: 13, color: COLORS.textMuted },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  bannerSuccess: { backgroundColor: COLORS.successLight },
  bannerWarning: { backgroundColor: COLORS.warningLight },
  bannerTitle: { fontSize: 15, color: COLORS.text },
  bannerSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  sectionLabel: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 10 },
  studentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    gap: 12,
  },
  numBadge: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 30,
  },
  numText: { color: '#fff', fontSize: 13 },
  studentName: { fontSize: 15, color: COLORS.text },
  studentMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 3,
  },
  badgeOk: { backgroundColor: COLORS.successLight },
  badgeWait: { backgroundColor: COLORS.warningLight },
  badgeText: { fontSize: 12 },
  // Report detail
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 4,
    flexWrap: 'wrap',
  },
  breadItem: { fontSize: 13, color: COLORS.primary },
  breadActive: { fontSize: 13, color: COLORS.text },
  scoreCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  scoreCardHeader: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12 },
  scoreCardTitle: { fontSize: 16, color: '#fff' },
  scoreCardSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  catSection: {},
  catHeaderBg: { backgroundColor: COLORS.surfaceAlt, paddingHorizontal: 16, paddingVertical: 8 },
  catHeaderText: { fontSize: 13, color: COLORS.textSecondary },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  scoreLabel: { flex: 1, fontSize: 14, color: COLORS.text },
  scoreMax: { fontSize: 13, color: COLORS.textMuted, marginRight: 12 },
  scoreAvg: { fontSize: 15, color: COLORS.primary, width: 44, textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primaryLight,
  },
  totalLabel: { fontSize: 15, color: COLORS.primaryDark },
  totalScore: { fontSize: 20, color: COLORS.primary },
  printBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  printBtnText: { color: '#fff', fontSize: 15 },
});
