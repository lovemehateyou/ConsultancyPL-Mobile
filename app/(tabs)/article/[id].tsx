import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import { MERI_COLORS } from '@/constants/meri';
import { fetchContentById, type ContentItem } from '@/services/content';

export default function ArticleDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const contentId = Array.isArray(id) ? id[0] : id;
  const [article, setArticle] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!contentId) {
      setIsLoading(false);
      setArticle(null);
      return;
    }

    let isActive = true;

    const loadContent = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await fetchContentById(contentId);
        if (isActive) {
          setArticle(data);
        }
      } catch (err) {
        if (isActive) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to load article.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      isActive = false;
    };
  }, [contentId]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={MERI_COLORS.accent} />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>Article not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {article.imageUrl ? (
        <Image source={{ uri: article.imageUrl }} style={styles.coverImage} resizeMode="cover" />
      ) : null}
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.category}>{article.category}</Text>

      <View style={styles.articleBodyCard}>
        <Text style={styles.articleBody}>{article.description || 'No description available.'}</Text>
      </View>

      {article.contentType === 'file' && article.fileUrl ? (
        <Pressable style={styles.downloadButton} onPress={() => Linking.openURL(article.fileUrl ?? '')}>
          <Text style={styles.downloadText}>Download Article</Text>
        </Pressable>
      ) : (
        <Text style={styles.privateText}>This content is not downloadable.</Text>
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
  errorText: {
    color: MERI_COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    padding: 16,
    gap: 12,
  },
  coverImage: {
    height: 180,
    borderRadius: 12,
    backgroundColor: MERI_COLORS.border,
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
