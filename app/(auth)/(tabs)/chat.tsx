import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
  name: string;
  role: string;
  email?: string | null;
}

interface Participant {
  id: number;
  name: string;
  role: string;
}

interface ApiConversation {
  id: number;
  type: 'direct' | 'group';
  name: string | null;
  created_by: number;
  last_read_at: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  participants: Participant[];
}

interface ApiMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  body: string;
  created_at: string;
}

function formatTime(ts?: string | null): string {
  if (!ts) return '';
  const d = new Date(ts.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const getInitials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

export default function ChatScreen() {
  const { user } = useAuth();
  const { toggleDrawer } = useDrawer();
  const toast = useToast();

  const [selected, setSelected] = useState<ApiConversation | null>(null);
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState('');

  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState<ApiUser[]>([]);
  const [creating, setCreating] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const myId = user?.id ?? '';
  const isAdmin = user?.role === 'admin';

  const loadConversations = useCallback(async () => {
    try {
      setError('');
      const convos = await chatAPI.getConversations(myId);
      setConversations(convos as ApiConversation[]);
    } catch {
      setError('Could not load conversations. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [myId]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const loadMessages = async (conversationId: number) => {
    setMessagesLoading(true);
    try {
      const msgs = await chatAPI.getMessages(conversationId);
      setMessages(msgs as ApiMessage[]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 60);
    } catch {
      toast.error('Could not load messages', 'Please try again.');
    } finally {
      setMessagesLoading(false);
    }
  };

  const openConversation = (conv: ApiConversation) => {
    setSelected(conv);
    loadMessages(conv.id);
  };

  const closeConversation = () => {
    if (selected) {
      chatAPI.markAsRead(selected.id, myId).catch(() => {});
    }
    setSelected(null);
    loadConversations();
  };

  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count || 0), 0);

  const handleSend = async (text: string) => {
    if (!selected) return;
    setSending(true);
    try {
      const res = await chatAPI.sendMessage(selected.id, myId, text);
      const newMsg: ApiMessage = {
        id: Number(res.id ?? Date.now()),
        conversation_id: selected.id,
        sender_id: Number(myId),
        sender_name: user?.name ?? '',
        body: text,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
      setMessages(prev => [...prev, newMsg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    } catch {
      toast.error('Send failed', 'Your message could not be saved.');
    } finally {
      setSending(false);
    }
  };

  const openNewChat = async () => {
    setShowNewChat(true);
    try {
      const users = await usersAPI.getAll();
      setAllUsers((users as ApiUser[]).filter(u => String(u.id) !== myId));
    } catch {
      toast.error('Could not load users', 'Please try again.');
    }
  };

  const handleStartChat = async (target: ApiUser) => {
    setCreating(true);
    try {
      const res = await chatAPI.startConversation(myId, target.id);
      setShowNewChat(false);
      await loadConversations();
      openConversation({
        id: res.id,
        type: 'direct',
        name: target.name,
        created_by: Number(myId),
        last_read_at: null,
        last_message: null,
        last_message_at: null,
        unread_count: 0,
        participants: [{ id: target.id, name: target.name, role: target.role }],
      });
    } catch {
      toast.error('Could not start conversation', 'Please try again.');
    } finally {
      setCreating(false);
    }
  };

  /* ── Conversation View ── */
  if (selected) {
    const subtitle = selected.type === 'group'
      ? `${selected.participants.length + 1} members`
      : (RoleLabels[(selected.participants[0]?.role as keyof typeof RoleLabels)] ?? selected.participants[0]?.role ?? '');

    return (
      <View style={styles.flex}>
        <Header
          title={selected.name ?? 'Conversation'}
          subtitle={subtitle}
          showBack
          onBack={closeConversation}
        />

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messagesLoading ? (
            <ActivityIndicator style={{ marginTop: 24 }} color={Colors.maroon.primary} />
          ) : messages.length === 0 ? (
            <EmptyState
              icon="chatbubble-ellipses-outline"
              title="No messages yet"
              subtitle={`Start the conversation with ${selected.name?.split(' ')[0] ?? 'this group'}.`}
            />
          ) : (
            messages.map(m => (
              <ChatBubble
                key={m.id}
                message={m.body}
                senderName={m.sender_name}
                timestamp={formatTime(m.created_at)}
                isMine={String(m.sender_id) === myId}
              />
            ))
          )}
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

  /* ── Conversation List View ── */
  return (
    <View style={styles.flex}>
      <Header
        title="Chat"
        subtitle="Messages & Correspondence"
        showMenu
        onMenuPress={toggleDrawer}
        badge={totalUnread}
        rightIcon={isAdmin ? 'person-add-outline' : undefined}
        onRightPress={isAdmin ? openNewChat : undefined}
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
        <EmptyState icon="cloud-offline-outline" title="Unable to load chat" subtitle={error} actionLabel="Retry" onAction={loadConversations} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={i => String(i.id)}
          contentContainerStyle={styles.contactList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No conversations yet"
              subtitle={isAdmin ? 'Tap the + icon to start a conversation.' : 'Conversations started by the principal will appear here.'}
              actionLabel={isAdmin ? 'Start a conversation' : undefined}
              onAction={isAdmin ? openNewChat : undefined}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => openConversation(item)}
              activeOpacity={0.75}
            >
              <View style={styles.avatarWrap}>
                <View style={[styles.avatar, item.unread_count > 0 && styles.avatarUnread]}>
                  {item.type === 'group' ? (
                    <MaterialCommunityIcons name="account-group" size={20} color={Colors.white} />
                  ) : (
                    <Text style={styles.avatarText}>{getInitials(item.name ?? '?')}</Text>
                  )}
                </View>
              </View>
              <View style={styles.contactInfo}>
                <View style={styles.contactTopRow}>
                  <Text style={[styles.contactName, item.unread_count > 0 && styles.contactNameBold]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.last_message_at ? (
                    <Text style={[styles.contactTime, item.unread_count > 0 && styles.contactTimeUnread]}>
                      {formatTime(item.last_message_at)}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.contactBottomRow}>
                  <Text style={styles.contactRole}>{item.type === 'group' ? 'Group' : 'Direct message'}</Text>
                </View>
                {item.last_message ? (
                  <Text
                    style={[styles.contactPreview, item.unread_count > 0 && styles.contactPreviewUnread]}
                    numberOfLines={1}
                  >
                    {item.last_message}
                  </Text>
                ) : (
                  <Text style={styles.contactNoMessage}>No messages yet — tap to start</Text>
                )}
              </View>
              {item.unread_count > 0 && (
                <View style={styles.unreadPill}>
                  <Text style={styles.unreadPillText}>{item.unread_count}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}

      {/* New Conversation Modal (admin only) */}
      <Modal visible={showNewChat} animationType="slide" transparent onRequestClose={() => setShowNewChat(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Start a Conversation</Text>
              <TouchableOpacity onPress={() => setShowNewChat(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            {creating ? (
              <ActivityIndicator style={{ marginVertical: 24 }} color={Colors.maroon.primary} />
            ) : (
              <FlatList
                data={allUsers}
                keyExtractor={u => String(u.id)}
                style={{ maxHeight: 380 }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={<ActivityIndicator style={{ marginVertical: 24 }} color={Colors.maroon.primary} />}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.userRow} onPress={() => handleStartChat(item)} activeOpacity={0.75}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contactName}>{item.name}</Text>
                      <Text style={styles.contactRole}>
                        {RoleLabels[(item.role as keyof typeof RoleLabels)] ?? item.role}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },

  /* Conversation List */
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

  /* New Chat Modal */
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 24,
    paddingBottom: 36,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: Colors.text.primary },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
});
