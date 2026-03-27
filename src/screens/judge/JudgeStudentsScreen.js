// =============================================
// JudgeStudentsScreen - ดูรายชื่อนักเรียนที่ต้องประเมิน
// =============================================
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { api } from '../../services/api';
import { getSession } from '../../services/auth';
import GlobalLoadingModal from '../../components/GlobalLoadingModal';

export default function JudgeStudentsScreen({ navigation }) {
  const [students, setStudents] = useState([]);
  const [judgeInfo, setJudgeInfo] = useState(null);
  const [admissions, setAdmissions] = useState([]);
  const [selAdmission, setSelAdmission] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      setJudgeInfo(session?.judge || null);
      const resAdm = await api.getAdmissions();
      if (resAdm.success && resAdm.admissions?.length > 0) {
        setAdmissions(resAdm.admissions);
        const first = resAdm.admissions[0];
        setSelAdmission(first);
        fetchStudents(first.id);
      }
    })();
  }, []);

  async function fetchStudents(admId) {
    setLoading(true);
    const res = await api.getStudents(admId);
    if (res.success) setStudents(res.students || []);
    setLoading(false);
  }

  function handleSelectAdmission(adm) {
    setSelAdmission(adm);
    fetchStudents(adm.id);
  }

  return (
    <View className="flex-1 bg-background">
      <GlobalLoadingModal visible={loading} />

      {/* Judge info banner */}
      {judgeInfo && (
        <View className="bg-secondary px-4 py-3 flex-row items-center gap-3">
          <View className="w-9 h-9 rounded-full bg-white/20 justify-center items-center">
            <Ionicons name="person" size={18} color="#fff" />
          </View>
          <View>
            <Text className="text-sm text-text-ondark" style={{ fontFamily: 'Sarabun_600SemiBold' }}>
              {judgeInfo.firstName} {judgeInfo.lastName}
            </Text>
            <Text className="text-xs text-text-ondark opacity-80" style={{ fontFamily: 'Sarabun_400Regular' }}>
              {judgeInfo.position}
            </Text>
          </View>
        </View>
      )}

      {/* Admission selector */}
      {admissions.length > 1 && (
        <View className="bg-surface px-4 py-2 border-b border-border-light">
          <Text className="text-xs text-text-muted mb-2" style={{ fontFamily: 'Sarabun_400Regular' }}>
            เลือกรอบรับนักเรียน
          </Text>
          <View className="flex-row gap-2 flex-wrap">
            {admissions.map(adm => (
              <Pressable
                key={adm.id}
                onPress={() => handleSelectAdmission(adm)}
                className={`px-3 py-1 rounded-full border ${
                  selAdmission?.id === adm.id
                    ? 'bg-secondary border-secondary'
                    : 'bg-surface border-border'
                }`}
              >
                <Text
                  className={`text-sm ${selAdmission?.id === adm.id ? 'text-text-ondark' : 'text-text-secondary'}`}
                  style={{ fontFamily: 'Sarabun_500Medium' }}
                >
                  {adm.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <FlatList
        data={students}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListHeaderComponent={
          <Text className="text-lg text-text mb-2" style={{ fontFamily: 'Sarabun_700Bold' }}>
            นักเรียนที่ต้องประเมิน ({students.length} คน)
          </Text>
        }
        ListEmptyComponent={
          !loading && (
            <View className="items-center py-16">
              <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
              <Text className="text-text-muted mt-3" style={{ fontFamily: 'Sarabun_400Regular' }}>
                ยังไม่มีรายชื่อนักเรียน
              </Text>
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => navigation.navigate('JudgeScore', {
              student: item,
              admissionId: selAdmission?.id
            })}
            className="bg-surface rounded-2xl px-4 py-3 flex-row justify-between items-center border border-border-light shadow-sm"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-9 h-9 rounded-xl bg-secondary justify-center items-center mr-3">
                <Text className="text-text-ondark text-sm" style={{ fontFamily: 'Sarabun_700Bold' }}>
                  {index + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base text-text" style={{ fontFamily: 'Sarabun_600SemiBold' }}>
                  {item.firstName} {item.lastName}
                </Text>
                {item.studentCode && (
                  <Text className="text-sm text-text-muted" style={{ fontFamily: 'Sarabun_400Regular' }}>
                    {item.studentCode}
                  </Text>
                )}
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              {item.scored && (
                <View className="px-2 py-1 rounded-full bg-success-light">
                  <Text className="text-xs text-success" style={{ fontFamily: 'Sarabun_500Medium' }}>
                    ให้คะแนนแล้ว
                  </Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
