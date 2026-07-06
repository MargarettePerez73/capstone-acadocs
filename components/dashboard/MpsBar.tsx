import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface MpsBarProps {
  subject: string;
  gradeLevel: string;
  mps: number;
}

export default function MpsBar({ subject, gradeLevel, mps }: MpsBarProps) {
  const color = mps >= 75 ? Colors.status.submitted : mps >= 60 ? Colors.status.pending : Colors.status.missing;

  return (
    <View style={styles.row}>
      <View style={styles.labels}>
        <Text style={styles.subject} numberOfLines={1}>{subject}</Text>
        <Text style={styles.grade}>{gradeLevel}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${mps}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.mpsText, { color }]}>{mps.toFixed(1)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  labels: {
    width: 120,
  },
  subject: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  grade: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  mpsText: {
    fontSize: 13,
    fontWeight: '700',
    width: 46,
    textAlign: 'right',
  },
});
