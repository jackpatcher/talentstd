// =============================================
// JudgeLoginScreen - เข้าสู่ระบบกรรมการ
// =============================================
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, commonStyles } from '../../utils/theme';
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
      <Text style={styles.title}>เข้าสู่ระบบกรรมการ</Text>
      <TextInput
        style={styles.input}
        placeholder="PIN 8 หลัก"
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        maxLength={8}
        secureTextEntry
      />
      <Button title={loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'} onPress={handleLogin} disabled={loading} />
      <ToastComponent {...toast} onHide={() => setToast({ ...toast, visible: false })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: {
    ...FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  input: {
    ...commonStyles.input,
    width: 220,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
});
