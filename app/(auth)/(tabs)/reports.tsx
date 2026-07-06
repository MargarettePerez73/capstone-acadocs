import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useDrawer } from '@/context/DrawerContext';
import { Colors } from '@/constants/Colors';

type ReportType = 'submission' | 'mps' | 'learning-area' | 'parent-meeting';

interface ReportTemplate {
  id: ReportType;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  formats: ('PDF' | 'Excel' | 'Print')[];
}

const TEMPLATES: ReportTemplate[] = [
  {
    id: 'submission',
    title: 'Submission Compliance Report',
    description: 'Summary of DLL, Lesson Plans, and academic document submission rates by teacher and subject.',
    icon: 'document-text-outline',
    formats: ['PDF', 'Excel', 'Print'],
  },
  {
    id: 'mps',
    title: 'MPS Performance Report',
    description: 'Mean Percentage Scores by quarter, learning area, and year level with performance indicators.',
    icon: 'bar-chart-outline',
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'learning-area',
    title: 'Learning Area Analysis',
    description: 'Comparative analysis of academic performance across all learning areas and grade levels.',
    icon: 'stats-chart-outline',
    formats: ['PDF', 'Print'],
  },
  {
    id: 'parent-meeting',
    title: 'Parent Meeting Attendance',
    description: 'Parent-Teacher conference attendance records and participation rates per grade level.',
    icon: 'people-outline',
    formats: ['PDF', 'Excel', 'Print'],
  },
];

export default function ReportsScreen() {
  const { user } = useAuth();
  const { toggleDrawer } = useDrawer();
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [filterQuarter, setFilterQuarter] = useState('Q1');
  const [filterGrade, setFilterGrade] = useState('All');
  const [generating, setGenerating] = useState(false);

  const isAdmin = user?.role === 'principal' || user?.role === 'adas';

  const handleGenerate = (format: string) => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      Alert.alert('Report Ready', `Your ${format} report has been generated. In production, this would open the file or share dialog.`);
    }, 2000);
  };

  const template = TEMPLATES.find(t => t.id === selectedReport);

  return (
    <View style={styles.flex}>
      <Header title="Reports" subtitle="Generate & Export" showMenu onMenuPress={toggleDrawer} />
      <ScrollView contentContainerStyle={styles.content}>
        {!isAdmin && (
          <Card style={styles.restrictCard}>
            <View style={styles.restrictRow}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.status.pending} />
              <Text style={styles.restrictText}>Report generation is available to administrators only.</Text>
            </View>
          </Card>
        )}

        {/* Quarter & Grade Filters */}
        <Text style={styles.sectionLabel}>Filter Options</Text>
        <Card>
          <Text style={styles.filterLabel}>Quarter</Text>
          <View style={styles.filterRow}>
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
              <TouchableOpacity
                key={q}
                style={[styles.chip, filterQuarter === q && styles.chipActive]}
                onPress={() => setFilterQuarter(q)}
              >
                <Text style={[styles.chipText, filterQuarter === q && styles.chipTextActive]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.filterLabel, { marginTop: 12 }]}>Grade Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {['All', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, filterGrade === g && styles.chipGrade]}
                  onPress={() => setFilterGrade(g)}
                >
                  <Text style={[styles.chipText, filterGrade === g && styles.chipTextGrade]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Card>

        {/* Report Templates */}
        <Text style={styles.sectionLabel}>Report Templates</Text>
        {TEMPLATES.map(t => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setSelectedReport(prev => prev === t.id ? null : t.id)}
            activeOpacity={0.8}
          >
            <Card style={[styles.templateCard, selectedReport === t.id && styles.templateSelected]}>
              <View style={styles.templateRow}>
                <View style={[styles.templateIcon, selectedReport === t.id && styles.templateIconActive]}>
                  <Ionicons name={t.icon} size={22} color={selectedReport === t.id ? Colors.white : Colors.maroon.primary} />
                </View>
                <View style={styles.templateInfo}>
                  <Text style={styles.templateTitle}>{t.title}</Text>
                  <Text style={styles.templateDesc} numberOfLines={2}>{t.description}</Text>
                </View>
                <Ionicons
                  name={selectedReport === t.id ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={Colors.text.muted}
                />
              </View>

              {selectedReport === t.id && (
                <View style={styles.actionArea}>
                  <Text style={styles.actionLabel}>Export Format</Text>
                  <View style={styles.actionRow}>
                    {t.formats.map(f => (
                      <TouchableOpacity
                        key={f}
                        style={styles.formatBtn}
                        onPress={() => isAdmin ? handleGenerate(f) : Alert.alert('Restricted', 'Admin access required.')}
                        disabled={generating}
                      >
                        <MaterialCommunityIcons
                          name={f === 'PDF' ? 'file-pdf-box' : f === 'Excel' ? 'microsoft-excel' : 'printer-outline'}
                          size={18}
                          color={Colors.maroon.primary}
                        />
                        <Text style={styles.formatText}>{f}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {generating && <Text style={styles.generatingText}>Generating report...</Text>}
                </View>
              )}
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  restrictCard: { backgroundColor: '#FFF8E1', borderLeftWidth: 3, borderLeftColor: Colors.status.pending, marginBottom: 16 },
  restrictRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  restrictText: { flex: 1, fontSize: 13, color: Colors.text.primary, lineHeight: 18 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.text.primary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterLabel: { fontSize: 12, fontWeight: '600', color: Colors.text.secondary, marginBottom: 8 },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.maroon.primary, borderColor: Colors.maroon.primary },
  chipGrade: { backgroundColor: '#E3F2FD', borderColor: '#1565C0' },
  chipText: { fontSize: 12, color: Colors.text.secondary, fontWeight: '600' },
  chipTextActive: { color: Colors.white },
  chipTextGrade: { color: '#1565C0' },
  templateCard: { marginBottom: 10 },
  templateSelected: { borderWidth: 1.5, borderColor: Colors.maroon.primary },
  templateRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  templateIcon: { width: 44, height: 44, backgroundColor: Colors.maroon.muted, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  templateIconActive: { backgroundColor: Colors.maroon.primary },
  templateInfo: { flex: 1 },
  templateTitle: { fontSize: 14, fontWeight: '700', color: Colors.text.primary, marginBottom: 3 },
  templateDesc: { fontSize: 12, color: Colors.text.secondary, lineHeight: 17 },
  actionArea: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  actionLabel: { fontSize: 12, fontWeight: '600', color: Colors.text.secondary, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 10 },
  formatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.maroon.surface, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: Colors.maroon.light,
  },
  formatText: { fontSize: 13, fontWeight: '600', color: Colors.maroon.primary },
  generatingText: { fontSize: 12, color: Colors.text.muted, marginTop: 10, textAlign: 'center' },
});
