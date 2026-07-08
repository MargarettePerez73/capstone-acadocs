import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { useAuth } from '@/context/AuthContext';
import { useDrawer } from '@/context/DrawerContext';
import { useToast } from '@/context/ToastContext';
import { Colors } from '@/constants/Colors';

type ReportType = 'submission' | 'mps' | 'learning-area' | 'parent-meeting';
type ExportFormat = 'PDF' | 'Excel' | 'Print';

interface ReportTemplate {
  id: ReportType;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  formats: ExportFormat[];
  estimatedPages: number;
}

const TEMPLATES: ReportTemplate[] = [
  {
    id: 'submission',
    title: 'Submission Compliance Report',
    description: 'Summary of Daily Lesson Logs (DLL), Lesson Plans, and academic document submission rates by teacher, subject, and year level.',
    icon: 'document-text-outline',
    formats: ['PDF', 'Excel', 'Print'],
    estimatedPages: 4,
  },
  {
    id: 'mps',
    title: 'MPS Performance Report',
    description: 'Mean Percentage Scores by quarter, learning area, and year level with DepEd performance level indicators.',
    icon: 'bar-chart-outline',
    formats: ['PDF', 'Excel'],
    estimatedPages: 6,
  },
  {
    id: 'learning-area',
    title: 'Learning Area Analysis',
    description: 'Comparative analysis of academic performance across all learning areas and grade levels for the selected period.',
    icon: 'stats-chart-outline',
    formats: ['PDF', 'Print'],
    estimatedPages: 8,
  },
  {
    id: 'parent-meeting',
    title: 'Parent-Teacher Conference Attendance',
    description: 'Parent-Teacher Meeting (PTM) attendance records and participation rates per grade level and section.',
    icon: 'people-outline',
    formats: ['PDF', 'Excel', 'Print'],
    estimatedPages: 3,
  },
];

const FORMAT_ICONS: Record<ExportFormat, keyof typeof MaterialCommunityIcons.glyphMap> = {
  PDF: 'file-pdf-box',
  Excel: 'microsoft-excel',
  Print: 'printer-outline',
};

const FORMAT_COLORS: Record<ExportFormat, string> = {
  PDF: '#C62828',
  Excel: '#2E7D32',
  Print: '#1565C0',
};

export default function ReportsScreen() {
  const { user } = useAuth();
  const { toggleDrawer } = useDrawer();
  const toast = useToast();

  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [filterQuarter, setFilterQuarter] = useState('Q1');
  const [filterGrade, setFilterGrade] = useState('All');
  const [generatingFormat, setGeneratingFormat] = useState<ExportFormat | null>(null);
  const [generateProgress, setGenerateProgress] = useState(0);

  const isAdmin = user?.role === 'principal' || user?.role === 'adas';
  const selectedTemplate = TEMPLATES.find(t => t.id === selectedReport);

  const handleGenerate = (format: ExportFormat) => {
    if (!isAdmin) {
      toast.error('Access restricted', 'Report generation is available to administrators only.');
      return;
    }
    setGeneratingFormat(format);
    setGenerateProgress(0);
    toast.info('Generating report...', `Preparing ${format} export for ${filterQuarter}${filterGrade !== 'All' ? ` · ${filterGrade}` : ''}.`);

    const steps = [20, 50, 75, 95, 100];
    steps.forEach((pct, i) => {
      setTimeout(() => {
        setGenerateProgress(pct);
        if (pct === 100) {
          setTimeout(() => {
            setGeneratingFormat(null);
            setGenerateProgress(0);
            toast.success('Report ready', `${selectedTemplate?.title} exported as ${format} successfully.`);
          }, 400);
        }
      }, i * 450);
    });
  };

  return (
    <View style={styles.flex}>
      <Header
        title="Reports"
        subtitle="Generate & Export Academic Reports"
        showMenu
        onMenuPress={toggleDrawer}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Access Notice for non-admins */}
        {!isAdmin && (
          <View style={styles.accessNotice}>
            <Ionicons name="information-circle-outline" size={18} color="#1565C0" />
            <Text style={styles.accessNoticeText}>
              Report generation is restricted to the Principal and ADAS. You may view report templates below.
            </Text>
          </View>
        )}

        {/* Filters */}
        <Text style={styles.sectionLabel}>Filter Options</Text>
        <Card>
          <Text style={styles.filterLabel}>Academic Quarter</Text>
          <View style={styles.filterRow}>
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
              <TouchableOpacity
                key={q}
                style={[styles.chip, filterQuarter === q && styles.chipActive]}
                onPress={() => setFilterQuarter(q)}
              >
                <Text style={[styles.chipText, filterQuarter === q && styles.chipTextActive]}>Quarter {q}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.filterLabel, { marginTop: 14 }]}>Year Level</Text>
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

          <View style={styles.filterSummary}>
            <Ionicons name="filter-outline" size={13} color={Colors.maroon.primary} />
            <Text style={styles.filterSummaryText}>
              Filtered: {filterQuarter}{filterGrade !== 'All' ? ` · ${filterGrade}` : ' · All Grade Levels'}
            </Text>
          </View>
        </Card>

        {/* Report Templates */}
        <Text style={styles.sectionLabel}>Available Reports</Text>
        {TEMPLATES.map(t => {
          const isSelected = selectedReport === t.id;
          const isGenerating = generatingFormat !== null && isSelected;

          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setSelectedReport(prev => prev === t.id ? null : t.id)}
              activeOpacity={0.8}
            >
              <Card style={[styles.templateCard, isSelected && styles.templateSelected]}>
                {/* Template Row */}
                <View style={styles.templateRow}>
                  <View style={[styles.templateIcon, isSelected && styles.templateIconActive]}>
                    <Ionicons name={t.icon} size={22} color={isSelected ? Colors.white : Colors.maroon.primary} />
                  </View>
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateTitle}>{t.title}</Text>
                    <Text style={styles.templateDesc} numberOfLines={isSelected ? undefined : 2}>{t.description}</Text>
                  </View>
                  <Ionicons
                    name={isSelected ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={isSelected ? Colors.maroon.primary : Colors.text.muted}
                  />
                </View>

                {/* Expanded Actions */}
                {isSelected && (
                  <View style={styles.actionArea}>
                    <View style={styles.templateMeta}>
                      <Ionicons name="document-outline" size={13} color={Colors.text.muted} />
                      <Text style={styles.templateMetaText}>~{t.estimatedPages} pages · {filterQuarter}{filterGrade !== 'All' ? ` · ${filterGrade}` : ''}</Text>
                    </View>

                    {isGenerating ? (
                      <View style={styles.generatingArea}>
                        <Text style={styles.generatingLabel}>
                          Generating {generatingFormat} report...
                        </Text>
                        <ProgressBar progress={generateProgress} label="Export progress" />
                        <Text style={styles.generatingHint}>Please wait while the report is being prepared.</Text>
                      </View>
                    ) : (
                      <>
                        <Text style={styles.actionLabel}>Choose export format:</Text>
                        <View style={styles.actionRow}>
                          {t.formats.map(f => (
                            <TouchableOpacity
                              key={f}
                              style={[styles.formatBtn, { borderColor: FORMAT_COLORS[f] + '44' }]}
                              onPress={() => handleGenerate(f)}
                              disabled={!!generatingFormat}
                              activeOpacity={0.8}
                            >
                              <MaterialCommunityIcons name={FORMAT_ICONS[f]} size={20} color={FORMAT_COLORS[f]} />
                              <Text style={[styles.formatText, { color: FORMAT_COLORS[f] }]}>{f}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </>
                    )}
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },

  accessNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#1565C0',
  },
  accessNoticeText: { flex: 1, fontSize: 13, color: '#0D47A1', lineHeight: 18 },

  sectionLabel: { fontSize: 13, fontWeight: '800', color: Colors.text.primary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 },

  filterLabel: { fontSize: 12, fontWeight: '700', color: Colors.text.secondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.maroon.primary, borderColor: Colors.maroon.primary },
  chipGrade: { backgroundColor: '#E3F2FD', borderColor: '#1565C0' },
  chipText: { fontSize: 12, color: Colors.text.secondary, fontWeight: '600' },
  chipTextActive: { color: Colors.white },
  chipTextGrade: { color: '#1565C0' },
  filterSummary: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  filterSummaryText: { fontSize: 12, color: Colors.maroon.primary, fontWeight: '600' },

  templateCard: { marginBottom: 10 },
  templateSelected: { borderWidth: 1.5, borderColor: Colors.maroon.primary },
  templateRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  templateIcon: { width: 44, height: 44, backgroundColor: Colors.maroon.muted, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  templateIconActive: { backgroundColor: Colors.maroon.primary },
  templateInfo: { flex: 1 },
  templateTitle: { fontSize: 14, fontWeight: '700', color: Colors.text.primary, marginBottom: 4 },
  templateDesc: { fontSize: 12, color: Colors.text.secondary, lineHeight: 17 },

  actionArea: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  templateMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
  templateMetaText: { fontSize: 12, color: Colors.text.muted },

  actionLabel: { fontSize: 12, fontWeight: '700', color: Colors.text.secondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 },
  actionRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  formatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 10, paddingHorizontal: 18, paddingVertical: 11,
    borderWidth: 1.5, backgroundColor: Colors.white,
    elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
  },
  formatText: { fontSize: 13, fontWeight: '700' },

  generatingArea: { gap: 10 },
  generatingLabel: { fontSize: 13, fontWeight: '600', color: Colors.maroon.primary },
  generatingHint: { fontSize: 11, color: Colors.text.muted, textAlign: 'center' },
});
