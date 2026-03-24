// =============================================
// GlobalLoadingModal - Modal Loading บล็อกหน้าจอ
// =============================================
import React from 'react';
import { Modal, View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, FONTS, FONT_SIZES } from '../utils/theme';

export default function GlobalLoadingModal({ visible, message = 'กำลังโหลดข้อมูล...', ...props }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
      {...props}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: 220,
  },
  text: {
    marginTop: SPACING.md,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
});
