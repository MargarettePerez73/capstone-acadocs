import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/ui/Header';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { ColorPalette } from '@/constants/Colors';
import { useThemeColors } from '@/context/ThemeContext';
import { notificationsAPI } from '@/services/api';

interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  sub: string | null;
  url: string | null;
  ref_type: string | null;
  ref_id: number | null;
  is_read: number;
  created_at: string;
  updated_at: string;
}

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  task_assigned: 'clipboard-outline',
  task_submission: 'checkmark-done-outline',
  task_feedback: 'chatbox-ellipses-outline',
  document_feedback: 'document-text-outline',
  announcement: 'megaphone-outline',
};

function formatWhen(ts?: string): string {
  if (!ts) return '';
  const d = new Date(ts.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const myId = user?.id ?? '';
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    if (!myId) {
      setLoading(false);
      return;
    }
    try {
      setError('');
      const data = await notificationsAPI.getAll(myId);
      setItems(data as Notification[]);
    } catch {
      setError('Could not load notifications. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [myId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePress = (item: Notification) => {
    if (item.is_read) return;
    setItems(prev => prev.map(n => (n.id === item.id ? { ...n, is_read: 1 } : n)));
    notificationsAPI.markAsRead(item.id, myId).catch(() => {});
  };

  const unreadCount = items.filter(n => !n.is_read).length;

  return (
    <View style={styles.flex}>
      <Header
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        showBack
        onBack={() => router.back()}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.maroon.primary} />
      ) : error ? (
        <EmptyState icon="cloud-offline-outline" title="Unable to load" subtitle={error} actionLabel="Retry" onAction={loadData} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={n => String(n.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <EmptyState icon="notifications-outline" title="No notifications" subtitle="You're all caught up." />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, !item.is_read && styles.rowUnread]}
              onPress={() => handlePress(item)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrap, !item.is_read && styles.iconWrapUnread]}>
                <Ionicons
                  name={TYPE_ICON[item.type] ?? 'notifications-outline'}
                  size={18}
                  color={!item.is_read ? colors.white : colors.maroon.primary}
                />
              </View>
              <View style={styles.info}>
                <Text style={[styles.title, !item.is_read && styles.titleUnread]} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.sub ? <Text style={styles.sub} numberOfLines={1}>{item.sub}</Text> : null}
                <Text style={styles.time}>{formatWhen(item.created_at)}</Text>
              </View>
              {!item.is_read && <View style={styles.dot} />}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    list: { paddingBottom: 24 },
    separator: { height: 1, backgroundColor: colors.border, marginLeft: 66 },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    rowUnread: { backgroundColor: colors.maroon.surface },
    iconWrap: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: colors.maroon.muted,
      alignItems: 'center', justifyContent: 'center',
    },
    iconWrapUnread: { backgroundColor: colors.maroon.primary },
    info: { flex: 1 },
    title: { fontSize: 14, fontWeight: '600', color: colors.text.primary, lineHeight: 19 },
    titleUnread: { fontWeight: '800' },
    sub: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
    time: { fontSize: 11, color: colors.text.muted, marginTop: 4 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.maroon.primary, marginTop: 6 },
  });
}
