import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ProgressBarProps {
  progress: number; // 0–100
  label?: string;
  color?: string;
  showPercent?: boolean;
  indeterminate?: boolean;
}

export default function ProgressBar({
  progress,
  label,
  color = Colors.maroon.primary,
  showPercent = true,
  indeterminate = false,
}: ProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    if (!indeterminate) {
      Animated.spring(widthAnim, {
        toValue: Math.min(Math.max(progress, 0), 100),
        useNativeDriver: false,
        tension: 60,
        friction: 10,
      }).start();
    }
  }, [progress, indeterminate]);

  useEffect(() => {
    if (indeterminate) {
      Animated.loop(
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1200, useNativeDriver: true })
      ).start();
    }
  }, [indeterminate]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-100%', '200%'],
  });

  return (
    <View style={styles.wrapper}>
      {(label || showPercent) && (
        <View style={styles.labelRow}>
          {label ? <Text style={styles.label}>{label}</Text> : null}
          {showPercent && !indeterminate ? (
            <Text style={[styles.percent, { color }]}>{Math.round(progress)}%</Text>
          ) : null}
        </View>
      )}
      <View style={styles.track}>
        {indeterminate ? (
          <View style={[styles.fill, { width: '40%', backgroundColor: color }]}>
            <Animated.View
              style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate as any }] }]}
            />
          </View>
        ) : (
          <Animated.View style={[styles.fill, { width: widthInterpolated, backgroundColor: color }]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 12, fontWeight: '600', color: Colors.text.secondary },
  percent: { fontSize: 12, fontWeight: '700' },
  track: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '60%',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});
