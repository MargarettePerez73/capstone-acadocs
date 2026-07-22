import React, { ReactNode, useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ColorPalette } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  noPad?: boolean;
}

export default function Card({ children, style, noPad }: CardProps) {
  const { colors, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, colorScheme === 'dark'), [colors, colorScheme]);

  return (
    <View style={[styles.card, noPad && styles.noPad, style]}>
      {children}
    </View>
  );
}

function createStyles(colors: ColorPalette, isDark: boolean) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    noPad: {
      padding: 0,
    },
  });
}
