import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ProgressBar from '@/components/ui/ProgressBar';
import { useDrawer } from '@/context/DrawerContext';
import { useToast } from '@/context/ToastContext';
import { Colors } from '@/constants/Colors';

type DocStatus = 'submitted' | 'pending' | 'overdue';
type DocCategory = 'Academic' | 'Personnel' | 'Financial' | 'Administrative';

interface DepEdDoc {
  id: string;
  title: string;
  description: string;
  category: DocCategory;
  deadline: string;
  status: DocStatus;
  submittedAt?: string;
  forwardedToPrincipal: boolean;
}

const DEPED_DOCS: DepEdDoc[] = [
  {
    id: 'd1',
    title: 'School Report Card (SRC)',
    description: 'DepEd Order No. 8 s. 2015 — end-of-quarter learner performance summary.',
    category: 'Academic',
    deadline: '2025-01-15',
    status: 'submitted',
    submittedAt: '2025-01-06',
    forwardedToPrincipal: true,
  },
  {
    id: 'd2',
    title: 'Individual Performance Commitment Review (IPCR)',
    description: 'CSC Form 1 — quarterly performance commitment and review for teaching personnel.',
    category: 'Personnel',
    deadline: '2025-01-20',
    status: 'pending',
    forwardedToPrincipal: false,
  },
  {
    id: 'd3',
    title: 'Monthly Accomplishment Report',
    description: 'Summary of completed activities, programs, and outputs for the reporting month.',
    category: 'Administrative',
    deadline: '2025-01-05',
    status: 'overdue',
    forwardedToPrincipal: false,
  },
  {
    id: 'd4',
    title: 'School Maintenance Operating Budget (SMOB)',
    description: 'DepEd-mandated quarterly financial utilization report for school MOOE.',
    category: 'Financial',
    deadline: '2025-01-30',
    status: 'pending',
    forwardedToPrincipal: false,
  },
  {
    id: 'd5',
    title: 'Enhanced Basic Education Information System (EBEIS) Report',
    description: 'Enrollment data and school statistics for submission to the Central Office.',
    category: 'Academic',
    deadline: '2024-12-31',
    status: 'submitted',
    submittedAt: '2024-12-28',
    forwardedToPrincipal: true,
  },
  {
    id: 'd6',
    title: 'Certificate of Appearance / Daily Time Record (DTR)',
    description: 'CS Form 48 — certified daily time records for all personnel.',
    category: 'Personnel',
    deadline: '2025-01-10',
    status: 'pending',
    forwardedToPrincipal: false,
  },
];

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; bg: string; icon: string }> = {
  submitted: { label: 'Submitted',  color: Colors.status.submitted, bg: '#E8F5E9', icon: 'checkmark-circle' },
  pending:   { label: 'Pending',    color: '#F57F17',               bg: '#FFF8E1', icon: 'time' },
  overdue:   { label: 'Overdue',    color: Colors.status.missing,   bg: '#FFEBEE', icon: 'alert-circle' },
};

const CATEGORY_COLORS: Record<DocCategory, string> = {
  Academic:       Colors.maroon.primary,
  Personnel:      '#1565C0',
  Financial:      '#2E7D32',
  Administrative: '#6A1B9A',
};

const ALL_CATEGORIES: DocCategory[] = ['Academic', 'Personnel', 'Financial', 'Administrative'];

type FilterStatus = 'All' | DocStatus;
const STATUS_FILTERS: FilterStatus[] = ['All', 'submitted', 'pending', 'overdue'];

export default function DepEdDocsScreen() {
  const { toggleDrawer } = useDrawer();
  const toast = useToast();

  const [docs, setDocs] = useState<DepEdDoc[]>(DEPED_DOCS);
  const [activeStatus, setActiveStatus] = useState<FilterStatus>('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DepEdDoc | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [remarks, setRemarks] = useState('');

  const filtered = docs.filter(d => activeStatus === 'All' || d.status === activeStatus);

  const counts = {
    submitted: docs.filter(d => d.status === 'submitted').length,
    pending:   docs.filter(d => d.status === 'pending').length,
    overdue:   docs.filter(d => d.status === 'overdue').length,
  };
  const complianceRate = Math.round((counts.submitted / docs.length) * 100);

  const handleOpenUpload = (doc: DepEdDoc) => {
    setSelectedDoc(doc);
    setRemarks('');
    setUploadProgress(0);
    setShowUploadModal(true);
  };

  const handleSubmit = () => {
    if (!selectedDoc) return;
    setUploading(true);

    const stages = [
      { pct: 30, delay: 600 },
      { pct: 65, delay: 1200 },
      { pct: 90, delay: 1800 },
      { pct: 100, delay: 2400 },
    ];

    stages.forEach(({ pct, delay }) => {
      setTimeout(() => setUploadProgress(pct), delay);
    });

    setTimeout(() => {
      setUploading(false);
      setDocs(prev =>
        prev.map(d => d.id === selectedDoc.id
          ? { ...d, status: 'submitted', submittedAt: '2025-01-07', forwardedToPrincipal: true }
          : d
        )
      );
      setShowUploadModal(false);
      toast.success('Document submitted', `"${selectedDoc.title}" has been submitted and forwarded to the Principal.`);
    }, 2700);
  };

  const handleForward = (doc: DepEdDoc) => {
    setDocs(prev =>
      prev.map(d => d.id === doc.id ? { ...d, forwardedToPrincipal: true } : d)
    );
    toast.success('Forwarded to Principal', `"${doc.title}" has been sent to the Principal's inbox.`);
  };

  return (
    <View style={styles.flex}>
      <Header
        title="DepEd Documents"
        subtitle="Required Reports & Compliance"
        showMenu
        onMenuPress={toggleDrawer}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Compliance summary */}
        <View style={styles.complianceCard}>
          <View style={styles.complianceTop}>
            <View>
              <Text style={styles.complianceRate}>{complianceRate}%</Text>
              <Text style={styles.complianceLabel}>Compliance Rate</Text>
            </View>
            <View style={styles.complianceCounts}>
              {[
                { label: 'Done', value: counts.submitted, color: Colors.status.submitted },
                { label: 'Pending', value: counts.pending, color: '#F57F17' },
                { label: 'Overdue', value: counts.overdue, color: Colors.status.missing },
              ].map(c => (
                <View key={c.label} style={styles.countItem}>
                  <Text style={[styles.countValue, { color: c.color }]}>{c.value}</Text>
                  <Text style={styles.countLabel}>{c.label}</Text>
                </View>
              ))}
            </View>
          </View>
          <ProgressBar progress={complianceRate} color={Colors.maroon.primary} showPercent={false} />
        </View>

        {/* Status filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {STATUS_FILTERS.map(f => {
            const active = activeStatus === f;
            const cfg = f !== 'All' ? STATUS_CONFIG[f] : null;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, active && { backgroundColor: cfg?.bg ?? Colors.maroon.muted, borderColor: cfg?.color ?? Colors.maroon.primary }]}
                onPress={() => setActiveStatus(f)}
              >
                {f !== 'All' && cfg && (
                  <Ionicons name={cfg.icon as any} size={13} color={active ? cfg.color : Colors.text.muted} />
                )}
                <Text style={[styles.filterText, active && { color: cfg?.color ?? Colors.maroon.primary, fontWeight: '800' }]}>
                  {f === 'All' ? `All (${docs.length})` : `${STATUS_CONFIG[f as DocStatus].label} (${counts[f as DocStatus]})`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Document list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="document-outline"
            title="No documents in this category"
            subtitle="Select a different filter to view documents."
          />
        ) : filtered.map(doc => {
          const cfg = STATUS_CONFIG[doc.status];
          return (
            <View key={doc.id} style={[styles.docCard, doc.status === 'overdue' && styles.overdueCard]}>
              <View style={styles.docTop}>
                <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[doc.category] }]} />
                <Text style={styles.categoryLabel}>{doc.category}</Text>
                <View style={{ flex: 1 }} />
                <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={cfg.icon as any} size={11} color={cfg.color} />
                  <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>

              <Text style={styles.docTitle}>{doc.title}</Text>
              <Text style={styles.docDesc}>{doc.description}</Text>

              <View style={styles.docMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={12} color={Colors.text.muted} />
                  <Text style={styles.metaText}>Due: {doc.deadline}</Text>
                </View>
                {doc.submittedAt && (
                  <View style={styles.metaItem}>
                    <Ionicons name="checkmark-circle-outline" size={12} color={Colors.status.submitted} />
                    <Text style={[styles.metaText, { color: Colors.status.submitted }]}>Submitted: {doc.submittedAt}</Text>
                  </View>
                )}
              </View>

              <View style={styles.docActions}>
                {doc.status !== 'submitted' && (
                  <TouchableOpacity style={styles.submitBtn} onPress={() => handleOpenUpload(doc)}>
                    <Ionicons name="cloud-upload-outline" size={14} color={Colors.white} />
                    <Text style={styles.submitBtnText}>Submit Document</Text>
                  </TouchableOpacity>
                )}
                {doc.status === 'submitted' && !doc.forwardedToPrincipal && (
                  <TouchableOpacity style={styles.forwardBtn} onPress={() => handleForward(doc)}>
                    <Ionicons name="send-outline" size={14} color={Colors.maroon.primary} />
                    <Text style={styles.forwardBtnText}>Forward to Principal</Text>
                  </TouchableOpacity>
                )}
                {doc.forwardedToPrincipal && (
                  <View style={styles.forwardedBadge}>
                    <Ionicons name="checkmark-done-outline" size={14} color={Colors.status.submitted} />
                    <Text style={styles.forwardedText}>Forwarded to Principal</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Upload modal */}
      <Modal visible={showUploadModal} animationType="slide" transparent onRequestClose={() => { if (!uploading) setShowUploadModal(false); }}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Submit Document</Text>
              {!uploading && (
                <TouchableOpacity onPress={() => setShowUploadModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={22} color={Colors.text.primary} />
                </TouchableOpacity>
              )}
            </View>

            {selectedDoc && <Text style={styles.sheetSubtitle}>{selectedDoc.title}</Text>}

            {uploading ? (
              <View style={styles.uploadingView}>
                <MaterialCommunityIcons name="file-upload-outline" size={48} color={Colors.maroon.primary} />
                <Text style={styles.uploadingLabel}>
                  {uploadProgress < 30 ? 'Uploading document...'
                    : uploadProgress < 65 ? 'Validating format...'
                    : uploadProgress < 90 ? 'Generating report...'
                    : 'Forwarding to Principal...'}
                </Text>
                <ProgressBar progress={uploadProgress} color={Colors.maroon.primary} showPercent indeterminate={false} />
              </View>
            ) : (
              <>
                <View style={styles.filePickArea}>
                  <MaterialCommunityIcons name="file-upload-outline" size={36} color={Colors.maroon.primary} />
                  <Text style={styles.filePickTitle}>Tap to attach file</Text>
                  <Text style={styles.filePickSub}>PDF, DOCX, XLSX — max 25 MB</Text>
                </View>

                <Text style={styles.fieldLabel}>Remarks (optional)</Text>
                <TextInput
                  style={[styles.textField, styles.textArea]}
                  value={remarks}
                  onChangeText={setRemarks}
                  placeholder="Add any notes or remarks for the Principal..."
                  placeholderTextColor={Colors.text.muted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <Button label="Submit & Forward to Principal" onPress={handleSubmit} fullWidth style={{ marginTop: 16 }} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },

  complianceCard: {
    backgroundColor: Colors.maroon.primary, borderRadius: 16, padding: 20, marginBottom: 16,
  },
  complianceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  complianceRate: { fontSize: 36, fontWeight: '900', color: Colors.white },
  complianceLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginTop: -2 },
  complianceCounts: { flexDirection: 'row', gap: 20 },
  countItem: { alignItems: 'center' },
  countValue: { fontSize: 20, fontWeight: '800', color: Colors.white },
  countLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 2 },

  filterScroll: { marginBottom: 16 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
  },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.text.secondary },

  docCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 12,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  overdueCard: { borderLeftWidth: 3, borderLeftColor: Colors.status.missing },

  docTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  categoryLabel: { fontSize: 11, fontWeight: '700', color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },

  docTitle: { fontSize: 14, fontWeight: '800', color: Colors.text.primary, marginBottom: 6, lineHeight: 20 },
  docDesc: { fontSize: 12, color: Colors.text.secondary, lineHeight: 18, marginBottom: 12 },

  docMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: Colors.text.muted, fontWeight: '600' },

  docActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.maroon.primary, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  submitBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  forwardBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: Colors.maroon.primary, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  forwardBtnText: { color: Colors.maroon.primary, fontSize: 13, fontWeight: '700' },
  forwardedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E8F5E9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
  },
  forwardedText: { color: Colors.status.submitted, fontSize: 12, fontWeight: '700' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 24, paddingBottom: 36 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: Colors.text.primary },
  sheetSubtitle: { fontSize: 13, color: Colors.text.muted, marginBottom: 20 },

  uploadingView: { alignItems: 'center', paddingVertical: 24, gap: 16 },
  uploadingLabel: { fontSize: 14, fontWeight: '600', color: Colors.text.secondary, textAlign: 'center' },

  filePickArea: {
    borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 32,
    backgroundColor: Colors.maroon.muted, marginBottom: 16,
  },
  filePickTitle: { fontSize: 15, fontWeight: '700', color: Colors.maroon.primary },
  filePickSub: { fontSize: 12, color: Colors.text.muted },

  fieldLabel: { fontSize: 12, fontWeight: '700', color: Colors.text.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
  textField: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: Colors.text.primary, backgroundColor: Colors.background,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
});
