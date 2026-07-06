import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  noPad?: boolean;
}

export default function Card({ children, style, noPad }: CardProps) {
  return (
    <View style={[styles.card, noPad && styles.noPad, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  noPad: {
    padding: 0,
  },
});
