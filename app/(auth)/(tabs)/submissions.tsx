import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal,
  TextInput, Alert, FlatList,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '@/components/ui/Header';
import SubmissionCard from '@/components/submissions/SubmissionCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useDrawer } from '@/context/DrawerContext';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { SUBMISSIONS, Submission } from '@/data/mockData';

type FilterStatus = 'all' | 'submitted' | 'pending' | 'missing';
type FilterType = 'all' | 'DLL' | 'Lesson Plan' | 'Monthly Test';

export default function SubmissionsScreen() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchText, setSearchText] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [docType, setDocType] = useState<'DLL' | 'Lesson Plan' | 'Monthly Test'>('DLL');
  const [week, setWeek] = useState('Week 1');
  const [uploading, setUploading] = useState(false);

  const { toggleDrawer } = useDrawer();
  const isTeacher = user?.role === 'teacher';

  const filtered = SUBMISSIONS.filter(s => {
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchType = filterType === 'all' || s.type === filterType;
    const matchSearch = !searchText || s.teacherName.toLowerCase().includes(searchText.toLowerCase()) ||
      s.subject.toLowerCase().includes(searchText.toLowerCase());
    const matchTeacher = !isTeacher || s.teacherId === 't1';
    return matchStatus && matchType && matchSearch && matchTeacher;
  });

  const handleSubmit = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setShowSubmitModal(false);
      Alert.alert('Submitted', 'Your document has been submitted and is being scanned for plagiarism.');
    }, 1800);
  };

  const statusFilters: FilterStatus[] = ['all', 'submitted', 'pending', 'missing'];
  const typeFilters: FilterType[] = ['all', 'DLL', 'Lesson Plan', 'Monthly Test'];

  return (
    <View style={styles.flex}>
      <Header
        title="Submissions"
        subtitle={isTeacher ? 'My Documents' : 'All Documents'}
        showMenu
        onMenuPress={toggleDrawer}
        rightIcon="add-circle-outline"
        onRightPress={isTeacher ? () => setShowSubmitModal(true) : undefined}
      />

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={Colors.text.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search teacher or subject..."
          placeholderTextColor={Colors.text.muted}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={16} color={Colors.text.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {statusFilters.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filterStatus === f && styles.filterChipActive]}
            onPress={() => setFilterStatus(f)}
          >
            <Text style={[styles.filterText, filterStatus === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.divider} />
        {typeFilters.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filterType === f && styles.filterChipType]}
            onPress={() => setFilterType(f)}
          >
            <Text style={[styles.filterText, filterType === f && styles.filterTextType]}>
              {f === 'all' ? 'All Types' : f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.resultCount}>{filtered.length} document{filtered.length !== 1 ? 's' : ''}</Text>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={({ item }) => <SubmissionCard item={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="file-search-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No documents found</Text>
          </View>
        }
      />

      {isTeacher && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowSubmitModal(true)}>
          <Ionicons name="add" size={26} color={Colors.white} />
        </TouchableOpacity>
      )}

      {/* Submit Modal */}
      <Modal visible={showSubmitModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Document</Text>
              <TouchableOpacity onPress={() => setShowSubmitModal(false)}>
                <Ionicons name="close" size={22} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Document Type</Text>
            <View style={styles.typeRow}>
              {(['DLL', 'Lesson Plan', 'Monthly Test'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, docType === t && styles.typeChipActive]}
                  onPress={() => setDocType(t)}
                >
                  <Text style={[styles.typeChipText, docType === t && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Week / Period</Text>
            <TextInput style={styles.textField} value={week} onChangeText={setWeek} placeholder="e.g. Week 1" placeholderTextColor={Colors.text.muted} />

            <TouchableOpacity style={styles.uploadArea} onPress={() => Alert.alert('File Picker', 'In production, this opens the device document picker.')}>
              <MaterialCommunityIcons name="file-upload-outline" size={36} color={Colors.maroon.primary} />
              <Text style={styles.uploadLabel}>Tap to select file</Text>
              <Text style={styles.uploadSub}>PDF, DOCX up to 25 MB</Text>
            </TouchableOpacity>

            <View style={styles.plagNotice}>
              <MaterialCommunityIcons name="shield-search" size={16} color={Colors.maroon.primary} />
              <Text style={styles.plagNoticeText}>Document will be automatically scanned for plagiarism upon submission.</Text>
            </View>

            <Button label={uploading ? 'Submitting...' : 'Submit Document'} onPress={handleSubmit} loading={uploading} fullWidth />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchIcon: { marginRight: 2 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text.primary },
  filterScroll: { maxHeight: 44, flexGrow: 0 },
  filterContent: { paddingHorizontal: 16, alignItems: 'center', gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.maroon.primary, borderColor: Colors.maroon.primary },
  filterChipType: { backgroundColor: '#E3F2FD', borderColor: '#1565C0' },
  filterText: { fontSize: 12, color: Colors.text.secondary, fontWeight: '600' },
  filterTextActive: { color: Colors.white },
  filterTextType: { color: '#1565C0' },
  divider: { width: 1, height: 20, backgroundColor: Colors.border, marginHorizontal: 4 },
  resultCount: { fontSize: 12, color: Colors.text.muted, paddingHorizontal: 16, marginTop: 8, marginBottom: 4 },
  list: { padding: 16, paddingTop: 8, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.text.muted },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.maroon.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.maroon.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.text.primary, marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 18, flexWrap: 'wrap' },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: Colors.border },
  typeChipActive: { borderColor: Colors.maroon.primary, backgroundColor: Colors.maroon.muted },
  typeChipText: { fontSize: 13, color: Colors.text.secondary, fontWeight: '600' },
  typeChipTextActive: { color: Colors.maroon.primary },
  textField: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
    color: Colors.text.primary, marginBottom: 18, backgroundColor: Colors.background,
  },
  uploadArea: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.maroon.light,
    borderRadius: 10, padding: 24, alignItems: 'center', gap: 6, marginBottom: 16,
    backgroundColor: Colors.maroon.surface,
  },
  uploadLabel: { fontSize: 14, fontWeight: '600', color: Colors.maroon.primary },
  uploadSub: { fontSize: 12, color: Colors.text.muted },
  plagNotice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.maroon.surface, borderRadius: 8,
    padding: 12, marginBottom: 18,
  },
  plagNoticeText: { flex: 1, fontSize: 12, color: Colors.maroon.primary, lineHeight: 17 },
});
