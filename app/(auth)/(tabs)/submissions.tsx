import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  TextInput, FlatList, Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '@/components/ui/Header';
import SubmissionCard from '@/components/submissions/SubmissionCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ProgressBar from '@/components/ui/ProgressBar';
import InlineError from '@/components/ui/InlineError';
import { useDrawer } from '@/context/DrawerContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Colors } from '@/constants/Colors';
import { SUBMISSIONS, Submission } from '@/data/mockData';

type FilterStatus = 'all' | 'submitted' | 'pending' | 'missing';
type DocType = 'DLL' | 'Lesson Plan' | 'Monthly Test' | 'Assessment';

const STATUS_LABELS: Record<FilterStatus, string> = {
  all: 'All',
  submitted: 'Submitted',
  pending: 'Pending',
  missing: 'Missing',
};

export default function SubmissionsScreen() {
  const { user } = useAuth();
  const { toggleDrawer } = useDrawer();
  const toast = useToast();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState<DocType | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [docType, setDocType] = useState<DocType>('DLL');
  const [week, setWeek] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [weekError, setWeekError] = useState('');
  const [fileError, setFileError] = useState('');

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState('');

  const isTeacher = user?.role === 'teacher';

  const filtered = SUBMISSIONS.filter(s => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (filterType !== 'all' && s.type !== filterType) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      if (!s.teacherName.toLowerCase().includes(q) && !s.subject.toLowerCase().includes(q)) return false;
    }
    if (isTeacher && s.teacherId !== 't1') return false;
    return true;
  });

  const counts = {
    all: SUBMISSIONS.filter(s => !isTeacher || s.teacherId === 't1').length,
    submitted: SUBMISSIONS.filter(s => s.status === 'submitted' && (!isTeacher || s.teacherId === 't1')).length,
    pending: SUBMISSIONS.filter(s => s.status === 'pending' && (!isTeacher || s.teacherId === 't1')).length,
    missing: SUBMISSIONS.filter(s => s.status === 'missing' && (!isTeacher || s.teacherId === 't1')).length,
  };

  const resetForm = () => {
    setDocType('DLL');
    setWeek('');
    setSelectedFile(null);
    setWeekError('');
    setFileError('');
    setUploadProgress(0);
    setUploadPhase('');
  };

  const handlePickFile = () => {
    setSelectedFile('Daily_Lesson_Log_Week1.docx');
    setFileError('');
    toast.info('File selected', 'Daily_Lesson_Log_Week1.docx ready to upload.');
  };

  const validateForm = () => {
    let valid = true;
    if (!week.trim()) { setWeekError('Please specify the week or period.'); valid = false; }
    else setWeekError('');
    if (!selectedFile) { setFileError('Please select a document file to upload.'); valid = false; }
    else setFileError('');
    return valid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.warning('Incomplete form', 'Please fill in all required fields.');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setUploadPhase('Uploading document...');

    // Simulate staged upload
    const stages = [
      { pct: 25, label: 'Uploading document...' },
      { pct: 60, label: 'Verifying file integrity...' },
      { pct: 85, label: 'Scanning for plagiarism...' },
      { pct: 100, label: 'Finalizing submission...' },
    ];

    stages.forEach(({ pct, label }, i) => {
      setTimeout(() => {
        setUploadProgress(pct);
        setUploadPhase(label);
        if (pct === 100) {
          setTimeout(() => {
            setUploading(false);
            setShowModal(false);
            resetForm();
            toast.success('Document submitted', `${docType} for ${week} submitted successfully. Plagiarism scan is running in the background.`);
          }, 500);
        }
      }, i * 600);
    });
  };

  const typeFilters: Array<'all' | DocType> = ['all', 'DLL', 'Lesson Plan', 'Monthly Test', 'Assessment'];

  return (
    <View style={styles.flex}>
      <Header
        title="Submissions"
        subtitle={isTeacher ? 'My Document Submissions' : 'Monitor All Submissions'}
        showMenu
        onMenuPress={toggleDrawer}
        rightIcon={isTeacher ? 'add-circle-outline' : 'funnel-outline'}
        onRightPress={isTeacher ? () => setShowModal(true) : undefined}
      />

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={Colors.text.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by teacher name or subject..."
          placeholderTextColor={Colors.text.muted}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={16} color={Colors.text.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.tabRow}>
        {(['all', 'submitted', 'pending', 'missing'] as FilterStatus[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.tab, filterStatus === f && styles.tabActive]}
            onPress={() => setFilterStatus(f)}
          >
            <Text style={[styles.tabText, filterStatus === f && styles.tabTextActive]}>
              {STATUS_LABELS[f]}
            </Text>
            <View style={[styles.tabBadge, filterStatus === f && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, filterStatus === f && styles.tabBadgeTextActive]}>
                {counts[f]}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Type Filter Chips */}
      <FlatList
        horizontal
        data={typeFilters}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, filterType === item && styles.chipActive]}
            onPress={() => setFilterType(item)}
          >
            <Text style={[styles.chipText, filterType === item && styles.chipTextActive]}>
              {item === 'all' ? 'All Types' : item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Result Count */}
      <Text style={styles.resultLabel}>
        {filtered.length === 0 ? 'No documents' : `${filtered.length} document${filtered.length !== 1 ? 's' : ''}`}
        {searchText ? ` matching "${searchText}"` : ''}
      </Text>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={({ item }) => <SubmissionCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="No documents found"
            subtitle={searchText ? `No results for "${searchText}". Try a different search term.` : `No ${filterStatus !== 'all' ? filterStatus : ''} documents match the selected filters.`}
            actionLabel={isTeacher ? 'Submit a Document' : undefined}
            onAction={isTeacher ? () => setShowModal(true) : undefined}
          />
        }
      />

      {/* FAB for teacher */}
      {isTeacher && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={26} color={Colors.white} />
        </TouchableOpacity>
      )}

      {/* Submit Document Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => !uploading && setShowModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* Modal Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Submit Document</Text>
              {!uploading && (
                <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={22} color={Colors.text.primary} />
                </TouchableOpacity>
              )}
            </View>

            {!uploading ? (
              <>
                {/* Document Type */}
                <Text style={styles.fieldLabel}>Document Type <Text style={styles.required}>*</Text></Text>
                <View style={styles.typeRow}>
                  {(['DLL', 'Lesson Plan', 'Monthly Test', 'Assessment'] as DocType[]).map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeChip, docType === t && styles.typeChipActive]}
                      onPress={() => setDocType(t)}
                    >
                      <Text style={[styles.typeChipText, docType === t && styles.typeChipTextActive]}>
                        {t === 'DLL' ? 'Daily Lesson Log (DLL)' : t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Week / Period */}
                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                  Week / Period <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.textField, weekError ? styles.textFieldError : null]}
                  value={week}
                  onChangeText={v => { setWeek(v); if (weekError && v.trim()) setWeekError(''); }}
                  placeholder="e.g. Week 1, Quarter 1"
                  placeholderTextColor={Colors.text.muted}
                />
                <InlineError message={weekError} />

                {/* File Upload */}
                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                  Document File <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.uploadArea, fileError ? styles.uploadAreaError : null, selectedFile ? styles.uploadAreaDone : null]}
                  onPress={handlePickFile}
                  activeOpacity={0.8}
                >
                  {selectedFile ? (
                    <>
                      <Ionicons name="document-text" size={32} color={Colors.status.submitted} />
                      <Text style={styles.uploadFilename}>{selectedFile}</Text>
                      <Text style={styles.uploadChangeTap}>Tap to change file</Text>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons name="file-upload-outline" size={36} color={Colors.maroon.primary} />
                      <Text style={styles.uploadLabel}>Tap to select file</Text>
                      <Text style={styles.uploadSub}>Accepted: PDF, DOCX — max 25 MB</Text>
                    </>
                  )}
                </TouchableOpacity>
                <InlineError message={fileError} />

                {/* Plagiarism Notice */}
                <View style={styles.noticeBox}>
                  <MaterialCommunityIcons name="shield-search" size={15} color={Colors.maroon.primary} />
                  <Text style={styles.noticeText}>
                    Your document will be automatically scanned for content similarity (plagiarism) upon submission.
                  </Text>
                </View>

                <Button label="Submit Document" onPress={handleSubmit} fullWidth style={{ marginTop: 6 }} />
              </>
            ) : (
              /* Upload Progress View */
              <View style={styles.uploadProgress}>
                <View style={styles.uploadProgressIcon}>
                  <MaterialCommunityIcons name="cloud-upload-outline" size={48} color={Colors.maroon.primary} />
                </View>
                <Text style={styles.uploadProgressTitle}>Submitting Document</Text>
                <Text style={styles.uploadProgressSub}>{uploadPhase}</Text>
                <View style={{ marginTop: 20, width: '100%' }}>
                  <ProgressBar progress={uploadProgress} label="Upload progress" />
                </View>
                <Text style={styles.uploadProgressHint}>
                  Please wait — do not close this window.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },

  /* Search */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text.primary },

  /* Status Tabs */
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 7,
    gap: 4,
  },
  tabActive: { backgroundColor: Colors.maroon.primary },
  tabText: { fontSize: 11, fontWeight: '700', color: Colors.text.secondary },
  tabTextActive: { color: Colors.white },
  tabBadge: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  tabBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.text.muted },
  tabBadgeTextActive: { color: Colors.white },

  /* Type Chips */
  chipScroll: { maxHeight: 40, flexGrow: 0 },
  chipRow: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.maroon.primary, borderColor: Colors.maroon.primary },
  chipText: { fontSize: 12, color: Colors.text.secondary, fontWeight: '600' },
  chipTextActive: { color: Colors.white },

  resultLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },

  list: { padding: 16, paddingTop: 8, paddingBottom: 100 },

  /* FAB */
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.maroon.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.maroon.dark,
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  /* Modal */
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 24,
    paddingBottom: 36,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: Colors.text.primary },

  fieldLabel: { fontSize: 12, fontWeight: '700', color: Colors.text.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
  required: { color: Colors.status.missing },

  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  typeChipActive: { borderColor: Colors.maroon.primary, backgroundColor: Colors.maroon.muted },
  typeChipText: { fontSize: 12, color: Colors.text.secondary, fontWeight: '600' },
  typeChipTextActive: { color: Colors.maroon.primary },

  textField: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: Colors.text.primary, backgroundColor: Colors.background,
  },
  textFieldError: { borderColor: Colors.status.missing, backgroundColor: '#FFF5F5' },

  uploadArea: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.maroon.light,
    borderRadius: 12, padding: 22, alignItems: 'center', gap: 6,
    backgroundColor: Colors.maroon.surface, marginTop: 2,
  },
  uploadAreaError: { borderColor: Colors.status.missing, backgroundColor: '#FFF5F5' },
  uploadAreaDone: { borderColor: Colors.status.submitted, backgroundColor: '#F1F8E9', borderStyle: 'solid' },
  uploadLabel: { fontSize: 14, fontWeight: '700', color: Colors.maroon.primary },
  uploadSub: { fontSize: 12, color: Colors.text.muted },
  uploadFilename: { fontSize: 13, fontWeight: '700', color: Colors.status.submitted, textAlign: 'center' },
  uploadChangeTap: { fontSize: 11, color: Colors.text.muted },

  noticeBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.maroon.surface, borderRadius: 8,
    padding: 12, marginTop: 14, marginBottom: 14,
  },
  noticeText: { flex: 1, fontSize: 12, color: Colors.maroon.primary, lineHeight: 17 },

  /* Upload Progress */
  uploadProgress: { alignItems: 'center', paddingVertical: 16 },
  uploadProgressIcon: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.maroon.muted,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 18,
  },
  uploadProgressTitle: { fontSize: 18, fontWeight: '800', color: Colors.text.primary, marginBottom: 6 },
  uploadProgressSub: { fontSize: 13, color: Colors.maroon.primary, fontWeight: '600', marginBottom: 6 },
  uploadProgressHint: { fontSize: 11, color: Colors.text.muted, marginTop: 14, textAlign: 'center' },
});
