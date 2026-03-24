// =============================================
// ModalComponent - แสดง Popup หรือ Form
// =============================================
import React from 'react';
import { Modal, View, StyleSheet, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../utils/theme';

export default function ModalComponent({ visible, onClose, children, transparent = true, ...props }) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={transparent}
      onRequestClose={onClose}
      {...props}
    >
      <TouchableWithoutFeedback onPress={onClose} accessible={false}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalBox}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    minWidth: 320,
    maxWidth: 480,
    width: '100%',
    ...SHADOWS.medium,
    ...Platform.select({ web: { outline: 'none' } }),
  },
});
