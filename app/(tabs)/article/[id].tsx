import { useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MERI_COLORS } from '@/constants/meri';
import { ARTICLES } from '@/data/app-data';

export default function ArticleDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = ARTICLES.find((item) => item.id === id);

  if (!article) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>Article not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.category}>{article.category}</Text>

      <View style={styles.articleBodyCard}>
        <Text style={styles.articleBody}>{article.content}</Text>
      </View>

      {article.isPublic && article.downloadUrl ? (
        <Pressable style={styles.downloadButton} onPress={() => Linking.openURL(article.downloadUrl ?? '')}>
          <Text style={styles.downloadText}>Download Article</Text>
        </Pressable>
      ) : (
        <Text style={styles.privateText}>This article is private and not downloadable.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: MERI_COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MERI_COLORS.background,
  },
  notFoundTitle: {
    color: MERI_COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    color: MERI_COLORS.text,
    fontWeight: '700',
    fontSize: 24,
  },
  category: {
    color: MERI_COLORS.accent,
    fontWeight: '600',
  },
  articleBodyCard: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: MERI_COLORS.card,
  },
  articleBody: {
    color: MERI_COLORS.text,
    lineHeight: 24,
    fontSize: 15,
  },
  downloadButton: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: MERI_COLORS.accent,
    alignItems: 'center',
    paddingVertical: 12,
  },
  downloadText: {
    color: MERI_COLORS.background,
    fontWeight: '700',
  },
  privateText: {
    color: MERI_COLORS.mutedText,
    fontStyle: 'italic',
  },
});
