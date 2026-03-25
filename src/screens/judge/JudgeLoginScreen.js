// =============================================
// JudgeLoginScreen - เข้าสู่ระบบกรรมการ
// =============================================
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES, SPACING, commonStyles, BORDER_RADIUS, SHADOWS } from '../../utils/theme';
import { loginJudge } from '../../services/auth';
import ToastComponent from '../../components/ToastComponent';

export default function JudgeLoginScreen({ navigation }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const handleLogin = async () => {
    setLoading(true);
    const res = await loginJudge(pin);
    setLoading(false);
    if (res.success) {
      navigation.replace('JudgeStudents');
    } else {
      setToast({ visible: true, message: res.error || 'เข้าสู่ระบบไม่สำเร็จ', type: 'error' });
    }
  };

  return (
    <View style={[commonStyles.screen, styles.container]}>
      <View style={styles.badge}>
        <Ionicons name="ribbon" size={28} color={COLORS.secondary} />
      </View>
      <Text style={styles.title}>เข้าสู่ระบบกรรมการ</Text>
      <Text style={styles.subtitle}>ประเมินคะแนนและติดตามผลผู้สมัคร</Text>
      <TextInput
        style={styles.input}
        placeholder="PIN 8 หลัก"
        placeholderTextColor={COLORS.textMuted}
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        maxLength={8}
        secureTextEntry
      />
      <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</Text>
      </Pressable>
      <ToastComponent {...toast} onHide={() => setToast({ ...toast, visible: false })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.infoLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...FONTS.bold,
    fontSize: FONT_SIZES.xxl,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  input: {
    ...commonStyles.input,
    width: 260,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.xl,
    minWidth: 200,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...FONTS.semiBold,
    color: COLORS.textOnDark,
    fontSize: FONT_SIZES.md,
  },
});
