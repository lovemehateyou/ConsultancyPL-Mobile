import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';

import { MERI_COLORS } from '@/constants/meri';
import { ARTICLES } from '@/data/app-data';

export default function LibraryTabScreen() {
  const [category, setCategory] = useState('All Categories');
  const [pricing, setPricing] = useState('Paid / Free');

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

        <TextInput placeholder="mm/dd/yyyy" style={styles.input} placeholderTextColor={MERI_COLORS.mutedText} />

        <View style={styles.pickerWrap}>
          <Picker selectedValue={pricing} onValueChange={(value) => setPricing(value)}>
            <Picker.Item label="Paid / Free" value="Paid / Free" />
            <Picker.Item label="Free" value="Free" />
            <Picker.Item label="Paid" value="Paid" />
          </Picker>
        </View>
      </View>

      {ARTICLES.map((item) => (
        <Pressable key={item.id} style={styles.articleCard} onPress={() => router.push(`/(tabs)/article/${item.id}`)}>
          <View style={styles.articleImagePlaceholder}>
            <Text style={styles.placeholderText}>Article Cover</Text>
          </View>
          <Text style={styles.articleTitle}>{item.title}</Text>
          <Text style={styles.articleCategory}>{item.category}</Text>
        </Pressable>
      ))}
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
});
