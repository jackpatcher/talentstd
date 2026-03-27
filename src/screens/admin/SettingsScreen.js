// =============================================
// SettingsScreen - ตั้งค่าระบบ
// =============================================
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { COLORS } from '../../utils/theme';
import { api } from '../../services/api';
import GlobalLoadingModal from '../../components/GlobalLoadingModal';
import ToastComponent from '../../components/ToastComponent';

const FIELDS = [
  { key: 'app_url',     label: 'URL ของแอปสำหรับกรรมการ', placeholder: 'https://your-app-url.com/judge/login', icon: 'link-outline' },
  { key: 'school_name', label: 'ชื่อโรงเรียน / หน่วยงาน',  placeholder: 'เช่น โรงเรียนตัวอย่าง',              icon: 'business-outline' },
  { key: 'admin_pin',   label: 'รหัสแอดมิน (8 หลัก)',      placeholder: '--------',                           icon: 'lock-closed-outline', secure: true, maxLen: 8, keyboardType: 'numeric' },
];

export default function SettingsScreen() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [showPin, setShowPin] = useState(false);

  useEffect(() => { fetchConfig(); }, []);

  async function fetchConfig() {
    setLoading(true);
    const res = await api.getConfig();
    if (res.success) setConfig(res.config || {});
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    for (const f of FIELDS) {
      if (config[f.key] !== undefined) {
        await api.setConfig(f.key, config[f.key]);
      }
    }
    setSaving(false);
    setToast({ visible: true, message: 'บันทึกการตั้งค่าสำเร็จ', type: 'success' });
  }

  return (
    <ScrollView style={S.root} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <GlobalLoadingModal visible={loading} />

      {/* Settings card */}
      <View style={S.card}>
        <View style={S.cardHeader}>
          <Ionicons name="settings-outline" size={16} color={COLORS.primary} />
          <Text style={[S.cardHeaderText, { fontFamily: 'Sarabun_700Bold' }]}>การตั้งค่าทั่วไป</Text>
        </View>

        {FIELDS.map((f, idx) => (
          <View
            key={f.key}
            style={[S.fieldRow, idx < FIELDS.length - 1 && S.fieldRowBorder]}
          >
            <View style={S.fieldLabelRow}>
              <Ionicons name={f.icon} size={15} color={COLORS.primary} />
              <Text style={[S.fieldLabel, { fontFamily: 'Sarabun_500Medium' }]}>{f.label}</Text>
            </View>
            <View style={S.inputWrap}>
              <TextInput
                style={[S.input, { fontFamily: 'Sarabun_400Regular' }]}
                placeholder={f.placeholder}
                value={String(config[f.key] || '')}
                onChangeText={v => setConfig({ ...config, [f.key]: v })}
                secureTextEntry={f.secure && !showPin}
                keyboardType={f.keyboardType || 'default'}
                maxLength={f.maxLen}
              />
              {f.secure && (
                <Pressable onPress={() => setShowPin(!showPin)} style={S.eyeBtn}>
                  <Ionicons
                    name={showPin ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={COLORS.textMuted}
                  />
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* QR Code section */}
      <View style={S.card}>
        <View style={S.cardHeader}>
          <Ionicons name="qr-code-outline" size={16} color={COLORS.secondary} />
          <Text style={[S.cardHeaderText, { fontFamily: 'Sarabun_700Bold' }]}>QR Code สำหรับกรรมการ</Text>
        </View>
        <View style={S.qrSection}>
          {config.app_url ? (
            <View style={S.qrBox}>
              <QRCode
                value={String(config.app_url)}
                size={160}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            </View>
          ) : (
            <View style={S.qrPlaceholder}>
              <Ionicons name="qr-code-outline" size={52} color={COLORS.textMuted} />
            </View>
          )}
          <Text style={[S.qrHint, { fontFamily: 'Sarabun_400Regular' }]}>
            {config.app_url
              ? 'กรรมการสแกน QR Code เพื่อเข้าระบบ'
              : 'QR Code จะแสดงเมื่อตั้ง URL แล้ว'}
          </Text>
          {config.app_url ? (
            <Text style={[S.qrUrl, { fontFamily: 'Sarabun_400Regular' }]} numberOfLines={2}>
              {config.app_url}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Save button */}
      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={[S.saveBtn, { opacity: saving ? 0.6 : 1 }]}
      >
        <Ionicons name="save-outline" size={20} color="#fff" />
        <Text style={[S.saveBtnText, { fontFamily: 'Sarabun_600SemiBold' }]}>
          {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </Text>
      </Pressable>

      <ToastComponent {...toast} onHide={() => setToast({ ...toast, visible: false })} />
    </ScrollView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 8,
  },
  cardHeaderText: { fontSize: 15, color: COLORS.text },
  fieldRow: { paddingHorizontal: 16, paddingVertical: 14 },
  fieldRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  fieldLabel: { fontSize: 14, color: COLORS.textSecondary },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: COLORS.text,
  },
  eyeBtn: { paddingHorizontal: 12 },
  qrSection: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
  qrBox: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  qrHint: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  qrUrl: { fontSize: 12, color: COLORS.primary, marginTop: 6, textAlign: 'center' },
  saveBtn: {
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
  saveBtnText: { color: '#fff', fontSize: 15 },
});
