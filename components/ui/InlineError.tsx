import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ColorPalette } from '@/constants/Colors';
import { useThemeColors } from '@/context/ThemeContext';

export default function InlineError({ message }: { message?: string }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!message) return null;
  return (
    <View style={styles.row}>
      <Ionicons name="alert-circle-outline" size={13} color={colors.status.missing} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
    text: { fontSize: 12, color: colors.status.missing, flex: 1, lineHeight: 16 },
  });
}
