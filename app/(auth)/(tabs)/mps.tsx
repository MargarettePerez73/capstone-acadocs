import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import InlineError from '@/components/ui/InlineError';
import { useAuth } from '@/context/AuthContext';
import { useDrawer } from '@/context/DrawerContext';
import { useToast } from '@/context/ToastContext';
import { Colors } from '@/constants/Colors';
import { MPS_RECORDS, MpsRecord } from '@/data/mockData';

type FormFields = { subject: string; gradeLevel: string; totalItems: string; totalScore: string; learners: string };
type FormErrors = Partial<Record<keyof FormFields, string>>;

function validateMpsForm(form: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!form.subject.trim()) errors.subject = 'Learning area / subject is required.';
  if (!form.gradeLevel.trim()) errors.gradeLevel = 'Grade level is required.';
  const items = parseFloat(form.totalItems);
  const score = parseFloat(form.totalScore);
  const learners = parseFloat(form.learners);
  if (!form.totalItems || isNaN(items) || items <= 0) errors.totalItems = 'Enter a valid number of test items (e.g. 50).';
  if (!form.learners || isNaN(learners) || learners <= 0) errors.learners = 'Enter the total number of learners.';
  if (!form.totalScore || isNaN(score) || score < 0) errors.totalScore = 'Enter the combined total score of all learners.';
  if (!errors.totalScore && !errors.totalItems && !errors.learners && score > items * learners) {
    errors.totalScore = 'Total score cannot exceed (items × learners). Please recheck.';
  }
  return errors;
}

const PERFORMANCE_LABEL = (mps: number) =>
  mps >= 75 ? 'Proficient' : mps >= 60 ? 'Developing' : 'Beginning';

const PERFORMANCE_COLOR = (mps: number) =>
  mps >= 75 ? Colors.status.submitted : mps >= 60 ? Colors.status.pending : Colors.status.missing;

export default function MpsScreen() {
  const { user } = useAuth();
  const { toggleDrawer } = useDrawer();
  const toast = useToast();

  const [records, setRecords] = useState<MpsRecord[]>(MPS_RECORDS);
  const [showModal, setShowModal] = useState(false);
  const [filterQuarter, setFilterQuarter] = useState('Q1');
  const [filterGrade, setFilterGrade] = useState('All');
  const [form, setForm] = useState<FormFields>({ subject: '', gradeLevel: '', totalItems: '', totalScore: '', learners: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({});
  const [saving, setSaving] = useState(false);

  const isTeacher = user?.role === 'teacher';
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const grades = ['All', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

  const filtered = records.filter(r =>
    r.quarter === filterQuarter && (filterGrade === 'All' || r.gradeLevel === filterGrade)
  );

  const averageMps = filtered.length
    ? filtered.reduce((s, r) => s + r.mps, 0) / filtered.length
    : null;

  const computedMps = (): number | null => {
    const items = parseFloat(form.totalItems);
    const score = parseFloat(form.totalScore);
    const learners = parseFloat(form.learners);
    if (!items || !score || !learners || items <= 0 || learners <= 0) return null;
    return parseFloat(((score / (items * learners)) * 100).toFixed(2));
  };

  const handleFieldChange = (field: keyof FormFields, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched[field]) {
      setErrors(validateMpsForm(updated));
    }
  };

  const handleBlur = (field: keyof FormFields) => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(validateMpsForm(form));
  };

  const handleSave = () => {
    const validationErrors = validateMpsForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ subject: true, gradeLevel: true, totalItems: true, totalScore: true, learners: true });
      toast.warning('Check your inputs', 'Please fix the highlighted fields before saving.');
      return;
    }
    setSaving(true);
    const mps = computedMps()!;
    setTimeout(() => {
      const newRecord: MpsRecord = {
        id: `m${Date.now()}`,
        subject: form.subject.trim(),
        gradeLevel: form.gradeLevel.trim(),
        quarter: filterQuarter,
        totalItems: parseFloat(form.totalItems),
        totalScore: parseFloat(form.totalScore),
        mps,
        learners: parseFloat(form.learners),
      };
      setRecords(prev => [...prev, newRecord]);
      setSaving(false);
      setShowModal(false);
      setForm({ subject: '', gradeLevel: '', totalItems: '', totalScore: '', learners: '' });
      setErrors({});
      setTouched({});
      toast.success('MPS data saved', `${form.subject} — ${form.gradeLevel}: ${mps}% (${PERFORMANCE_LABEL(mps)})`);
    }, 800);
  };

  const FIELD_CONFIG: Array<{ key: keyof FormFields; label: string; placeholder: string; numeric?: boolean; hint?: string }> = [
    { key: 'subject', label: 'Learning Area / Subject', placeholder: 'e.g. Mathematics, Science' },
    { key: 'gradeLevel', label: 'Grade Level', placeholder: 'e.g. Grade 7, Grade 8' },
    { key: 'learners', label: 'Number of Learners', placeholder: 'e.g. 45', numeric: true, hint: 'Total learners who took the test.' },
    { key: 'totalItems', label: 'Number of Test Items', placeholder: 'e.g. 50', numeric: true, hint: 'Total number of questions in the test.' },
    { key: 'totalScore', label: 'Total Score of All Learners', placeholder: 'e.g. 1875', numeric: true, hint: 'Sum of all individual learner scores.' },
  ];

  const mps = computedMps();

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
            <Text style={[styles.chipText, filterQuarter === q && styles.chipTextActive]}>Quarter {q}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.divider} />
        {grades.map(g => (
          <TouchableOpacity key={g} style={[styles.chip, filterGrade === g && styles.chipGrade]} onPress={() => setFilterGrade(g)}>
            <Text style={[styles.chipText, filterGrade === g && styles.chipTextGrade]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Summary Card */}
        <Card>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, averageMps ? { color: PERFORMANCE_COLOR(averageMps) } : {}]}>
                {averageMps !== null ? `${averageMps.toFixed(1)}%` : '—'}
              </Text>
              <Text style={styles.summaryLabel}>Average MPS{'\n'}{filterQuarter}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{filtered.length}</Text>
              <Text style={styles.summaryLabel}>Subjects{'\n'}Recorded</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { fontSize: 14 }, averageMps ? { color: PERFORMANCE_COLOR(averageMps) } : {}]}>
                {averageMps !== null ? PERFORMANCE_LABEL(averageMps) : '—'}
              </Text>
              <Text style={styles.summaryLabel}>Performance{'\n'}Level</Text>
            </View>
          </View>
          {/* Legend */}
          <View style={styles.legendRow}>
            {[{ label: 'Beginning', color: Colors.status.missing, range: '< 60%' },
              { label: 'Developing', color: Colors.status.pending, range: '60–74%' },
              { label: 'Proficient', color: Colors.status.submitted, range: '≥ 75%' }].map(l => (
              <View key={l.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={styles.legendText}>{l.label} ({l.range})</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Table */}
        <Text style={styles.sectionLabel}>Performance by Learning Area</Text>
        <Card noPad>
          <View style={styles.tableHeader}>
            <Text style={[styles.col, styles.colWide, styles.headerText]}>Learning Area</Text>
            <Text style={[styles.col, styles.headerText]}>Grade</Text>
            <Text style={[styles.col, styles.headerText]}>Items</Text>
            <Text style={[styles.col, styles.headerText]}>MPS</Text>
          </View>
          {filtered.length === 0 ? (
            <EmptyState
              icon="bar-chart-outline"
              title="No MPS data yet"
              subtitle={`No records found for ${filterQuarter}${filterGrade !== 'All' ? ` · ${filterGrade}` : ''}. ${isTeacher ? 'Tap + to add your first entry.' : ''}`}
              actionLabel={isTeacher ? 'Enter MPS Data' : undefined}
              onAction={isTeacher ? () => setShowModal(true) : undefined}
            />
          ) : filtered.map((r, i) => (
            <View key={r.id} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
              <Text style={[styles.col, styles.colWide]} numberOfLines={1}>{r.subject}</Text>
              <Text style={styles.col}>{r.gradeLevel.replace('Grade ', 'G')}</Text>
              <Text style={styles.col}>{r.totalItems}</Text>
              <Text style={[styles.col, styles.mpsCell, { color: PERFORMANCE_COLOR(r.mps) }]}>{r.mps.toFixed(1)}%</Text>
            </View>
          ))}
        </Card>

        {/* Formula Reference */}
        <Card style={styles.formulaCard}>
          <View style={styles.formulaHeader}>
            <Ionicons name="calculator-outline" size={16} color={Colors.maroon.primary} />
            <Text style={styles.formulaTitle}>MPS Computation Formula</Text>
          </View>
          <Text style={styles.formulaText}>
            MPS = (Total Score of All Learners ÷ (No. of Items × No. of Learners)) × 100
          </Text>
          <Text style={styles.formulaNote}>Source: DepEd Order No. 8, s. 2015</Text>
        </Card>
      </ScrollView>

      {/* Enter MPS Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => !saving && setShowModal(false)}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.sheetScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetTitle}>Enter MPS Data</Text>
                  <Text style={styles.sheetSub}>Quarter {filterQuarter}</Text>
                </View>
                {!saving && (
                  <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={22} color={Colors.text.primary} />
                  </TouchableOpacity>
                )}
              </View>

              {FIELD_CONFIG.map(({ key, label, placeholder, numeric, hint }) => (
                <View key={key} style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    {label} <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.textField, errors[key] && touched[key] ? styles.textFieldError : null]}
                    value={form[key]}
                    onChangeText={v => handleFieldChange(key, v)}
                    onBlur={() => handleBlur(key)}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.text.muted}
                    keyboardType={numeric ? 'numeric' : 'default'}
                    editable={!saving}
                  />
                  {hint && !errors[key] && <Text style={styles.fieldHint}>{hint}</Text>}
                  <InlineError message={touched[key] ? errors[key] : undefined} />
                </View>
              ))}

              {/* Live MPS Preview */}
              {mps !== null && (
                <View style={[styles.computedBox, { borderColor: PERFORMANCE_COLOR(mps) }]}>
                  <Text style={styles.computedLabel}>Computed MPS</Text>
                  <Text style={[styles.computedValue, { color: PERFORMANCE_COLOR(mps) }]}>{mps}%</Text>
                  <View style={[styles.performancePill, { backgroundColor: PERFORMANCE_COLOR(mps) + '20' }]}>
                    <Text style={[styles.performancePillText, { color: PERFORMANCE_COLOR(mps) }]}>
                      {PERFORMANCE_LABEL(mps)}
                    </Text>
                  </View>
                </View>
              )}

              <Button label={saving ? 'Saving...' : 'Save MPS Data'} onPress={handleSave} loading={saving} fullWidth style={{ marginTop: 8 }} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  filterScroll: { maxHeight: 48, flexGrow: 0 },
  filterContent: { paddingHorizontal: 16, alignItems: 'center', gap: 8, paddingVertical: 6 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.maroon.primary, borderColor: Colors.maroon.primary },
  chipGrade: { backgroundColor: '#E3F2FD', borderColor: '#1565C0' },
  chipText: { fontSize: 12, color: Colors.text.secondary, fontWeight: '600' },
  chipTextActive: { color: Colors.white },
  chipTextGrade: { color: '#1565C0' },
  divider: { width: 1, height: 24, backgroundColor: Colors.border, marginHorizontal: 2 },
  content: { padding: 16, paddingBottom: 40 },

  /* Summary */
  summaryRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 12 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, textAlign: 'center' },
  summaryLabel: { fontSize: 11, color: Colors.text.muted, textAlign: 'center', marginTop: 3, lineHeight: 15 },
  summaryDivider: { width: 1, height: 44, backgroundColor: Colors.border },

  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: Colors.text.muted, fontWeight: '600' },

  sectionLabel: { fontSize: 13, fontWeight: '800', color: Colors.text.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },

  /* Table */
  tableHeader: { flexDirection: 'row', backgroundColor: Colors.maroon.primary, paddingVertical: 11, paddingHorizontal: 14, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  tableRow: { flexDirection: 'row', paddingVertical: 11, paddingHorizontal: 14 },
  tableRowAlt: { backgroundColor: Colors.maroon.surface },
  headerText: { color: Colors.white, fontWeight: '700', fontSize: 12 },
  col: { flex: 1, fontSize: 12, color: Colors.text.primary },
  colWide: { flex: 2.2 },
  mpsCell: { fontWeight: '800' },

  /* Formula */
  formulaCard: { backgroundColor: Colors.maroon.surface, borderLeftWidth: 3, borderLeftColor: Colors.maroon.primary },
  formulaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  formulaTitle: { fontSize: 13, fontWeight: '700', color: Colors.maroon.primary },
  formulaText: { fontSize: 13, color: Colors.text.secondary, lineHeight: 20, fontStyle: 'italic' },
  formulaNote: { fontSize: 10, color: Colors.text.muted, marginTop: 6 },

  /* Modal */
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetScroll: { justifyContent: 'flex-end', flex: 1 },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 24, paddingBottom: 36 },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: Colors.text.primary },
  sheetSub: { fontSize: 13, color: Colors.maroon.primary, fontWeight: '600', marginTop: 2 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: Colors.text.primary, marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.4 },
  required: { color: Colors.status.missing },
  fieldHint: { fontSize: 11, color: Colors.text.muted, marginTop: 4 },
  textField: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: Colors.text.primary, backgroundColor: Colors.background,
  },
  textFieldError: { borderColor: Colors.status.missing, backgroundColor: '#FFF5F5' },
  computedBox: {
    borderWidth: 2, borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 16, gap: 6,
  },
  computedLabel: { fontSize: 12, fontWeight: '700', color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  computedValue: { fontSize: 36, fontWeight: '900', lineHeight: 40 },
  performancePill: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  performancePillText: { fontSize: 12, fontWeight: '700' },
});
