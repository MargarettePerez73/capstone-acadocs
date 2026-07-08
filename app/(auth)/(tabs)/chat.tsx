import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/ui/Header';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useDrawer } from '@/context/DrawerContext';
import { useToast } from '@/context/ToastContext';
import { Colors } from '@/constants/Colors';
import { CHAT_MESSAGES, ChatMessage } from '@/data/mockData';

interface Contact {
  userId: string;
  name: string;
  role: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

const ALL_CONTACTS: Contact[] = [
  { userId: '1', name: 'Dr. Rosa Bautista', role: 'Principal', lastMessage: 'Please use the updated DepEd template.', timestamp: '08:05', unread: 0, online: true },
  { userId: 't2', name: 'Ms. Carla Bautista', role: 'Teacher — Science', lastMessage: 'May I request an extension?', timestamp: '09:00', unread: 1, online: false },
  { userId: 't3', name: 'Mr. Rico Santos', role: 'Teacher — English', lastMessage: '', timestamp: '', unread: 0, online: true },
  { userId: 't4', name: 'Ms. Grace Flores', role: 'Teacher — Filipino', lastMessage: '', timestamp: '', unread: 0, online: false },
  { userId: '3', name: 'Ms. Ana Reyes', role: 'ADAS', lastMessage: '', timestamp: '', unread: 0, online: true },
];

export default function ChatScreen() {
  const { user } = useAuth();
  const { toggleDrawer } = useDrawer();
  const toast = useToast();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_MESSAGES);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const myId = user?.id ?? '';

  const contacts = ALL_CONTACTS.filter(c => c.userId !== myId);

  const conversationMessages = selectedContact
    ? messages.filter(
        m =>
          (m.senderId === myId && m.receiverId === selectedContact.userId) ||
          (m.receiverId === myId && m.senderId === selectedContact.userId)
      )
    : [];

  const totalUnread = contacts.reduce((s, c) => s + c.unread, 0);

  const handleSend = (text: string) => {
    if (!selectedContact) return;
    setSending(true);
    const newMsg: ChatMessage = {
      id: `cm${Date.now()}`,
      senderId: myId,
      senderName: user?.name ?? '',
      receiverId: selectedContact.userId,
      receiverName: selectedContact.name,
      message: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setTimeout(() => {
      setMessages(prev => [...prev, newMsg]);
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }, 350);
  };

  const getInitials = (name: string) =>
    name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  /* ── Conversation View ── */
  if (selectedContact) {
    return (
      <View style={styles.flex}>
        <Header
          title={selectedContact.name}
          subtitle={selectedContact.role}
          showBack
          onBack={() => setSelectedContact(null)}
        />

        {/* Online Status Bar */}
        <View style={[styles.statusBar, { backgroundColor: selectedContact.online ? '#E8F5E9' : Colors.background }]}>
          <View style={[styles.statusDot, { backgroundColor: selectedContact.online ? Colors.status.submitted : Colors.text.muted }]} />
          <Text style={[styles.statusText, { color: selectedContact.online ? Colors.status.submitted : Colors.text.muted }]}>
            {selectedContact.online ? 'Online now' : 'Offline'}
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {conversationMessages.length === 0 && (
            <EmptyState
              icon="chatbubble-ellipses-outline"
              title="No messages yet"
              subtitle={`Start a conversation with ${selectedContact.name.split(' ')[0]}.`}
            />
          )}
          {conversationMessages.map(m => (
            <ChatBubble
              key={m.id}
              message={m.message}
              senderName={m.senderName}
              timestamp={m.timestamp}
              isMine={m.senderId === myId}
            />
          ))}
          {sending && (
            <View style={styles.sendingIndicator}>
              <ActivityIndicator size="small" color={Colors.maroon.primary} />
              <Text style={styles.sendingText}>Sending...</Text>
            </View>
          )}
        </ScrollView>
        <ChatInput onSend={handleSend} />
      </View>
    );
  }

  /* ── Contact List View ── */
  return (
    <View style={styles.flex}>
      <Header
        title="Chat"
        subtitle="Messages & Correspondence"
        showMenu
        onMenuPress={toggleDrawer}
        badge={totalUnread}
      />

      {/* Summary */}
      {totalUnread > 0 && (
        <View style={styles.unreadBanner}>
          <Ionicons name="mail-unread-outline" size={16} color={Colors.maroon.primary} />
          <Text style={styles.unreadBannerText}>
            You have {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}.
          </Text>
        </View>
      )}

      <FlatList
        data={contacts}
        keyExtractor={i => i.userId}
        contentContainerStyle={styles.contactList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No contacts available"
            subtitle="There are no other users to message at this time."
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => setSelectedContact(item)}
            activeOpacity={0.75}
          >
            <View style={styles.avatarWrap}>
              <View style={[styles.avatar, item.unread > 0 && styles.avatarUnread]}>
                <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
              </View>
              <View style={[styles.onlineDot, { backgroundColor: item.online ? Colors.status.submitted : Colors.border }]} />
            </View>
            <View style={styles.contactInfo}>
              <View style={styles.contactTopRow}>
                <Text style={[styles.contactName, item.unread > 0 && styles.contactNameBold]}>
                  {item.name}
                </Text>
                {item.timestamp ? (
                  <Text style={[styles.contactTime, item.unread > 0 && styles.contactTimeUnread]}>
                    {item.timestamp}
                  </Text>
                ) : null}
              </View>
              <View style={styles.contactBottomRow}>
                <Text style={[styles.contactRole]}>{item.role}</Text>
              </View>
              {item.lastMessage ? (
                <Text
                  style={[styles.contactPreview, item.unread > 0 && styles.contactPreviewUnread]}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
              ) : (
                <Text style={styles.contactNoMessage}>No messages yet — tap to start</Text>
              )}
            </View>
            {item.unread > 0 && (
              <View style={styles.unreadPill}>
                <Text style={styles.unreadPillText}>{item.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },

  /* Contact List */
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.maroon.muted,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  unreadBannerText: { fontSize: 13, color: Colors.maroon.primary, fontWeight: '600' },
  contactList: { paddingBottom: 24 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 78 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.maroon.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarUnread: { backgroundColor: Colors.maroon.dark },
  avatarText: { fontSize: 17, fontWeight: '800', color: Colors.white },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  contactInfo: { flex: 1, minWidth: 0 },
  contactTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  contactName: { fontSize: 15, fontWeight: '600', color: Colors.text.primary, flex: 1, marginRight: 8 },
  contactNameBold: { fontWeight: '800' },
  contactTime: { fontSize: 11, color: Colors.text.muted, flexShrink: 0 },
  contactTimeUnread: { color: Colors.maroon.primary, fontWeight: '700' },
  contactBottomRow: { marginBottom: 2 },
  contactRole: { fontSize: 11, color: Colors.maroon.primary, fontWeight: '600' },
  contactPreview: { fontSize: 12, color: Colors.text.muted },
  contactPreviewUnread: { color: Colors.text.primary, fontWeight: '600' },
  contactNoMessage: { fontSize: 11, color: Colors.text.muted, fontStyle: 'italic' },
  unreadPill: {
    backgroundColor: Colors.maroon.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 22,
    alignItems: 'center',
  },
  unreadPillText: { color: Colors.white, fontSize: 11, fontWeight: '800' },

  /* Conversation */
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  messageList: { padding: 16, paddingBottom: 16, flexGrow: 1 },
  sendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
  },
  sendingText: { fontSize: 12, color: Colors.text.muted },
});
