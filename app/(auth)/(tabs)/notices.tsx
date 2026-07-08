import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal,
  TextInput, Linking, Alert,
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
import { ANNOUNCEMENTS, LINKS, Announcement } from '@/data/mockData';

export default function NoticesScreen() {
  const { user } = useAuth();
  const { toggleDrawer } = useDrawer();
  const toast = useToast();

  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', priority: 'normal' as 'high' | 'normal' });
  const [titleError, setTitleError] = useState('');
  const [bodyError, setBodyError] = useState('');

  const isAdmin = user?.role === 'principal' || user?.role === 'adas';

  const validate = () => {
    let valid = true;
    if (!form.title.trim()) { setTitleError('Announcement title is required.'); valid = false; }
    else setTitleError('');
    if (!form.body.trim()) { setBodyError('Announcement message is required.'); valid = false; }
    else setBodyError('');
    return valid;
  };

  const handlePost = () => {
    if (!validate()) {
      toast.warning('Incomplete form', 'Please fill in all required fields.');
      return;
    }
    const newAnnouncement: Announcement = {
      id: `a${Date.now()}`,
      title: form.title.trim(),
      body: form.body.trim(),
      createdBy: user?.name ?? 'Admin',
      createdAt: new Date().toISOString().split('T')[0],
      priority: form.priority,
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setShowModal(false);
    setForm({ title: '', body: '', priority: 'normal' });
    setTitleError('');
    setBodyError('');
    toast.success('Announcement posted', `"${newAnnouncement.title}" is now visible to all users.`);
  };

  const handleOpenLink = (url: string, label: string) => {
    Linking.openURL(url).catch(() =>
      toast.info('Demo mode', `"${label}" link is not available in the demo environment.`)
    );
  };

  return (
    <View style={styles.flex}>
      <Header
        title="Notices"
        subtitle="Announcements & Quick Links"
        showMenu
        onMenuPress={toggleDrawer}
        rightIcon={isAdmin ? 'add-circle-outline' : undefined}
        onRightPress={isAdmin ? () => setShowModal(true) : undefined}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Announcements */}
        <Text style={styles.sectionLabel}>Announcements</Text>
        {announcements.map(a => (
          <View key={a.id} style={[styles.announcementCard, a.priority === 'high' && styles.urgentCard]}>
            {a.priority === 'high' && (
              <View style={styles.urgentBadge}>
                <Ionicons name="alert-circle" size={12} color={Colors.white} />
                <Text style={styles.urgentText}>Urgent</Text>
              </View>
            )}
            <Text style={styles.announcementTitle}>{a.title}</Text>
            <Text style={styles.announcementBody}>{a.body}</Text>
            <View style={styles.announcementFooter}>
              <Ionicons name="person-outline" size={12} color={Colors.text.muted} />
              <Text style={styles.meta}>{a.createdBy}</Text>
              <Ionicons name="calendar-outline" size={12} color={Colors.text.muted} style={{ marginLeft: 8 }} />
              <Text style={styles.meta}>{a.createdAt}</Text>
            </View>
          </View>
        ))}

        {/* Quick Links */}
        <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Quick Links</Text>
        {LINKS.map(link => (
          <TouchableOpacity
            key={link.id}
            onPress={() => handleOpenLink(link.url, link.label)}
            activeOpacity={0.78}
          >
            <Card style={styles.linkCard}>
              <View style={styles.linkRow}>
                <View style={styles.linkIconWrap}>
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
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Post Announcement</Text>
              <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.textField, titleError ? styles.textFieldError : null]}
              value={form.title}
              onChangeText={v => { setForm(p => ({ ...p, title: v })); if (titleError && v.trim()) setTitleError(''); }}
              placeholder="e.g. DLL Submission Reminder"
              placeholderTextColor={Colors.text.muted}
            />
            <InlineError message={titleError} />

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Message <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.textField, styles.textArea, bodyError ? styles.textFieldError : null]}
              value={form.body}
              onChangeText={v => { setForm(p => ({ ...p, body: v })); if (bodyError && v.trim()) setBodyError(''); }}
              placeholder="Write the announcement message here..."
              placeholderTextColor={Colors.text.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <InlineError message={bodyError} />

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Priority Level</Text>
            <View style={styles.priorityRow}>
              {(['normal', 'high'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityChip,
                    form.priority === p && {
                      borderColor: p === 'high' ? Colors.status.missing : Colors.maroon.primary,
                      backgroundColor: p === 'high' ? '#FFEBEE' : Colors.maroon.muted,
                    },
                  ]}
                  onPress={() => setForm(f => ({ ...f, priority: p }))}
                >
                  {p === 'high' && <Ionicons name="alert-circle" size={14} color={form.priority === p ? Colors.status.missing : Colors.text.muted} />}
                  <Text style={[
                    styles.priorityText,
                    form.priority === p && { color: p === 'high' ? Colors.status.missing : Colors.maroon.primary, fontWeight: '700' },
                  ]}>
                    {p === 'high' ? 'Urgent' : 'Normal'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button label="Post Announcement" onPress={handlePost} fullWidth style={{ marginTop: 8 }} />
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

  announcementCard: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 16,
    marginBottom: 10, elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  urgentCard: { borderLeftWidth: 3, borderLeftColor: Colors.status.missing },
  urgentBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.status.missing, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8,
  },
  urgentText: { color: Colors.white, fontSize: 10, fontWeight: '800' },
  announcementTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, marginBottom: 6 },
  announcementBody: { fontSize: 13, color: Colors.text.secondary, lineHeight: 20, marginBottom: 12 },
  announcementFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
  meta: { fontSize: 11, color: Colors.text.muted, marginRight: 4 },

  linkCard: { marginBottom: 8 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  linkIconWrap: { width: 38, height: 38, backgroundColor: Colors.maroon.muted, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  linkInfo: { flex: 1 },
  linkLabel: { fontSize: 14, fontWeight: '600', color: Colors.text.primary },
  linkCategory: { fontSize: 11, color: Colors.text.muted, marginTop: 2 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 24, paddingBottom: 36 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: Colors.text.primary },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: Colors.text.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
  required: { color: Colors.status.missing },
  textField: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: Colors.text.primary, backgroundColor: Colors.background,
  },
  textFieldError: { borderColor: Colors.status.missing, backgroundColor: '#FFF5F5' },
  textArea: { minHeight: 110, textAlignVertical: 'top' },
  priorityRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  priorityChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border,
  },
  priorityText: { fontSize: 14, fontWeight: '600', color: Colors.text.secondary },
});
