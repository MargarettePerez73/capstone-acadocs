import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import InlineError from '@/components/ui/InlineError';
import { useAuth } from '@/context/AuthContext';
import { useDrawer } from '@/context/DrawerContext';
import { useToast } from '@/context/ToastContext';
import { Colors } from '@/constants/Colors';

type Condition = 'Good' | 'Fair' | 'Poor' | 'For Repair';

interface PropertyItem {
  id: string;
  name: string;
  quantity: number;
  condition: Condition;
  remarks: string;
}

interface Room {
  id: string;
  name: string;
  assignedTo: string;
  gradeSection: string;
  items: PropertyItem[];
}

const INITIAL_ROOMS: Room[] = [
  {
    id: 'r1', name: 'Room 101', assignedTo: 'Mr. Juan Dela Cruz', gradeSection: 'Grade 7 - Rizal',
    items: [
      { id: 'i1', name: 'Student Chairs', quantity: 45, condition: 'Good', remarks: '' },
      { id: 'i2', name: "Teacher's Table & Chair", quantity: 1, condition: 'Good', remarks: '' },
      { id: 'i3', name: 'Whiteboard', quantity: 1, condition: 'Fair', remarks: 'Minor scratches' },
      { id: 'i4', name: 'Electric Fan', quantity: 2, condition: 'Good', remarks: '' },
      { id: 'i5', name: 'Bulletin Board', quantity: 1, condition: 'Good', remarks: '' },
    ],
  },
  {
    id: 'r2', name: 'Room 102', assignedTo: 'Ms. Carla Bautista', gradeSection: 'Grade 8 - Bonifacio',
    items: [
      { id: 'i6', name: 'Student Chairs', quantity: 40, condition: 'Fair', remarks: '3 units need repainting' },
      { id: 'i7', name: "Teacher's Table & Chair", quantity: 1, condition: 'Good', remarks: '' },
      { id: 'i8', name: 'Whiteboard', quantity: 1, condition: 'Good', remarks: '' },
      { id: 'i9', name: 'Electric Fan', quantity: 2, condition: 'Poor', remarks: 'One unit not working' },
      { id: 'i10', name: 'Projector Screen', quantity: 1, condition: 'For Repair', remarks: 'Screen torn — needs replacement' },
    ],
  },
  {
    id: 'r3', name: 'Room 103', assignedTo: 'Mr. Rico Santos', gradeSection: 'Grade 9 - Mabini',
    items: [
      { id: 'i11', name: 'Student Chairs', quantity: 42, condition: 'Good', remarks: '' },
      { id: 'i12', name: "Teacher's Table & Chair", quantity: 1, condition: 'Good', remarks: '' },
      { id: 'i13', name: 'Whiteboard', quantity: 1, condition: 'Good', remarks: '' },
      { id: 'i14', name: 'Electric Fan', quantity: 3, condition: 'Good', remarks: '' },
      { id: 'i15', name: 'Locker Cabinet', quantity: 1, condition: 'Fair', remarks: 'Lock needs replacement' },
    ],
  },
];

const CONDITION_CONFIG: Record<Condition, { color: string; bg: string }> = {
  'Good':       { color: Colors.status.submitted, bg: '#E8F5E9' },
  'Fair':       { color: '#F57F17',               bg: '#FFF8E1' },
  'Poor':       { color: Colors.status.missing,   bg: '#FFEBEE' },
  'For Repair': { color: Colors.status.flagged,   bg: '#F3E5F5' },
};

const CONDITIONS: Condition[] = ['Good', 'Fair', 'Poor', 'For Repair'];

export default function RoomAuditScreen() {
  const { user } = useAuth();
  const { toggleDrawer } = useDrawer();
  const toast = useToast();

  const isPrincipal = user?.role === 'principal' || user?.role === 'adas';

  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [expandedRoom, setExpandedRoom] = useState<string | null>('r1');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<{ roomId: string; item: PropertyItem } | null>(null);
  const [editQty, setEditQty] = useState('');
  const [editCondition, setEditCondition] = useState<Condition>('Good');
  const [editRemarks, setEditRemarks] = useState('');
  const [qtyError, setQtyError] = useState('');

  const totalItems = rooms.reduce((a, r) => a + r.items.length, 0);
  const forRepair = rooms.reduce((a, r) => a + r.items.filter(i => i.condition === 'For Repair' || i.condition === 'Poor').length, 0);

  const handleEditItem = (roomId: string, item: PropertyItem) => {
    setEditItem({ roomId, item });
    setEditQty(String(item.quantity));
    setEditCondition(item.condition);
    setEditRemarks(item.remarks);
    setQtyError('');
    setShowEditModal(true);
  };

  const handleSave = () => {
    if (!editQty.trim() || isNaN(Number(editQty)) || Number(editQty) < 0) {
      setQtyError('Please enter a valid quantity.');
      return;
    }
    if (!editItem) return;
    setRooms(prev =>
      prev.map(r =>
        r.id === editItem.roomId
          ? { ...r, items: r.items.map(i => i.id === editItem.item.id
              ? { ...i, quantity: Number(editQty), condition: editCondition, remarks: editRemarks }
              : i) }
          : r
      )
    );
    toast.success('Property updated', `${editItem.item.name} record has been saved.`);
    setShowEditModal(false);
  };

  const handleFlagIssue = (room: Room, item: PropertyItem) => {
    toast.warning('Issue flagged', `"${item.name}" in ${room.name} has been flagged and reported to the Principal.`);
  };

  return (
    <View style={styles.flex}>
      <Header
        title="Room Audit"
        subtitle="Property Inventory per Classroom"
        showMenu
        onMenuPress={toggleDrawer}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { flex: 1.5 }]}>
            <MaterialCommunityIcons name="office-building" size={22} color={Colors.maroon.primary} />
            <Text style={styles.summaryValue}>{rooms.length}</Text>
            <Text style={styles.summaryLabel}>Classrooms</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="clipboard-list-outline" size={22} color={Colors.maroon.primary} />
            <Text style={styles.summaryValue}>{totalItems}</Text>
            <Text style={styles.summaryLabel}>Total Items</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftWidth: 2, borderLeftColor: forRepair > 0 ? Colors.status.missing : Colors.border }]}>
            <Ionicons name="warning-outline" size={22} color={forRepair > 0 ? Colors.status.missing : Colors.text.muted} />
            <Text style={[styles.summaryValue, { color: forRepair > 0 ? Colors.status.missing : Colors.text.primary }]}>{forRepair}</Text>
            <Text style={styles.summaryLabel}>Need Attention</Text>
          </View>
        </View>

        {/* Room list */}
        {rooms.map(room => {
          const isExpanded = expandedRoom === room.id;
          const roomForRepair = room.items.filter(i => i.condition === 'For Repair' || i.condition === 'Poor').length;
          return (
            <View key={room.id} style={styles.roomCard}>
              <TouchableOpacity
                style={styles.roomHeader}
                onPress={() => setExpandedRoom(isExpanded ? null : room.id)}
                activeOpacity={0.8}
              >
                <View style={styles.roomIconWrap}>
                  <MaterialCommunityIcons name="door-open" size={22} color={Colors.maroon.primary} />
                </View>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomTeacher}>{room.assignedTo} · {room.gradeSection}</Text>
                </View>
                <View style={styles.roomRight}>
                  {roomForRepair > 0 && (
                    <View style={styles.alertBadge}>
                      <Text style={styles.alertBadgeText}>{roomForRepair}</Text>
                    </View>
                  )}
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.text.muted} />
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.itemsContainer}>
                  {room.items.map((item, idx) => {
                    const cfg = CONDITION_CONFIG[item.condition];
                    return (
                      <View key={item.id} style={[styles.itemRow, idx < room.items.length - 1 && styles.itemBorder]}>
                        <View style={styles.itemMain}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                          {item.remarks ? <Text style={styles.itemRemarks}>{item.remarks}</Text> : null}
                        </View>
                        <View style={styles.itemRight}>
                          <View style={[styles.conditionBadge, { backgroundColor: cfg.bg }]}>
                            <Text style={[styles.conditionText, { color: cfg.color }]}>{item.condition}</Text>
                          </View>
                          <View style={styles.itemActions}>
                            <TouchableOpacity style={styles.iconBtn} onPress={() => handleEditItem(room.id, item)}>
                              <Ionicons name="pencil-outline" size={15} color={Colors.maroon.primary} />
                            </TouchableOpacity>
                            {(item.condition === 'Poor' || item.condition === 'For Repair') && (
                              <TouchableOpacity style={[styles.iconBtn, { borderColor: Colors.status.missing }]} onPress={() => handleFlagIssue(room, item)}>
                                <Ionicons name="flag-outline" size={15} color={Colors.status.missing} />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Edit modal */}
      <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Edit Property Item</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            {editItem && <Text style={styles.sheetSubtitle}>{editItem.item.name}</Text>}

            <Text style={styles.fieldLabel}>Quantity <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.textField, qtyError ? styles.textFieldError : null]}
              value={editQty}
              onChangeText={v => { setEditQty(v); if (qtyError) setQtyError(''); }}
              placeholder="e.g. 45"
              placeholderTextColor={Colors.text.muted}
              keyboardType="number-pad"
            />
            <InlineError message={qtyError} />

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Condition</Text>
            <View style={styles.conditionRow}>
              {CONDITIONS.map(c => {
                const cfg = CONDITION_CONFIG[c];
                const active = editCondition === c;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[styles.conditionChip, active && { backgroundColor: cfg.bg, borderColor: cfg.color }]}
                    onPress={() => setEditCondition(c)}
                  >
                    <Text style={[styles.conditionChipText, active && { color: cfg.color, fontWeight: '800' }]}>{c}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Remarks</Text>
            <TextInput
              style={[styles.textField, styles.textArea]}
              value={editRemarks}
              onChangeText={setEditRemarks}
              placeholder="Optional notes about this item..."
              placeholderTextColor={Colors.text.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
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

  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 12, padding: 12,
    alignItems: 'center', gap: 4, elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  summaryValue: { fontSize: 22, fontWeight: '800', color: Colors.text.primary },
  summaryLabel: { fontSize: 10, color: Colors.text.muted, fontWeight: '600', textAlign: 'center' },

  roomCard: {
    backgroundColor: Colors.white, borderRadius: 14, marginBottom: 12,
    overflow: 'hidden', elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  roomHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  roomIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.maroon.muted, alignItems: 'center', justifyContent: 'center' },
  roomInfo: { flex: 1 },
  roomName: { fontSize: 15, fontWeight: '800', color: Colors.text.primary },
  roomTeacher: { fontSize: 12, color: Colors.text.muted, marginTop: 2 },
  roomRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertBadge: { backgroundColor: Colors.status.missing, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  alertBadgeText: { color: Colors.white, fontSize: 11, fontWeight: '800' },

  itemsContainer: { borderTopWidth: 1, borderTopColor: Colors.border },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemMain: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '700', color: Colors.text.primary },
  itemQty: { fontSize: 12, color: Colors.text.muted, marginTop: 2 },
  itemRemarks: { fontSize: 11, color: Colors.status.missing, marginTop: 4, fontStyle: 'italic' },
  itemRight: { alignItems: 'flex-end', gap: 8 },
  conditionBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  conditionText: { fontSize: 11, fontWeight: '700' },
  itemActions: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 32, height: 32, borderRadius: 8, borderWidth: 1.5,
    borderColor: Colors.maroon.primary, alignItems: 'center', justifyContent: 'center',
  },

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
  textFieldError: { borderColor: Colors.status.missing, backgroundColor: '#FFF5F5' },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  conditionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  conditionChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  conditionChipText: { fontSize: 13, fontWeight: '600', color: Colors.text.secondary },
});
