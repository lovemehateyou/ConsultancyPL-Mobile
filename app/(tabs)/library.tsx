import { router } from 'expo-router';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useMemo, useState } from 'react';

import { MERI_COLORS } from '@/constants/meri';
import { fetchContentList, type ContentItem } from '@/services/content';

export default function LibraryTabScreen() {
  const [category, setCategory] = useState('All Categories');
  const [pricing, setPricing] = useState('Paid / Free');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadContent = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await fetchContentList({
          category: category === 'All Categories' ? undefined : category,
          search: search.trim() ? search.trim() : undefined,
        });

        if (isActive) {
          setItems(data);
        }
      } catch (err) {
        if (isActive) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to load library content.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    const debounceHandle = setTimeout(loadContent, 250);

    return () => {
      isActive = false;
      clearTimeout(debounceHandle);
    };
  }, [category, search]);

  const visibleItems = useMemo(() => {
    if (pricing === 'Free') {
      return items.filter((item) => item.contentType === 'article');
    }
    if (pricing === 'Paid') {
      return items.filter((item) => item.contentType === 'file');
    }
    return items;
  }, [items, pricing]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Library Management</Text>

      <View style={styles.filterBox}>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={category} onValueChange={(value) => setCategory(value)}>
            <Picker.Item label="All Categories" value="All Categories" />
            <Picker.Item label="Design" value="Design" />
            <Picker.Item label="Finance" value="Finance" />
            <Picker.Item label="Tech" value="Tech" />
          </Picker>
        </View>

        <TextInput
          placeholder="Search by title or description"
          style={styles.input}
          placeholderTextColor={MERI_COLORS.mutedText}
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.pickerWrap}>
          <Picker selectedValue={pricing} onValueChange={(value) => setPricing(value)}>
            <Picker.Item label="Paid / Free" value="Paid / Free" />
            <Picker.Item label="Free" value="Free" />
            <Picker.Item label="Paid" value="Paid" />
          </Picker>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={MERI_COLORS.accent} />
          <Text style={styles.stateText}>Loading library content...</Text>
        </View>
      ) : errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : visibleItems.length === 0 ? (
        <Text style={styles.emptyText}>No content matches your filters yet.</Text>
      ) : (
        visibleItems.map((item) => (
          <Pressable key={item.id} style={styles.articleCard} onPress={() => router.push(`/(tabs)/article/${item.id}`)}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.articleImage} resizeMode="cover" />
            ) : (
              <View style={styles.articleImagePlaceholder}>
                <Text style={styles.placeholderText}>Article Cover</Text>
              </View>
            )}
            <Text style={styles.articleTitle}>{item.title}</Text>
            <Text style={styles.articleCategory}>{item.category}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: MERI_COLORS.background,
  },
  container: {
    padding: 16,
    gap: 14,
  },
  heading: {
    color: MERI_COLORS.text,
    fontSize: 26,
    fontWeight: '700',
  },
  filterBox: {
    gap: 10,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  input: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: MERI_COLORS.text,
  },
  articleCard: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  articleImagePlaceholder: {
    height: 140,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleImage: {
    height: 140,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
  },
  placeholderText: {
    color: MERI_COLORS.accent,
    fontWeight: '600',
  },
  articleTitle: {
    color: MERI_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  articleCategory: {
    color: MERI_COLORS.accent,
    fontWeight: '600',
  },
  stateCard: {
    paddingVertical: 16,
    gap: 8,
    alignItems: 'center',
  },
  stateText: {
    color: MERI_COLORS.mutedText,
    fontWeight: '600',
  },
  errorText: {
    color: MERI_COLORS.accent,
    fontWeight: '600',
  },
  emptyText: {
    color: MERI_COLORS.mutedText,
    fontWeight: '600',
  },
});
