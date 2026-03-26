import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES } from '../utils/theme';

export default function DrawerIconLabel({ icon, label, focused }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={28} color={focused ? COLORS.drawerTextActive : COLORS.drawerText} />
      <Text style={[styles.label, { color: focused ? COLORS.drawerTextActive : COLORS.drawerText }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    marginTop: 4,
  },
});
