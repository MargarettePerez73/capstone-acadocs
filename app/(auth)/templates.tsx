import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Linking, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/context/ToastContext';
import { ColorPalette } from '@/constants/Colors';
import { useThemeColors } from '@/context/ThemeContext';
import { templatesAPI } from '@/services/api';

interface TemplateCategory {
  id: number;
  name: string;
}

interface Template {
  id: number;
  category_id: number;
  category_name: string;
  title: string;
  description: string | null;
  file_name: string;
  file_ext: string;
  file_size: number;
  uploaded_by: string;
  date_added: string;
}

function formatSize(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TemplatesScreen() {
  const toast = useToast();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [tmpls, cats] = await Promise.all([templatesAPI.getAll(), templatesAPI.getCategories()]);
      setTemplates(tmpls as Template[]);
      setCategories(cats as TemplateCategory[]);
    } catch {
      setError('Could not load templates. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const chips = useMemo(() => [{ id: 'all' as const, name: 'All' }, ...categories], [categories]);

  const visible = templates.filter(t => {
    if (activeCategory !== 'all' && t.category_id !== activeCategory) return false;
    if (searchText && !t.title.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const handleDownload = (item: Template) => {
    const url = templatesAPI.downloadUrl(item.id);
    Linking.openURL(url).catch(() =>
      toast.error('Could not open', `Unable to download "${item.title}".`)
    );
  };

  return (
    <View style={styles.flex}>
      <Header title="Templates" subtitle="Forms & Document Templates" showBack onBack={() => router.back()} />

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={colors.text.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search templates..."
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

      {chips.length > 1 && (
        <FlatList
          horizontal
          data={chips}
          keyExtractor={c => String(c.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, activeCategory === item.id && styles.chipActive]}
              onPress={() => setActiveCategory(item.id)}
            >
              <Text style={[styles.chipText, activeCategory === item.id && styles.chipTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.maroon.primary} />
      ) : error ? (
        <EmptyState icon="cloud-offline-outline" title="Unable to load" subtitle={error} actionLabel="Retry" onAction={loadData} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={t => String(t.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="file-tray-outline"
              title="No templates found"
              subtitle={searchText ? `No results for "${searchText}".` : 'No templates are available yet.'}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleDownload(item)} activeOpacity={0.78}>
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.iconWrap}>
                    <MaterialCommunityIcons name="file-outline" size={20} color={colors.maroon.primary} />
                    <Text style={styles.extBadge}>{item.file_ext.toUpperCase()}</Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.category}>{item.category_name}</Text>
                    <Text style={styles.meta}>
                      {item.uploaded_by} · {formatSize(item.file_size)}
                    </Text>
                  </View>
                  <Ionicons name="download-outline" size={18} color={colors.text.muted} />
                </View>
              </Card>
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
    card: { marginBottom: 8 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconWrap: {
      width: 44, height: 44, backgroundColor: colors.maroon.muted, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center', gap: 1,
    },
    extBadge: { fontSize: 8, fontWeight: '800', color: colors.maroon.primary, letterSpacing: 0.3 },
    info: { flex: 1 },
    title: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
    category: { fontSize: 11, color: colors.maroon.primary, fontWeight: '600', marginTop: 2 },
    meta: { fontSize: 11, color: colors.text.muted, marginTop: 2 },
  });
}
