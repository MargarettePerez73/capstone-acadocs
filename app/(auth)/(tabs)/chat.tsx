import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/ui/Header';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import { useAuth } from '@/context/AuthContext';
import { useDrawer } from '@/context/DrawerContext';
import { Colors } from '@/constants/Colors';
import { CHAT_MESSAGES, ChatMessage, TEACHERS } from '@/data/mockData';

interface Conversation {
  userId: string;
  name: string;
  role: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

const CONTACTS: Conversation[] = [
  { userId: '1', name: 'Dr. Maria Santos', role: 'Principal', lastMessage: 'Please use the updated template...', timestamp: '08:05', unread: 0 },
  { userId: 't2', name: 'Ms. Carla Bautista', role: 'Teacher', lastMessage: 'May I request an extension...', timestamp: '09:00', unread: 1 },
  { userId: 't3', name: 'Mr. Rico Santos', role: 'Teacher', lastMessage: '', timestamp: '', unread: 0 },
  { userId: 't4', name: 'Ms. Grace Flores', role: 'Teacher', lastMessage: '', timestamp: '', unread: 0 },
];

export default function ChatScreen() {
  const { user } = useAuth();
  const { toggleDrawer } = useDrawer();
  const [selectedContact, setSelectedContact] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_MESSAGES);
  const scrollRef = useRef<ScrollView>(null);

  const myId = user?.id ?? '';

  const conversationMessages = selectedContact
    ? messages.filter(
        m =>
          (m.senderId === myId && m.receiverId === selectedContact.userId) ||
          (m.receiverId === myId && m.senderId === selectedContact.userId)
      )
    : [];

  const handleSend = (text: string) => {
    if (!selectedContact) return;
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
    setMessages(prev => [...prev, newMsg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  if (selectedContact) {
    return (
      <View style={styles.flex}>
        <Header
          title={selectedContact.name}
          subtitle={selectedContact.role}
          showBack
          onBack={() => setSelectedContact(null)}
        />
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {conversationMessages.length === 0 && (
            <View style={styles.emptyConvo}>
              <Ionicons name="chatbubble-ellipses-outline" size={40} color={Colors.border} />
              <Text style={styles.emptyText}>No messages yet. Start the conversation.</Text>
            </View>
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
        </ScrollView>
        <ChatInput onSend={handleSend} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Header title="Chat" subtitle="Messages" showMenu onMenuPress={toggleDrawer} />
      <FlatList
        data={CONTACTS.filter(c => c.userId !== myId)}
        keyExtractor={i => i.userId}
        contentContainerStyle={styles.contactList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.contactRow} onPress={() => setSelectedContact(item)} activeOpacity={0.7}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.contactInfo}>
              <View style={styles.contactTopRow}>
                <Text style={styles.contactName}>{item.name}</Text>
                {item.timestamp ? <Text style={styles.contactTime}>{item.timestamp}</Text> : null}
              </View>
              <View style={styles.contactBottomRow}>
                <Text style={styles.contactRole}>{item.role}</Text>
                {item.lastMessage ? (
                  <Text style={styles.contactPreview} numberOfLines={1}>{item.lastMessage}</Text>
                ) : null}
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyConvo}>
            <Text style={styles.emptyText}>No contacts available.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  contactList: { paddingBottom: 20 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 76 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.maroon.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: Colors.white },
  contactInfo: { flex: 1 },
  contactTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactName: { fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  contactTime: { fontSize: 11, color: Colors.text.muted },
  contactBottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 6 },
  contactRole: { fontSize: 12, color: Colors.maroon.primary, fontWeight: '600' },
  contactPreview: { flex: 1, fontSize: 12, color: Colors.text.muted },
  unreadBadge: { backgroundColor: Colors.maroon.primary, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  unreadText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  messageList: { padding: 16, paddingBottom: 16 },
  emptyConvo: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.text.muted, textAlign: 'center', paddingHorizontal: 32 },
});
