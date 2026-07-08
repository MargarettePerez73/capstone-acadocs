import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function InlineError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <View style={styles.row}>
      <Ionicons name="alert-circle-outline" size={13} color={Colors.status.missing} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  text: { fontSize: 12, color: Colors.status.missing, flex: 1, lineHeight: 16 },
});
