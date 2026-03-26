// =============================================
// JudgeScoreScreen - กรอกคะแนนแต่ละหัวข้อย่อย
// =============================================
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, commonStyles } from '../../utils/theme';
import { api } from '../../services/api';

import ToastComponent from '../../components/ToastComponent';
import GlobalLoadingModal from '../../components/GlobalLoadingModal';


export default function JudgeScoreScreen({ route, navigation }) {
  const student = route.params?.student;
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchCriteria();
  }, []);

  async function fetchCriteria() {
    setFetching(true);
    // TODO: ต้องเลือก admissionId จริง (mock)
    const res = await api.getCriteria('admissionId-mock');
    if (res.success) setCriteria(res.criteria);
    setFetching(false);
  }

  function handleScoreChange(catIdx, itemIdx, value, maxScore) {
    let v = parseInt(value, 10);
    if (isNaN(v)) v = '';
    if (v > maxScore) v = maxScore;
    const newScores = [...scores];
    newScores[catIdx] = newScores[catIdx] || [];
    newScores[catIdx][itemIdx] = v;
    setScores(newScores);
  }

  async function handleSubmit() {
    setLoading(true);
    // TODO: ต้องใช้ judgeId จริง
    const data = {
      judgeId: 'judgeId-mock',
      studentId: student.id,
      admissionId: 'admissionId-mock',
      scores: []
    };
    criteria.forEach((cat, catIdx) => {
      cat.items.forEach((item, itemIdx) => {
        data.scores.push({ criteriaIndex: catIdx, itemIndex: itemIdx, score: scores[catIdx]?.[itemIdx] || 0 });
      });
    });
    const res = await api.saveScores(data);
    setLoading(false);
    if (res.success) {
      setToast({ visible: true, message: 'บันทึกคะแนนสำเร็จ', type: 'success' });
      navigation.goBack();
    } else {
      setToast({ visible: true, message: res.error || 'เกิดข้อผิดพลาด', type: 'error' });
    }
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={styles.container}>
      <GlobalLoadingModal visible={loading || fetching} />
      <Text style={styles.title}>กรอกคะแนน: {student?.firstName} {student?.lastName}</Text>
      {criteria.map((cat, catIdx) => (
        <View key={catIdx} style={styles.catBox}>
          <Text style={styles.catTitle}>{cat.name}</Text>
          {cat.items.map((item, itemIdx) => (
            <View key={itemIdx} style={styles.itemRow}>
              <Text style={styles.itemText}>{item.name} (เต็ม {item.maxScore})</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={scores[catIdx]?.[itemIdx]?.toString() || ''}
                onChangeText={v => handleScoreChange(catIdx, itemIdx, v, item.maxScore)}
                maxLength={3}
              />
            </View>
          ))}
        </View>
      ))}
      <Button title={loading ? 'กำลังบันทึก...' : 'บันทึกคะแนน'} onPress={handleSubmit} disabled={loading} />
      <ToastComponent {...toast} onHide={() => setToast({ ...toast, visible: false })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  title: {
    ...FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  catBox: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 8,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  catTitle: {
    ...FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  itemRow: {
    ...commonStyles.row,
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  itemText: {
    ...FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1,
  },
  input: {
    ...commonStyles.input,
    width: 60,
    textAlign: 'center',
  },
});
