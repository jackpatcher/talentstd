// =============================================
// OtpPinInput - ช่องกรอก PIN แบบ OTP
// =============================================
import React, { useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';

const PIN_LENGTH = 8;

export default function OtpPinInput({ value = '', onChange, onComplete, accentColor = COLORS.primary }) {
  const inputRef = useRef(null);

  const handleChange = (text) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH);
    onChange(digits);
    if (digits.length === PIN_LENGTH) {
      onComplete(digits);
    }
  };

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.wrapper}>
      {/* Hidden real input */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="numeric"
        maxLength={PIN_LENGTH}
        style={styles.hiddenInput}
        caretHidden
        autoCorrect={false}
        autoComplete="off"
        importantForAutofill="no"
      />

      {/* Visual OTP boxes */}
      <View style={styles.row}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => {
          const isFilled = i < value.length;
          const isActive = i === value.length && value.length < PIN_LENGTH;
          return (
            <View
              key={i}
              style={[
                styles.box,
                isFilled && { borderColor: accentColor, backgroundColor: `${accentColor}10` },
                isActive && { borderColor: accentColor, borderWidth: 2.5 },
                !isFilled && !isActive && styles.boxEmpty,
              ]}
            >
              {isFilled ? (
                <View style={[styles.dot, { backgroundColor: accentColor }]} />
              ) : (
                <View style={styles.dotEmpty} />
              )}
            </View>
          );
        })}
      </View>

      <Text style={styles.hint}>กรอก PIN {PIN_LENGTH} หลัก</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  box: {
    width: 44,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  boxEmpty: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotEmpty: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  hint: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.textMuted,
    fontFamily: 'Sarabun_400Regular',
  },
});
