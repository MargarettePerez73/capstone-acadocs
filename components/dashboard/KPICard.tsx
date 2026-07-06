import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function KPICard({ label, value, unit, icon, color = Colors.maroon.primary, trend }: KPICardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.value}>
        {value}{unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </Text>
      <Text style={styles.label}>{label}</Text>
      {trend && trend !== 'neutral' && (
        <View style={styles.trendRow}>
          <Ionicons
            name={trend === 'up' ? 'trending-up' : 'trending-down'}
            size={12}
            color={trend === 'up' ? Colors.status.submitted : Colors.status.missing}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 14,
    margin: 4,
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    minWidth: 140,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
    lineHeight: 28,
  },
  unit: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  label: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  },
  trendRow: {
    marginTop: 6,
  },
});
