import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal,
  TextInput, Alert, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useDrawer } from '@/context/DrawerContext';
import { Colors } from '@/constants/Colors';
import { MPS_RECORDS, MpsRecord } from '@/data/mockData';

export default function MpsScreen() {
  const { user } = useAuth();
  const { toggleDrawer } = useDrawer();
  const [records, setRecords] = useState<MpsRecord[]>(MPS_RECORDS);
  const [showModal, setShowModal] = useState(false);
  const [filterQuarter, setFilterQuarter] = useState('Q1');
  const [filterGrade, setFilterGrade] = useState('All');
  const [form, setForm] = useState({ subject: '', gradeLevel: '', totalItems: '', totalScore: '', learners: '' });
  const isTeacher = user?.role === 'teacher';

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const grades = ['All', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

  const filtered = records.filter(r =>
    r.quarter === filterQuarter && (filterGrade === 'All' || r.gradeLevel === filterGrade)
  );

  const averageMps = filtered.length
    ? (filtered.reduce((s, r) => s + r.mps, 0) / filtered.length).toFixed(1)
    : '—';

  const computeMps = () => {
    const items = parseFloat(form.totalItems);
    const score = parseFloat(form.totalScore);
    const learners = parseFloat(form.learners);
    if (!items || !score || !learners) return 0;
    return ((score / (items * learners)) * 100).toFixed(2);
  };

  const handleSave = () => {
    if (!form.subject || !form.gradeLevel || !form.totalItems || !form.totalScore || !form.learners) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }
    const mps = parseFloat(computeMps() as string);
    const newRecord: MpsRecord = {
      id: `m${Date.now()}`,
      subject: form.subject,
      gradeLevel: form.gradeLevel,
      quarter: filterQuarter,
      totalItems: parseFloat(form.totalItems),
      totalScore: parseFloat(form.totalScore),
      mps,
      learners: parseFloat(form.learners),
    };
    setRecords(prev => [...prev, newRecord]);
    setShowModal(false);
    setForm({ subject: '', gradeLevel: '', totalItems: '', totalScore: '', learners: '' });
    Alert.alert('Saved', `MPS computed: ${mps}%`);
  };

  const mpsColor = (v: number) =>
    v >= 75 ? Colors.status.submitted : v >= 60 ? Colors.status.pending : Colors.status.missing;

  return (
    <View style={styles.flex}>
      <Header
        title="MPS"
        subtitle="Mean Percentage Score"
        showMenu
        onMenuPress={toggleDrawer}
        rightIcon={isTeacher ? 'add-circle-outline' : undefined}
        onRightPress={isTeacher ? () => setShowModal(true) : undefined}
      />

      {/* Quarter Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {quarters.map(q => (
          <TouchableOpacity key={q} style={[styles.chip, filterQuarter === q && styles.chipActive]} onPress={() => setFilterQuarter(q)}>
            <Text style={[styles.chipText, filterQuarter === q && styles.chipTextActive]}>{q}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.divider} />
        {grades.map(g => (
          <TouchableOpacity key={g} style={[styles.chip, filterGrade === g && styles.chipGrade]} onPress={() => setFilterGrade(g)}>
            <Text style={[styles.chipText, filterGrade === g && styles.chipTextGrade]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary */}
        <Card>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{averageMps}%</Text>
              <Text style={styles.summaryLabel}>Overall MPS ({filterQuarter})</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{filtered.length}</Text>
              <Text style={styles.summaryLabel}>Subjects Recorded</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: parseFloat(averageMps) >= 75 ? Colors.status.submitted : Colors.status.pending }]}>
                {parseFloat(averageMps) >= 75 ? 'Proficient' : parseFloat(averageMps) >= 60 ? 'Developing' : 'Beginning'}
              </Text>
              <Text style={styles.summaryLabel}>Performance Level</Text>
            </View>
          </View>
        </Card>

        {/* MPS Table */}
        <Text style={styles.sectionLabel}>Performance by Subject</Text>
        <Card noPad>
          <View style={styles.tableHeader}>
            <Text style={[styles.col, styles.colWide, styles.headerText]}>Subject</Text>
            <Text style={[styles.col, styles.headerText]}>Grade</Text>
            <Text style={[styles.col, styles.headerText]}>Items</Text>
            <Text style={[styles.col, styles.headerText]}>MPS</Text>
          </View>
          {filtered.map((r, i) => (
            <View key={r.id} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
              <Text style={[styles.col, styles.colWide]} numberOfLines={1}>{r.subject}</Text>
              <Text style={styles.col}>{r.gradeLevel.replace('Grade ', 'G')}</Text>
              <Text style={styles.col}>{r.totalItems}</Text>
              <Text style={[styles.col, styles.mpsCell, { color: mpsColor(r.mps) }]}>{r.mps.toFixed(1)}%</Text>
            </View>
          ))}
          {filtered.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No MPS data for {filterQuarter}{filterGrade !== 'All' ? ` — ${filterGrade}` : ''}</Text>
            </View>
          )}
        </Card>

        {/* MPS Formula Reference */}
        <Card style={styles.formulaCard}>
          <View style={styles.formulaHeader}>
            <Ionicons name="calculator-outline" size={16} color={Colors.maroon.primary} />
            <Text style={styles.formulaTitle}>MPS Formula</Text>
          </View>
          <Text style={styles.formulaText}>MPS = (Total Score ÷ (No. of Items × No. of Learners)) × 100</Text>
        </Card>
      </ScrollView>

      {/* Add MPS Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Enter MPS Data — {filterQuarter}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={22} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            {(['subject', 'gradeLevel', 'learners', 'totalItems', 'totalScore'] as const).map(field => {
              const labels: Record<string, string> = {
                subject: 'Learning Area / Subject',
                gradeLevel: 'Grade Level',
                learners: 'Number of Learners',
                totalItems: 'Number of Items',
                totalScore: 'Total Score of All Learners',
              };
              return (
                <View key={field} style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{labels[field]}</Text>
                  <TextInput
                    style={styles.textField}
                    value={form[field]}
                    onChangeText={v => setForm(p => ({ ...p, [field]: v }))}
                    placeholder={field === 'subject' ? 'e.g. Mathematics' : field === 'gradeLevel' ? 'e.g. Grade 7' : '0'}
                    placeholderTextColor={Colors.text.muted}
                    keyboardType={['learners', 'totalItems', 'totalScore'].includes(field) ? 'numeric' : 'default'}
                  />
                </View>
              );
            })}

            {form.totalItems && form.totalScore && form.learners && (
              <View style={styles.computedBox}>
                <Text style={styles.computedLabel}>Computed MPS</Text>
                <Text style={styles.computedValue}>{computeMps()}%</Text>
              </View>
            )}

            <Button label="Save MPS Data" onPress={handleSave} fullWidth />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  filterScroll: { maxHeight: 44, flexGrow: 0 },
  filterContent: { paddingHorizontal: 16, alignItems: 'center', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.maroon.primary, borderColor: Colors.maroon.primary },
  chipGrade: { backgroundColor: '#E3F2FD', borderColor: '#1565C0' },
  chipText: { fontSize: 12, color: Colors.text.secondary, fontWeight: '600' },
  chipTextActive: { color: Colors.white },
  chipTextGrade: { color: '#1565C0' },
  divider: { width: 1, height: 20, backgroundColor: Colors.border, marginHorizontal: 4 },
  content: { padding: 16, paddingBottom: 40 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '800', color: Colors.text.primary },
  summaryLabel: { fontSize: 11, color: Colors.text.muted, textAlign: 'center', marginTop: 2 },
  summaryDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.text.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableHeader: { flexDirection: 'row', backgroundColor: Colors.maroon.primary, paddingVertical: 10, paddingHorizontal: 14, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 14 },
  tableRowAlt: { backgroundColor: Colors.maroon.surface },
  headerText: { color: Colors.white, fontWeight: '700', fontSize: 12 },
  col: { flex: 1, fontSize: 12, color: Colors.text.primary },
  colWide: { flex: 2 },
  mpsCell: { fontWeight: '700' },
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 13, color: Colors.text.muted },
  formulaCard: { backgroundColor: Colors.maroon.surface, borderLeftWidth: 3, borderLeftColor: Colors.maroon.primary },
  formulaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  formulaTitle: { fontSize: 13, fontWeight: '700', color: Colors.maroon.primary },
  formulaText: { fontSize: 13, color: Colors.text.secondary, lineHeight: 20, fontStyle: 'italic' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 36 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.text.primary, marginBottom: 6 },
  textField: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.text.primary, backgroundColor: Colors.background,
  },
  computedBox: { backgroundColor: Colors.maroon.muted, borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 16 },
  computedLabel: { fontSize: 12, color: Colors.maroon.primary, fontWeight: '600' },
  computedValue: { fontSize: 28, fontWeight: '800', color: Colors.maroon.primary, marginTop: 4 },
});
