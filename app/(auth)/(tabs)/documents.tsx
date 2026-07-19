import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Linking, ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { useDrawer } from '@/context/DrawerContext';
import { useToast } from '@/context/ToastContext';
import { Colors } from '@/constants/Colors';
import { documentLinksAPI } from '@/services/api';

interface DocumentLink {
  id: string;
  title: string;
  url: string;
  category: string;
  description: string | null;
}

interface ApiLink {
  id: number;
  title: string;
  url: string;
  category: string | null;
  description: string | null;
}

export default function DocumentsScreen() {
  const { toggleDrawer } = useDrawer();
  const toast = useToast();

  const [links, setLinks] = useState<DocumentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const loadData = useCallback(async () => {
    try {
      setError('');
      const lks = await documentLinksAPI.getAll();
      setLinks(
        (lks as ApiLink[]).map(l => ({
          id: String(l.id),
          title: l.title,
          url: l.url,
          category: l.category ?? 'General',
          description: l.description,
        }))
      );
    } catch {
      setError('Could not load documents. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(links.map(l => l.category)))],
    [links]
  );

  const visible = links.filter(l => {
    if (activeCategory !== 'all' && l.category !== activeCategory) return false;
    if (searchText && !l.title.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const handleOpen = (link: DocumentLink) => {
    if (!link.url || link.url === '#') {
      toast.info('Link unavailable', `"${link.title}" has no URL configured.`);
      return;
    }
    Linking.openURL(link.url).catch(() =>
      toast.error('Could not open', `Unable to open "${link.title}".`)
    );
  };

  return (
    <View style={styles.flex}>
      <Header title="Documents" subtitle="View & Download" showMenu onMenuPress={toggleDrawer} />

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={Colors.text.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search documents..."
          placeholderTextColor={Colors.text.muted}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={16} color={Colors.text.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Chips */}
      {categories.length > 1 && (
        <FlatList
          horizontal
          data={categories}
          keyExtractor={c => c}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, activeCategory === item && styles.chipActive]}
              onPress={() => setActiveCategory(item)}
            >
              <Text style={[styles.chipText, activeCategory === item && styles.chipTextActive]}>
                {item === 'all' ? 'All' : item}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.maroon.primary} />
      ) : error ? (
        <EmptyState icon="cloud-offline-outline" title="Unable to load" subtitle={error} actionLabel="Retry" onAction={loadData} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title="No documents found"
              subtitle={searchText ? `No results for "${searchText}".` : 'No documents are available yet.'}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleOpen(item)} activeOpacity={0.78}>
              <Card style={styles.linkCard}>
                <View style={styles.linkRow}>
                  <View style={styles.linkIconWrap}>
                    <MaterialCommunityIcons name="file-link-outline" size={20} color={Colors.maroon.primary} />
                  </View>
                  <View style={styles.linkInfo}>
                    <Text style={styles.linkLabel} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.linkCategory}>{item.category}</Text>
                    {item.description ? (
                      <Text style={styles.linkDescription} numberOfLines={2}>{item.description}</Text>
                    ) : null}
                  </View>
                  <Ionicons name="download-outline" size={18} color={Colors.text.muted} />
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text.primary },

  chipScroll: { maxHeight: 40, flexGrow: 0 },
  chipRow: { paddingHorizontal: 16, gap: 8, alignItems: 'center', paddingBottom: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.maroon.primary, borderColor: Colors.maroon.primary },
  chipText: { fontSize: 12, color: Colors.text.secondary, fontWeight: '600' },
  chipTextActive: { color: Colors.white },

  list: { padding: 16, paddingTop: 8, paddingBottom: 24 },

  linkCard: { marginBottom: 8 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  linkIconWrap: { width: 38, height: 38, backgroundColor: Colors.maroon.muted, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  linkInfo: { flex: 1 },
  linkLabel: { fontSize: 14, fontWeight: '600', color: Colors.text.primary },
  linkCategory: { fontSize: 11, color: Colors.maroon.primary, fontWeight: '600', marginTop: 2 },
  linkDescription: { fontSize: 12, color: Colors.text.muted, marginTop: 3, lineHeight: 16 },
});
