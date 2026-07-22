import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ColorPalette } from '@/constants/Colors';
import { useThemeColors } from '@/context/ThemeContext';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction, style }: EmptyStateProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={44} color={colors.maroon.primary} style={{ opacity: 0.3 }} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.action} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 56,
      paddingHorizontal: 32,
      gap: 10,
    },
    iconWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.maroon.muted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 13,
      color: colors.text.muted,
      textAlign: 'center',
      lineHeight: 18,
      marginTop: 2,
    },
    action: {
      marginTop: 8,
      backgroundColor: colors.maroon.primary,
      borderRadius: 8,
      paddingHorizontal: 22,
      paddingVertical: 11,
    },
    actionText: {
      color: colors.white,
      fontSize: 13,
      fontWeight: '700',
    },
  });
}
