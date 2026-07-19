import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { RoleLabels } from '@/constants/Roles';
import { usersAPI, chatAPI } from '@/services/api';

interface ApiUser {
  id: number;
  full_name: string;
  role: string;
  email?: string | null;
  department?: string | null;
}

interface ApiMessage {
  id: number;
  sender_id: number;
  receiver_id: number | null;
  group_name: string;
  message: string;
  sender_name: string | null;
  sent_at: string;
  read_at: string | null;
}

interface Contact {
  userId: string;
  name: string;
  role: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

function formatTime(sentAt?: string): string {
  if (!sentAt) return '';
  const d = new Date(sentAt.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const contactKey = (a: string, b: string) => [a, b].sort().join('|');

export default function ChatScreen() {
  const { user } = useAuth();
  const { toggleDrawer } = useDrawer();
  const toast = useToast();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const myId = user?.id ?? '';

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [users, msgs] = await Promise.all([
        usersAPI.getAll(),
        chatAPI.getMessages(),
      ]);
      const userList = (users as ApiUser[]).filter(u => String(u.id) !== myId);
      const msgList = msgs as ApiMessage[];
      setMessages(msgList);
      setContacts(
        userList.map(u => {
          const convo = msgList
            .filter(m => {
              const k = contactKey(String(m.sender_id), String(m.receiver_id ?? ''));
              return k === contactKey(myId, String(u.id));
            })
            .sort((a, b) => a.id - b.id);
          const last = convo[convo.length - 1];
          const unread = msgList.filter(
            m => String(m.receiver_id) === myId && String(m.sender_id) === String(u.id) && !m.read_at
          ).length;
          return {
            userId: String(u.id),
            name: u.full_name,
            role: RoleLabels[(u.role as keyof typeof RoleLabels)] ?? u.role,
            lastMessage: last ? last.message : '',
            timestamp: last ? formatTime(last.sent_at) : '',
            unread,
            online: false,
          };
        })
      );
    } catch (e: any) {
      setError('Could not load messages. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [myId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const conversationMessages = selectedContact
    ? messages
        .filter(m => {
          const k = contactKey(String(m.sender_id), String(m.receiver_id ?? ''));
          return k === contactKey(myId, selectedContact.userId);
        })
        .sort((a, b) => a.id - b.id)
    : [];

  const totalUnread = contacts.reduce((s, c) => s + c.unread, 0);

  const handleSend = async (text: string) => {
    if (!selectedContact) return;
    setSending(true);
    try {
      const res = await chatAPI.sendMessage({
        sender_id: myId,
        receiver_id: selectedContact.userId,
        group_name: 'all',
        message: text,
        sender_name: user?.name ?? '',
      });
      const newMsg: ApiMessage = {
        id: Number(res.id ?? Date.now()),
        sender_id: Number(myId),
        receiver_id: Number(selectedContact.userId),
        group_name: 'all',
        message: text,
        sender_name: user?.name ?? '',
        sent_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        read_at: null,
      };
      setMessages(prev => [...prev, newMsg]);
      setContacts(prev =>
        prev.map(c =>
          c.userId === selectedContact.userId
            ? { ...c, lastMessage: text, timestamp: formatTime(newMsg.sent_at) }
            : c
        )
      );
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    } catch {
      toast.error('Send failed', 'Your message could not be saved.');
    } finally {
      setSending(false);
    }
  };

  const markRead = async (contactId: string) => {
    messages
      .filter(m => String(m.receiver_id) === myId && String(m.sender_id) === contactId && !m.read_at)
      .forEach(m => chatAPI.markAsRead(m.id).catch(() => {}));
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
          onBack={() => {
            markRead(selectedContact.userId);
            setSelectedContact(null);
            loadData();
          }}
        />

        <View style={[styles.statusBar, { backgroundColor: Colors.background }]}>
          <View style={[styles.statusDot, { backgroundColor: Colors.text.muted }]} />
          <Text style={[styles.statusText, { color: Colors.text.muted }]}>Offline</Text>
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
              senderName={m.sender_name ?? ''}
              timestamp={formatTime(m.sent_at)}
              isMine={String(m.sender_id) === myId}
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

      {totalUnread > 0 && (
        <View style={styles.unreadBanner}>
          <Ionicons name="mail-unread-outline" size={16} color={Colors.maroon.primary} />
          <Text style={styles.unreadBannerText}>
            You have {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}.
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.maroon.primary} />
      ) : error ? (
        <EmptyState icon="cloud-offline-outline" title="Unable to load chat" subtitle={error} actionLabel="Retry" onAction={loadData} />
      ) : (
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
                <View style={[styles.onlineDot, { backgroundColor: Colors.border }]} />
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
      )}
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
