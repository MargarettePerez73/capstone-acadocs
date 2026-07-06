import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal,
  TextInput, Alert, Linking, FlatList,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useDrawer } from '@/context/DrawerContext';
import { Colors } from '@/constants/Colors';
import { ANNOUNCEMENTS, LINKS, Announcement, Link } from '@/data/mockData';

export default function AnnouncementsScreen() {
  const { user } = useAuth();
  const { toggleDrawer } = useDrawer();
  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', priority: 'normal' as 'high' | 'normal' });
  const isAdmin = user?.role === 'principal' || user?.role === 'adas';

  const handlePost = () => {
    if (!form.title || !form.body) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }
    const newAnnouncement: Announcement = {
      id: `a${Date.now()}`,
      title: form.title,
      body: form.body,
      createdBy: user?.name ?? 'Admin',
      createdAt: new Date().toISOString().split('T')[0],
      priority: form.priority,
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setShowModal(false);
    setForm({ title: '', body: '', priority: 'normal' });
  };

  return (
    <View style={styles.flex}>
      <Header
        title="Announcements"
        subtitle="Notices & Quick Links"
        showBack
        onBack={() => router.back()}
        rightIcon={isAdmin ? 'add-circle-outline' : undefined}
        onRightPress={isAdmin ? () => setShowModal(true) : undefined}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Announcements */}
        <Text style={styles.sectionLabel}>Announcements</Text>
        {announcements.map(a => (
          <Card key={a.id} style={a.priority === 'high' ? styles.highCard : undefined}>
            <View style={styles.announcementHeader}>
              {a.priority === 'high' && (
                <View style={styles.urgentBadge}>
                  <Ionicons name="alert-circle" size={12} color={Colors.white} />
                  <Text style={styles.urgentText}>Urgent</Text>
                </View>
              )}
            </View>
            <Text style={styles.announcementTitle}>{a.title}</Text>
            <Text style={styles.announcementBody}>{a.body}</Text>
            <View style={styles.announcementFooter}>
              <Ionicons name="person-outline" size={12} color={Colors.text.muted} />
              <Text style={styles.announcementMeta}>{a.createdBy}</Text>
              <Ionicons name="calendar-outline" size={12} color={Colors.text.muted} style={{ marginLeft: 8 }} />
              <Text style={styles.announcementMeta}>{a.createdAt}</Text>
            </View>
          </Card>
        ))}

        {/* Quick Links */}
        <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Quick Links</Text>
        {LINKS.map(link => (
          <TouchableOpacity
            key={link.id}
            onPress={() => Linking.openURL(link.url).catch(() => Alert.alert('Info', 'Cannot open this link in the demo.'))}
          >
            <Card style={styles.linkCard}>
              <View style={styles.linkRow}>
                <View style={styles.linkIcon}>
                  <MaterialCommunityIcons name="link-variant" size={18} color={Colors.maroon.primary} />
                </View>
                <View style={styles.linkInfo}>
                  <Text style={styles.linkLabel}>{link.label}</Text>
                  <Text style={styles.linkCategory}>{link.category}</Text>
                </View>
                <Ionicons name="open-outline" size={16} color={Colors.text.muted} />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Post Announcement Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Post Announcement</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={22} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.textField}
              value={form.title}
              onChangeText={v => setForm(p => ({ ...p, title: v }))}
              placeholder="Announcement title"
              placeholderTextColor={Colors.text.muted}
            />

            <Text style={styles.fieldLabel}>Message</Text>
            <TextInput
              style={[styles.textField, styles.textArea]}
              value={form.body}
              onChangeText={v => setForm(p => ({ ...p, body: v }))}
              placeholder="Announcement body..."
              placeholderTextColor={Colors.text.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.fieldLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {(['normal', 'high'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityChip, form.priority === p && styles.priorityChipActive(p)]}
                  onPress={() => setForm(f => ({ ...f, priority: p }))}
                >
                  <Text style={[styles.priorityText, form.priority === p && styles.priorityTextActive]}>
                    {p === 'high' ? 'Urgent' : 'Normal'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button label="Post Announcement" onPress={handlePost} fullWidth />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.text.primary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  highCard: { borderLeftWidth: 3, borderLeftColor: Colors.status.missing },
  announcementHeader: { marginBottom: 8 },
  urgentBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.status.missing, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start',
  },
  urgentText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  announcementTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, marginBottom: 6 },
  announcementBody: { fontSize: 13, color: Colors.text.secondary, lineHeight: 20, marginBottom: 12 },
  announcementFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
  announcementMeta: { fontSize: 11, color: Colors.text.muted, marginRight: 4 },
  linkCard: { marginBottom: 8 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  linkIcon: { width: 36, height: 36, backgroundColor: Colors.maroon.muted, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  linkInfo: { flex: 1 },
  linkLabel: { fontSize: 14, fontWeight: '600', color: Colors.text.primary },
  linkCategory: { fontSize: 11, color: Colors.text.muted, marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 36 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.text.primary, marginBottom: 8 },
  textField: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
    color: Colors.text.primary, marginBottom: 16, backgroundColor: Colors.background,
  },
  textArea: { minHeight: 100 },
  priorityRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  priorityChip: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  priorityChipActive: (p: string) => ({
    borderColor: p === 'high' ? Colors.status.missing : Colors.maroon.primary,
    backgroundColor: p === 'high' ? '#FFEBEE' : Colors.maroon.muted,
  }),
  priorityText: { fontSize: 14, fontWeight: '600', color: Colors.text.secondary },
  priorityTextActive: { color: Colors.text.primary },
});
