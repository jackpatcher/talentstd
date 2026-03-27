// =============================================
// JudgeScoreScreen - ให้คะแนนแต่ละเกณฑ์
// =============================================
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { api } from '../../services/api';
import { getSession } from '../../services/auth';
import ToastComponent from '../../components/ToastComponent';
import GlobalLoadingModal from '../../components/GlobalLoadingModal';

export default function JudgeScoreScreen({ route, navigation }) {
  const { student, admissionId } = route.params || {};
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({});
  const [judgeId, setJudgeId] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      setJudgeId(session?.judge?.id || null);
      setFetching(true);
      const res = await api.getCriteria(admissionId || 'all');
      if (res.success) setCriteria(res.criteria || []);
      setFetching(false);
    })();
  }, []);

  function handleScoreChange(catIdx, itemIdx, value, maxScore) {
    let v = value.replace(/[^0-9]/g, '');
    if (v !== '' && parseInt(v, 10) > maxScore) v = String(maxScore);
    setScores(prev => ({
      ...prev,
      [`${catIdx}-${itemIdx}`]: v,
    }));
  }

  function getScore(catIdx, itemIdx) {
    return scores[`${catIdx}-${itemIdx}`] ?? '';
  }

  function totalScore() {
    return Object.values(scores).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0);
  }

  function maxTotalScore() {
    return criteria.reduce((sum, cat) => sum + (cat.items || []).reduce((s, item) => s + item.maxScore, 0), 0);
  }

  async function handleSubmit() {
    const scoreArr = [];
    criteria.forEach((cat, catIdx) => {
      (cat.items || []).forEach((item, itemIdx) => {
        scoreArr.push({
          criteriaIndex: catIdx,
          itemIndex: itemIdx,
          score: parseInt(getScore(catIdx, itemIdx), 10) || 0,
        });
      });
    });

    setLoading(true);
    const res = await api.saveScores({
      judgeId,
      studentId: student?.id,
      admissionId,
      scores: scoreArr,
    });
    setLoading(false);

    if (res.success) {
      setToast({ visible: true, message: 'บันทึกคะแนนสำเร็จ', type: 'success' });
      setTimeout(() => navigation.goBack(), 1200);
    } else {
      setToast({ visible: true, message: res.error || 'เกิดข้อผิดพลาด', type: 'error' });
    }
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <GlobalLoadingModal visible={loading || fetching} />

      {/* Student header */}
      <View className="bg-secondary rounded-2xl px-4 py-4 mb-4 flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-full bg-white/20 justify-center items-center">
          <Ionicons name="person" size={24} color="#fff" />
        </View>
        <View>
          <Text className="text-lg text-text-ondark" style={{ fontFamily: 'Sarabun_700Bold' }}>
            {student?.firstName} {student?.lastName}
          </Text>
          {student?.studentCode && (
            <Text className="text-sm text-text-ondark opacity-80" style={{ fontFamily: 'Sarabun_400Regular' }}>
              รหัส: {student.studentCode}
            </Text>
          )}
        </View>
      </View>

      {/* Criteria scoring */}
      {criteria.map((cat, catIdx) => (
        <View key={catIdx} className="bg-surface rounded-2xl border border-border-light shadow-sm mb-4 overflow-hidden">
          <View className="bg-surface-alt px-4 py-3 border-b border-border-light">
            <Text className="text-base text-text" style={{ fontFamily: 'Sarabun_700Bold' }}>
              {cat.name}
            </Text>
          </View>
          {(cat.items || []).map((item, itemIdx) => {
            const val = getScore(catIdx, itemIdx);
            const numVal = parseInt(val, 10);
            const isOver = !isNaN(numVal) && numVal > item.maxScore;
            return (
              <View key={itemIdx} className="px-4 py-3 border-b border-border-light flex-row justify-between items-center">
                <View className="flex-1 mr-4">
                  <Text className="text-sm text-text" style={{ fontFamily: 'Sarabun_500Medium' }}>
                    {item.name}
                  </Text>
                  <Text className="text-xs text-text-muted" style={{ fontFamily: 'Sarabun_400Regular' }}>
                    คะแนนสูงสุด {item.maxScore}
                  </Text>
                </View>
                <View className="items-end">
                  <View className={`border-2 rounded-xl overflow-hidden ${
                    isOver ? 'border-error' : val !== '' ? 'border-secondary' : 'border-border'
                  }`}>
                    <TextInput
                      className="w-16 px-3 py-2 text-center text-base text-text"
                      style={{ fontFamily: 'Sarabun_700Bold' }}
                      keyboardType="numeric"
                      maxLength={3}
                      value={val}
                      onChangeText={v => handleScoreChange(catIdx, itemIdx, v, item.maxScore)}
                      placeholder="0"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>
                  {isOver && (
                    <Text className="text-xs text-error mt-1" style={{ fontFamily: 'Sarabun_400Regular' }}>
                      เกินคะแนนสูงสุด
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ))}

      {/* Total + Submit */}
      <View className="bg-surface rounded-2xl border border-primary shadow-sm px-4 py-4 mb-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-base text-text" style={{ fontFamily: 'Sarabun_600SemiBold' }}>
            คะแนนรวม
          </Text>
          <Text className="text-2xl text-primary" style={{ fontFamily: 'Sarabun_800ExtraBold' }}>
            {totalScore()} <Text className="text-base text-text-muted">/ {maxTotalScore()}</Text>
          </Text>
        </View>
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        className="bg-secondary rounded-2xl px-6 py-4 flex-row justify-center items-center gap-2 shadow-sm"
        style={{ opacity: loading ? 0.6 : 1 }}
      >
        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
        <Text className="text-base text-text-ondark" style={{ fontFamily: 'Sarabun_600SemiBold' }}>
          {loading ? 'กำลังบันทึก...' : 'บันทึกคะแนน'}
        </Text>
      </Pressable>

      <ToastComponent {...toast} onHide={() => setToast({ ...toast, visible: false })} />
    </ScrollView>
  );
}
