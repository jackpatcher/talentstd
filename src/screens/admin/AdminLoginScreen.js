// =============================================
// AdminLoginScreen - เข้าสู่ระบบแอดมิน
// =============================================
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES, SPACING, commonStyles, BORDER_RADIUS, SHADOWS } from '../../utils/theme';
import { loginAdmin, isLoggedIn } from '../../services/auth';
import ToastComponent from '../../components/ToastComponent';

export default function AdminLoginScreen({ navigation }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    (async () => {
      if (await isLoggedIn()) {
        navigation.replace('Admissions');
      }
    })();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    const res = await loginAdmin(pin);
    setLoading(false);
    if (res.success) {
      navigation.replace('Admissions');
    } else {
      setToast({ visible: true, message: res.error || 'เข้าสู่ระบบไม่สำเร็จ', type: 'error' });
    }
  };

  return (
    <View style={[commonStyles.screen, styles.container]}>
      <View style={styles.badge}>
        <Ionicons name="shield-checkmark" size={28} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>เข้าสู่ระบบแอดมิน</Text>
      <Text style={styles.subtitle}>จัดการระบบและข้อมูลผู้สมัคร</Text>
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
    backgroundColor: COLORS.primaryLight,
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
    backgroundColor: COLORS.primary,
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
