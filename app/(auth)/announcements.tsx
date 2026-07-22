import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { ColorPalette } from '@/constants/Colors';
import { useThemeColors } from '@/context/ThemeContext';
import { announcementsAPI } from '@/services/api';

interface Announcement {
  id: number;
  type: 'Announcement' | 'Questionnaires' | 'Forms';
  title: string;
  content: string;
  date: string;
  status: string;
  created_by: number | null;
}

const TYPES: Array<'all' | Announcement['type']> = ['all', 'Announcement', 'Questionnaires', 'Forms'];

function formatDate(d?: string): string {
  if (!d) return '';
  const dt = new Date(d.replace(' ', 'T'));
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AnnouncementsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [activeType, setActiveType] = useState<'all' | Announcement['type']>('all');

  const loadData = useCallback(async () => {
    try {
      setError('');
      const data = await announcementsAPI.getAll();
      setItems(data as Announcement[]);
    } catch {
      setError('Could not load announcements. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const visible = items.filter(a => {
    if (activeType !== 'all' && a.type !== activeType) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      if (!a.title.toLowerCase().includes(q) && !a.content.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <View style={styles.flex}>
      <Header title="Announcements" subtitle="School Notices" showBack onBack={() => router.back()} />

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={colors.text.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search announcements..."
          placeholderTextColor={colors.text.muted}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={16} color={colors.text.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        horizontal
        data={TYPES}
        keyExtractor={t => t}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, activeType === item && styles.chipActive]}
            onPress={() => setActiveType(item)}
          >
            <Text style={[styles.chipText, activeType === item && styles.chipTextActive]}>
              {item === 'all' ? 'All' : item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.maroon.primary} />
      ) : error ? (
        <EmptyState icon="cloud-offline-outline" title="Unable to load" subtitle={error} actionLabel="Retry" onAction={loadData} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={a => String(a.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="megaphone-outline"
              title="No announcements found"
              subtitle={searchText ? `No results for "${searchText}".` : 'No announcements have been posted yet.'}
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{item.type}</Text>
                </View>
                <Text style={styles.date}>{formatDate(item.date)}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.content}>{item.content}</Text>
            </Card>
          )}
        />
      )}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },

    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 8,
      borderRadius: 10,
      paddingHorizontal: 12,
      height: 46,
      borderWidth: 1.5,
      borderColor: colors.border,
      gap: 8,
    },
    searchInput: { flex: 1, fontSize: 14, color: colors.text.primary },

    chipScroll: { maxHeight: 40, flexGrow: 0 },
    chipRow: { paddingHorizontal: 16, gap: 8, alignItems: 'center', paddingBottom: 8 },
    chip: {
      paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
      backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.maroon.primary, borderColor: colors.maroon.primary },
    chipText: { fontSize: 12, color: colors.text.secondary, fontWeight: '600' },
    chipTextActive: { color: colors.white },

    list: { padding: 16, paddingTop: 8, paddingBottom: 24 },
    card: { marginBottom: 10 },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    typeBadge: { backgroundColor: colors.maroon.muted, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    typeBadgeText: { fontSize: 10, fontWeight: '700', color: colors.maroon.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
    date: { fontSize: 11, color: colors.text.muted },
    title: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 6 },
    content: { fontSize: 13, color: colors.text.secondary, lineHeight: 19 },
  });
}
