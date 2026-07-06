import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Badge from '@/components/ui/Badge';
import { Submission } from '@/data/mockData';
import { Colors } from '@/constants/Colors';

interface SubmissionCardProps {
  item: Submission;
}

export default function SubmissionCard({ item }: SubmissionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="file-document-outline" size={24} color={Colors.maroon.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.teacherName}</Text>
          <Text style={styles.meta}>{item.subject} — {item.gradeLevel}</Text>
          <Text style={styles.meta}>{item.type} · {item.week}</Text>
        </View>
        <Badge label={item.status} variant={item.status} />
      </View>

      {item.submittedAt && (
        <View style={styles.footer}>
          <Ionicons name="time-outline" size={12} color={Colors.text.muted} />
          <Text style={styles.timestamp}>{item.submittedAt}</Text>
          {item.plagiarismStatus && item.plagiarismStatus !== 'checking' && (
            <View style={styles.plagRow}>
              <MaterialCommunityIcons
                name={item.plagiarismStatus === 'flagged' ? 'alert-circle-outline' : 'shield-check-outline'}
                size={12}
                color={item.plagiarismStatus === 'flagged' ? Colors.status.flagged : Colors.status.submitted}
              />
              <Text style={[styles.plagText, { color: item.plagiarismStatus === 'flagged' ? Colors.status.flagged : Colors.status.submitted }]}>
                {item.plagiarismScore}% similarity
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 40,
    height: 40,
    backgroundColor: Colors.maroon.muted,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  meta: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.text.muted,
    flex: 1,
    marginLeft: 2,
  },
  plagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  plagText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
