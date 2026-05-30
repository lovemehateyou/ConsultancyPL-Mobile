import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';

import { MERI_COLORS } from '@/constants/meri';
import { fetchAvailabilityByConsultant, type AvailabilitySlot } from '@/services/availability';
import { fetchConsultantById, type Consultant } from '@/services/consultants';
import { createReview, getConsultantRatingSummary, listConsultantReviews, type ReviewRecord, type ReviewSummary } from '@/services/reviews';

const REVIEWS_PAGE_SIZE = 5;

export default function ConsultantDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const consultantId = Array.isArray(id) ? id[0] : id;
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewsLoadingMore, setReviewsLoadingMore] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitError, setReviewSubmitError] = useState<string | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    if (!consultantId) {
      setIsLoading(false);
      setConsultant(null);
      return;
    }

    let isActive = true;

    const loadConsultant = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [consultantData, slots] = await Promise.all([
          fetchConsultantById(consultantId),
          fetchAvailabilityByConsultant(consultantId, { status: 'open' }),
        ]);

        if (isActive) {
          setConsultant(consultantData);
          setAvailability(slots);
        }
      } catch (err) {
        if (isActive) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to load consultant profile.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadConsultant();

    return () => {
      isActive = false;
    };
  }, [consultantId]);

  useEffect(() => {
    if (!consultantId) {
      setReviewSummary(null);
      setReviews([]);
      setReviewsLoading(false);
      setReviewsError(null);
      setReviewsPage(1);
      setReviewsTotalPages(1);
      setReviewRating(0);
      setReviewText('');
      setReviewSubmitError(null);
      setReviewSubmitting(false);
      return;
    }

    let isActive = true;

    setReviewsLoading(true);
    setReviewsError(null);
    setReviewsPage(1);
    setReviewsTotalPages(1);
    setReviewRating(0);
    setReviewText('');
    setReviewSubmitError(null);
    setReviewSubmitting(false);

    const loadReviews = async () => {
      try {
        const [summary, list] = await Promise.all([
          getConsultantRatingSummary(consultantId),
          listConsultantReviews(consultantId, { page: 1, limit: REVIEWS_PAGE_SIZE }),
        ]);

        if (!isActive) {
          return;
        }

        setReviewSummary(summary);
        setReviews(list.data);
        setReviewsPage(list.pagination.page);
        setReviewsTotalPages(list.pagination.totalPages);
      } catch (err) {
        if (isActive) {
          setReviewsError(err instanceof Error ? err.message : 'Failed to load reviews.');
          setReviewSummary(null);
          setReviews([]);
        }
      } finally {
        if (isActive) {
          setReviewsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      isActive = false;
    };
  }, [consultantId]);

  const formatSlotDate = (value: string) => new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formatSlotTime = (value: string) => new Date(value).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formatReviewDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const getInitials = (name?: string | null) => {
    if (!name) {
      return '?';
    }

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  };

  const renderStars = (value: number, onSelect?: (rating: number) => void, size = 16) => {
    const stars = [1, 2, 3, 4, 5];

    return (
      <View style={styles.starsRow}>
        {stars.map((star) => {
          const isFilled = star <= value;
          const starStyle = [styles.star, isFilled && styles.starActive, { fontSize: size }];
          const label = isFilled ? '★' : '☆';

          if (onSelect) {
            return (
              <Pressable key={star} onPress={() => onSelect(star)} style={styles.starButton}>
                <Text style={starStyle}>{label}</Text>
              </Pressable>
            );
          }

          return (
            <Text key={star} style={starStyle}>
              {label}
            </Text>
          );
        })}
      </View>
    );
  };

  const loadMoreReviews = async () => {
    if (reviewsLoading || reviewsLoadingMore || reviewsPage >= reviewsTotalPages || !consultantId) {
      return;
    }

    setReviewsLoadingMore(true);
    setReviewsError(null);

    try {
      const nextPage = reviewsPage + 1;
      const response = await listConsultantReviews(consultantId, { page: nextPage, limit: REVIEWS_PAGE_SIZE });
      setReviewsPage(response.pagination.page);
      setReviewsTotalPages(response.pagination.totalPages);

      setReviews((prev) => {
        const existingIds = new Set(prev.map((review) => review.id));
        const merged = [...prev];
        response.data.forEach((review) => {
          if (!existingIds.has(review.id)) {
            merged.push(review);
          }
        });
        return merged;
      });
    } catch (err) {
      setReviewsError(err instanceof Error ? err.message : 'Failed to load more reviews.');
    } finally {
      setReviewsLoadingMore(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!consultantId || reviewSubmitting) {
      return;
    }

    const trimmedReview = reviewText.trim();

    if (!reviewRating || !trimmedReview) {
      setReviewSubmitError('Please add a rating and a review.');
      return;
    }

    setReviewSubmitting(true);
    setReviewSubmitError(null);

    try {
      const created = await createReview({ consultantId, rating: reviewRating, review: trimmedReview });

      setReviews((prev) => {
        const existingIds = new Set(prev.map((review) => review.id));
        if (existingIds.has(created.id)) {
          return prev;
        }
        return [created, ...prev];
      });

      setReviewSummary((prev) => {
        const current = prev ?? { averageRating: 0, reviewCount: 0 };
        const total = current.averageRating * current.reviewCount;
        const nextCount = current.reviewCount + 1;
        const nextAverage = (total + reviewRating) / nextCount;
        return {
          averageRating: nextAverage,
          reviewCount: nextCount,
        };
      });

      setReviewRating(0);
      setReviewText('');
    } catch (err) {
      setReviewSubmitError(err instanceof Error ? err.message : 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

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

  if (!consultant) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>Consultant not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Consultant Details',
          headerLeft: () => (
            <Pressable style={styles.headerBackButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={MERI_COLORS.text} />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          {consultant.profileImage ? (
            <Image source={{ uri: consultant.profileImage }} style={styles.profileImage} />
          ) : null}
          <Text style={styles.name}>{consultant.name}</Text>
          <Text style={styles.role}>{consultant.businessArea || consultant.businessType || consultant.title || 'Consultant'}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.body}>{consultant.about || 'No profile details available yet.'}</Text>
          <Text style={styles.meta}>{consultant.email}</Text>
          {consultant.phone ? <Text style={styles.meta}>{consultant.phone}</Text> : null}
          {consultant.businessCity ? <Text style={styles.meta}>{consultant.businessCity}</Text> : null}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Availability Schedule</Text>
          {availability.length === 0 ? (
            <Text style={styles.meta}>No open slots available yet.</Text>
          ) : (
            availability.map((slot) => (
              <View key={slot.id} style={styles.scheduleRow}>
                <Text style={styles.day}>{formatSlotDate(slot.slotStart)}</Text>
                <Text style={styles.time}>
                  {formatSlotTime(slot.slotStart)} - {formatSlotTime(slot.slotEnd)}
                </Text>
                <Text style={styles.available}>Available</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Testimonials</Text>
          <View style={styles.ratingSummaryRow}>
            <Text style={styles.ratingValue}>
              {(reviewSummary?.averageRating ?? 0).toFixed(1)}
            </Text>
            <View style={styles.ratingMeta}>
              {renderStars(Math.round(reviewSummary?.averageRating ?? 0), undefined, 14)}
              <Text style={styles.meta}>{reviewSummary?.reviewCount ?? 0} reviews</Text>
            </View>
          </View>

          {reviewsLoading ? (
            <View style={styles.reviewState}>
              <ActivityIndicator color={MERI_COLORS.accent} />
              <Text style={styles.meta}>Loading testimonials...</Text>
            </View>
          ) : reviewsError && reviews.length === 0 ? (
            <Text style={styles.errorText}>{reviewsError}</Text>
          ) : reviews.length === 0 ? (
            <Text style={styles.meta}>No testimonials yet.</Text>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerAvatar}>
                    {review.reviewer?.profileImage ? (
                      <Image source={{ uri: review.reviewer.profileImage }} style={styles.reviewerAvatarImage} />
                    ) : (
                      <Text style={styles.reviewerInitials}>{getInitials(review.reviewer?.name)}</Text>
                    )}
                  </View>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.reviewer?.name ?? 'Anonymous'}</Text>
                    <View style={styles.reviewMetaRow}>
                      {renderStars(review.rating, undefined, 14)}
                      <Text style={styles.reviewDate}>{formatReviewDate(review.createdAt)}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewText}>{review.review}</Text>
              </View>
            ))
          )}

          {reviewsError && reviews.length > 0 ? <Text style={styles.errorText}>{reviewsError}</Text> : null}

          {reviewsPage < reviewsTotalPages ? (
            <Pressable
              style={[styles.loadMoreButton, reviewsLoadingMore && styles.buttonDisabled]}
              onPress={loadMoreReviews}
              disabled={reviewsLoadingMore}>
              <Text style={styles.loadMoreText}>{reviewsLoadingMore ? 'Loading...' : 'Load more'}</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Leave a Review</Text>
          {renderStars(reviewRating, setReviewRating, 24)}
          <TextInput
            placeholder="Share your experience"
            placeholderTextColor={MERI_COLORS.mutedText}
            style={styles.reviewInput}
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            textAlignVertical="top"
          />
          {reviewSubmitError ? <Text style={styles.errorText}>{reviewSubmitError}</Text> : null}
          <Pressable
            style={[
              styles.submitButton,
              (reviewSubmitting || reviewRating === 0 || !reviewText.trim()) && styles.buttonDisabled,
            ]}
            onPress={handleSubmitReview}
            disabled={reviewSubmitting || reviewRating === 0 || !reviewText.trim()}>
            <Text style={styles.submitButtonText}>{reviewSubmitting ? 'Submitting...' : 'Submit Review'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
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
  headerCard: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: MERI_COLORS.card,
    gap: 8,
  },
  profileImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: MERI_COLORS.border,
  },
  name: {
    color: MERI_COLORS.text,
    fontSize: 24,
    fontWeight: '700',
  },
  role: {
    color: MERI_COLORS.mutedText,
    marginTop: 2,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    color: MERI_COLORS.text,
    fontWeight: '700',
    fontSize: 17,
  },
  body: {
    color: MERI_COLORS.text,
    lineHeight: 22,
  },
  meta: {
    color: MERI_COLORS.mutedText,
  },
  scheduleRow: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  day: {
    color: MERI_COLORS.text,
    fontWeight: '700',
  },
  time: {
    color: MERI_COLORS.mutedText,
  },
  available: {
    color: '#059669',
    fontWeight: '700',
  },
  notAvailable: {
    color: '#DC2626',
    fontWeight: '700',
  },
  headerBackButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingValue: {
    color: MERI_COLORS.text,
    fontSize: 28,
    fontWeight: '700',
  },
  ratingMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    color: MERI_COLORS.mutedText,
  },
  starActive: {
    color: MERI_COLORS.accent,
  },
  starButton: {
    paddingHorizontal: 2,
  },
  reviewState: {
    paddingVertical: 8,
    alignItems: 'center',
    gap: 6,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewerAvatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerAvatarImage: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  reviewerInitials: {
    color: MERI_COLORS.accent,
    fontWeight: '700',
  },
  reviewerInfo: {
    flex: 1,
    gap: 2,
  },
  reviewerName: {
    color: MERI_COLORS.text,
    fontWeight: '700',
  },
  reviewMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewDate: {
    color: MERI_COLORS.mutedText,
    fontSize: 12,
  },
  reviewText: {
    color: MERI_COLORS.text,
    lineHeight: 20,
  },
  loadMoreButton: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  loadMoreText: {
    color: MERI_COLORS.text,
    fontWeight: '600',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: MERI_COLORS.text,
    minHeight: 100,
  },
  submitButton: {
    alignSelf: 'flex-end',
    backgroundColor: MERI_COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonText: {
    color: MERI_COLORS.background,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
