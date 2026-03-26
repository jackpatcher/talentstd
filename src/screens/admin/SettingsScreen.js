// =============================================
// SettingsScreen - ตั้งค่าระบบ (Config)
// =============================================
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, commonStyles } from '../../utils/theme';
import { api } from '../../services/api';

import GlobalLoadingModal from '../../components/GlobalLoadingModal';


export default function SettingsScreen() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setFetching(true);
    const res = await api.getConfig();
    if (res.success) setConfig(res.config);
    setFetching(false);
  }

  async function saveConfig() {
    setLoading(true);
    await api.setConfig('app_url', config.app_url);
    await api.setConfig('school_name', config.school_name);
    setLoading(false);
    fetchConfig();
  }

  return (
    <View style={commonStyles.screen}>
      <GlobalLoadingModal visible={loading || fetching} />
      <Text style={styles.title}>ตั้งค่าระบบ</Text>
      <TextInput
        style={styles.input}
        value={config.app_url || ''}
        onChangeText={v => setConfig({ ...config, app_url: v })}
        placeholder="API URL"
      />
      <TextInput
        style={styles.input}
        value={config.school_name || ''}
        onChangeText={v => setConfig({ ...config, school_name: v })}
        placeholder="ชื่อโรงเรียน"
      />
      <Button title={loading ? 'กำลังบันทึก...' : 'บันทึก'} onPress={saveConfig} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    margin: SPACING.md,
  },
  input: {
    ...commonStyles.input,
    marginBottom: SPACING.md,
  },
});
