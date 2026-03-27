// =============================================
// ToastComponent - แจ้งเตือนแบบไม่รบกวน
// =============================================
import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS, BORDER_RADIUS, FONT_SIZES, FONTS, SPACING } from '../utils/theme';

export default function ToastComponent({ visible, message, type = 'info', duration = 2500, onHide }) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      const timer = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => onHide?.());
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, styles[type], { opacity }]}> 
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.lg,
    right: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    zIndex: 9999,
    alignItems: 'center',
    ...FONTS.medium,
  },
  text: {
    color: COLORS.textOnDark,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
  },
  info: {
    backgroundColor: COLORS.info,
  },
  success: {
    backgroundColor: COLORS.success,
  },
  error: {
    backgroundColor: COLORS.error,
  },
  warning: {
    backgroundColor: COLORS.warning,
  },
});
