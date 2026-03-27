// =============================================
// JudgeLoginScreen - เข้าสู่ระบบกรรมการ
// =============================================
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { loginJudge, isLoggedIn } from '../../services/auth';
import ToastComponent from '../../components/ToastComponent';
import OtpPinInput from '../../components/OtpPinInput';

export default function JudgeLoginScreen({ navigation }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    (async () => {
      if (await isLoggedIn()) navigation.replace('JudgeStudents');
    })();
  }, []);

  const handleLogin = async (pinValue = pin) => {
    if (pinValue.length < 8) return;
    setLoading(true);
    const res = await loginJudge(pinValue);
    setLoading(false);
    if (res.success) {
      navigation.replace('JudgeStudents');
    } else {
      setPin('');
      setToast({ visible: true, message: res.error || 'เข้าสู่ระบบไม่สำเร็จ', type: 'error' });
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Card */}
      <View style={styles.card}>
        {/* Colored header band */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="ribbon" size={32} color={COLORS.secondary} />
          </View>
          <Text style={styles.title}>เข้าสู่ระบบกรรมการ</Text>
          <Text style={styles.subtitle}>บันทึกคะแนนและติดตามผู้สมัคร</Text>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.label}>กรอก PIN ของท่าน PIN กรอก PIN ของท่าน</Text>

          <OtpPinInput
            value={pin}
            onChange={setPin}
            onComplete={handleLogin}
            accentColor={COLORS.secondary}
          />

          <Pressable
            onPress={() => handleLogin()}
            disabled={loading || pin.length < 8}
            style={[styles.button, { backgroundColor: COLORS.secondary, opacity: loading || pin.length < 8 ? 0.45 : 1 }]}
          >
            {loading ? (
              <Text style={styles.buttonText}>กำลังเข้าสู่ระบบ......</Text>
            ) : (
              <>
                <Ionicons name="log-in-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
              </>
            )}
          </Pressable>

          <View style={styles.hint}>
            <Ionicons name="information-circle-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.hintText}>สแกน QR Code จากหน้า Settings รับรหัส PIN QR Code สแกน QR Code จากหน้า Settings รับรหัส PIN PIN</Text>
          </View>
        </View>
      </View>

      <ToastComponent {...toast} onHide={() => setToast({ ...toast, visible: false })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  header: {
    backgroundColor: '#0D9488',
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF22',
    borderWidth: 2,
    borderColor: '#FFFFFF55',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Sarabun_700Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Sarabun_400Regular',
    color: '#FFFFFFCC',
  },
  body: {
    padding: 28,
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontFamily: 'Sarabun_600SemiBold',
    color: COLORS.textSecondary,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Sarabun_600SemiBold',
    color: '#FFFFFF',
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 16,
  },
  hintText: {
    fontSize: 12,
    fontFamily: 'Sarabun_400Regular',
    color: COLORS.textMuted,
    marginLeft: 4,
  },
});
