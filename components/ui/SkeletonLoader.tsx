import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width = '100%', height = 16, borderRadius = 6, style }: SkeletonBoxProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.85] });

  return (
    <Animated.View
      style={[{ width: width as any, height, borderRadius, backgroundColor: '#DDD', opacity }, style]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <SkeletonBox width={44} height={44} borderRadius={10} />
        <View style={styles.lines}>
          <SkeletonBox width="70%" height={14} />
          <SkeletonBox width="50%" height={11} style={{ marginTop: 6 }} />
          <SkeletonBox width="40%" height={11} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonKPIRow() {
  return (
    <View style={styles.kpiRow}>
      {[0, 1].map(i => (
        <View key={i} style={styles.kpiCard}>
          <SkeletonBox width={40} height={40} borderRadius={8} style={{ marginBottom: 10 }} />
          <SkeletonBox width="60%" height={22} style={{ marginBottom: 6 }} />
          <SkeletonBox width="80%" height={11} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonDashboard() {
  return (
    <View style={styles.dashWrapper}>
      {/* Banner */}
      <View style={styles.card}>
        <View style={styles.row}>
          <SkeletonBox width={44} height={44} borderRadius={22} />
          <View style={styles.lines}>
            <SkeletonBox width="55%" height={15} />
            <SkeletonBox width="35%" height={11} style={{ marginTop: 6 }} />
          </View>
        </View>
      </View>
      {/* Quick cards */}
      <SkeletonBox width="35%" height={13} style={{ marginBottom: 10 }} />
      <View style={styles.quickRow}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={styles.quickSkeleton}>
            <SkeletonBox width={46} height={46} borderRadius={12} style={{ marginBottom: 10 }} />
            <SkeletonBox width="70%" height={13} style={{ marginBottom: 6 }} />
            <SkeletonBox width="90%" height={10} />
          </View>
        ))}
      </View>
      {/* KPI */}
      <SkeletonBox width="35%" height={13} style={{ marginBottom: 10, marginTop: 6 }} />
      <SkeletonKPIRow />
      <SkeletonKPIRow />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lines: { flex: 1, gap: 4 },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  dashWrapper: { gap: 0 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  quickSkeleton: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    minHeight: 110,
  },
});
