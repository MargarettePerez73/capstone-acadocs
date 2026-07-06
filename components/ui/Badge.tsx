import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

type BadgeVariant = 'submitted' | 'pending' | 'missing' | 'flagged' | 'clean' | 'checking';

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  submitted: { bg: '#E8F5E9', text: Colors.status.submitted },
  pending:   { bg: '#FFF8E1', text: Colors.status.pending },
  missing:   { bg: '#FFEBEE', text: Colors.status.missing },
  flagged:   { bg: '#F3E5F5', text: Colors.status.flagged },
  clean:     { bg: '#E8F5E9', text: Colors.status.submitted },
  checking:  { bg: '#E3F2FD', text: '#1565C0' },
};

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

export default function Badge({ label, variant }: BadgeProps) {
  const { bg, text } = VARIANT_STYLES[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
