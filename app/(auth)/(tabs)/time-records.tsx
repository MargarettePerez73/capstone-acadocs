import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useDrawer } from '@/context/DrawerContext';
import { useToast } from '@/context/ToastContext';
import { Colors } from '@/constants/Colors';

interface TimeEntry {
  id: string;
  teacherName: string;
  subject: string;
  timeIn: string | null;
  timeOut: string | null;
  status: 'present' | 'late' | 'absent' | 'half-day';
}

const TODAY = '2025-01-07';

const DATES = ['2025-01-07', '2025-01-06', '2025-01-05', '2025-01-04', '2025-01-03'];

const RECORDS: Record<string, TimeEntry[]> = {
  '2025-01-07': [
    { id: '1', teacherName: 'Mr. Juan Dela Cruz', subject: 'Mathematics', timeIn: '07:42', timeOut: null, status: 'present' },
    { id: '2', teacherName: 'Ms. Carla Bautista', subject: 'Science', timeIn: '07:58', timeOut: null, status: 'present' },
    { id: '3', teacherName: 'Mr. Rico Santos', subject: 'English', timeIn: '08:21', timeOut: null, status: 'late' },
    { id: '4', teacherName: 'Ms. Grace Flores', subject: 'Filipino', timeIn: null, timeOut: null, status: 'absent' },
    { id: '5', teacherName: 'Mr. Noel Rivera', subject: 'Araling Panlipunan', timeIn: '07:55', timeOut: null, status: 'present' },
    { id: '6', teacherName: 'Ms. Donna Villanueva', subject: 'MAPEH', timeIn: '07:30', timeOut: null, status: 'present' },
  ],
  '2025-01-06': [
    { id: '1', teacherName: 'Mr. Juan Dela Cruz', subject: 'Mathematics', timeIn: '07:38', timeOut: '17:05', status: 'present' },
    { id: '2', teacherName: 'Ms. Carla Bautista', subject: 'Science', timeIn: '07:52', timeOut: '17:00', status: 'present' },
    { id: '3', teacherName: 'Mr. Rico Santos', subject: 'English', timeIn: '08:15', timeOut: '17:00', status: 'late' },
    { id: '4', teacherName: 'Ms. Grace Flores', subject: 'Filipino', timeIn: '07:45', timeOut: '12:30', status: 'half-day' },
    { id: '5', teacherName: 'Mr. Noel Rivera', subject: 'Araling Panlipunan', timeIn: '07:48', timeOut: '17:00', status: 'present' },
    { id: '6', teacherName: 'Ms. Donna Villanueva', subject: 'MAPEH', timeIn: '07:29', timeOut: '17:00', status: 'present' },
  ],
};

const STATUS_CONFIG: Record<TimeEntry['status'], { label: string; color: string; bg: string }> = {
  present:  { label: 'Present',  color: Colors.status.submitted, bg: '#E8F5E9' },
  late:     { label: 'Late',     color: '#F57F17',               bg: '#FFF8E1' },
  absent:   { label: 'Absent',   color: Colors.status.missing,   bg: '#FFEBEE' },
  'half-day': { label: 'Half-Day', color: Colors.status.flagged, bg: '#F3E5F5' },
};

function formatDate(d: string) {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TimeRecordsScreen() {
  const { toggleDrawer } = useDrawer();
  const toast = useToast();

  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [reported, setReported] = useState(false);

  const entries: TimeEntry[] = RECORDS[selectedDate] ?? [];

  const summary = {
    present: entries.filter(e => e.status === 'present').length,
    late:    entries.filter(e => e.status === 'late').length,
    absent:  entries.filter(e => e.status === 'absent').length,
    halfDay: entries.filter(e => e.status === 'half-day').length,
  };

  const handleEdit = (entry: TimeEntry) => {
    setEditEntry(entry);
    setTimeIn(entry.timeIn ?? '');
    setTimeOut(entry.timeOut ?? '');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!timeIn.trim()) {
      toast.warning('Required field', 'Please enter the time-in value.');
      return;
    }
    toast.success('Time record updated', `${editEntry?.teacherName} — time record saved successfully.`);
    setShowModal(false);
  };

  const handleSubmitReport = () => {
    setReported(true);
    toast.success('Daily report submitted', `Time-in report for ${formatDate(selectedDate)} has been forwarded to the Principal.`);
  };

  return (
    <View style={styles.flex}>
      <Header
        title="Time Records"
        subtitle="Daily Attendance Log"
        showMenu
        onMenuPress={toggleDrawer}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Date selector */}
        <Text style={styles.sectionLabel}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {DATES.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.dateChip, selectedDate === d && styles.dateChipActive]}
              onPress={() => { setSelectedDate(d); setReported(false); }}
            >
              <Text style={[styles.dateChipText, selectedDate === d && styles.dateChipTextActive]}>
                {d === TODAY ? 'Today' : formatDate(d).split(',')[0] + ', ' + formatDate(d).split(', ')[1]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary row */}
        <View style={styles.summaryRow}>
          {[
            { label: 'Present', value: summary.present, color: Colors.status.submitted },
            { label: 'Late',    value: summary.late,    color: '#F57F17' },
            { label: 'Absent',  value: summary.absent,  color: Colors.status.missing },
            { label: 'Half-Day',value: summary.halfDay, color: Colors.status.flagged },
          ].map(s => (
            <View key={s.label} style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Date heading */}
        <View style={styles.dateHeader}>
          <Ionicons name="calendar" size={15} color={Colors.maroon.primary} />
          <Text style={styles.dateHeaderText}>{formatDate(selectedDate)}</Text>
        </View>

        {/* Time entries */}
        {entries.length === 0 ? (
          <EmptyState
            icon="time-outline"
            title="No records for this date"
            subtitle="No time-in data is available for the selected date."
          />
        ) : entries.map(entry => {
          const cfg = STATUS_CONFIG[entry.status];
          return (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {entry.teacherName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </Text>
                </View>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryName}>{entry.teacherName}</Text>
                  <Text style={styles.entrySubject}>{entry.subject}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>
              <View style={styles.timeRow}>
                <View style={styles.timeItem}>
                  <Ionicons name="log-in-outline" size={14} color={Colors.text.muted} />
                  <Text style={styles.timeLabel}>Time In</Text>
                  <Text style={[styles.timeValue, !entry.timeIn && styles.timeMissing]}>
                    {entry.timeIn ?? '—'}
                  </Text>
                </View>
                <View style={styles.timeDivider} />
                <View style={styles.timeItem}>
                  <Ionicons name="log-out-outline" size={14} color={Colors.text.muted} />
                  <Text style={styles.timeLabel}>Time Out</Text>
                  <Text style={[styles.timeValue, !entry.timeOut && styles.timeMissing]}>
                    {entry.timeOut ?? (selectedDate === TODAY ? 'On duty' : '—')}
                  </Text>
                </View>
                <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(entry)}>
                  <Ionicons name="pencil-outline" size={15} color={Colors.maroon.primary} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Submit report button */}
        {entries.length > 0 && (
          <Button
            label={reported ? 'Report Submitted' : 'Submit Daily Report to Principal'}
            onPress={handleSubmitReport}
            fullWidth
            disabled={reported}
            style={[{ marginTop: 8 }, reported && { opacity: 0.6 }]}
            leftIcon={<Ionicons name={reported ? 'checkmark-circle' : 'send-outline'} size={18} color="#fff" />}
          />
        )}
      </ScrollView>

      {/* Edit modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Edit Time Record</Text>
              <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            {editEntry && (
              <Text style={styles.sheetSubtitle}>{editEntry.teacherName} · {formatDate(selectedDate)}</Text>
            )}

            <Text style={styles.fieldLabel}>Time In <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.textField}
              value={timeIn}
              onChangeText={setTimeIn}
              placeholder="e.g. 07:45"
              placeholderTextColor={Colors.text.muted}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Time Out</Text>
            <TextInput
              style={styles.textField}
              value={timeOut}
              onChangeText={setTimeOut}
              placeholder="e.g. 17:00 (leave blank if still on duty)"
              placeholderTextColor={Colors.text.muted}
              keyboardType="numbers-and-punctuation"
            />

            <Button label="Save Changes" onPress={handleSave} fullWidth style={{ marginTop: 20 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 13, fontWeight: '800', color: Colors.text.primary,
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6,
  },

  dateScroll: { marginBottom: 16 },
  dateChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
  },
  dateChipActive: { backgroundColor: Colors.maroon.primary, borderColor: Colors.maroon.primary },
  dateChipText: { fontSize: 13, fontWeight: '600', color: Colors.text.secondary },
  dateChipTextActive: { color: Colors.white },

  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 12, padding: 12,
    alignItems: 'center', elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: Colors.text.muted, fontWeight: '600', marginTop: 2, textAlign: 'center' },

  dateHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  dateHeaderText: { fontSize: 13, fontWeight: '700', color: Colors.maroon.primary },

  entryCard: {
    backgroundColor: Colors.white, borderRadius: 12, marginBottom: 10,
    overflow: 'hidden', elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  entryTop: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingBottom: 10 },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.maroon.muted,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '800', color: Colors.maroon.primary },
  entryInfo: { flex: 1 },
  entryName: { fontSize: 14, fontWeight: '700', color: Colors.text.primary },
  entrySubject: { fontSize: 12, color: Colors.text.muted, marginTop: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },

  timeRow: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  timeItem: { flex: 1, alignItems: 'center', gap: 2 },
  timeLabel: { fontSize: 10, color: Colors.text.muted, fontWeight: '600', textTransform: 'uppercase' },
  timeValue: { fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  timeMissing: { color: Colors.text.muted, fontStyle: 'italic', fontSize: 13 },
  timeDivider: { width: 1, height: 32, backgroundColor: Colors.border, marginHorizontal: 8 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1.5, borderColor: Colors.maroon.primary, marginLeft: 8,
  },
  editBtnText: { fontSize: 12, fontWeight: '700', color: Colors.maroon.primary },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 24, paddingBottom: 36 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: Colors.text.primary },
  sheetSubtitle: { fontSize: 13, color: Colors.text.muted, marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: Colors.text.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
  required: { color: Colors.status.missing },
  textField: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: Colors.text.primary, backgroundColor: Colors.background,
  },
});
