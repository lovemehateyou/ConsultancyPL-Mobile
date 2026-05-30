import { apiRequest } from './api';

export type ReviewerSummary = {
  id: string;
  name: string;
  businessName?: string | null;
  businessType?: string | null;
  businessArea?: string | null;
  profileImage?: string | null;
};

export type ReviewRecord = {
  id: string;
  userId: string;
  consultantId: string;
  rating: number;
  review: string;
  createdAt: string;
  reviewer?: ReviewerSummary | null;
};

export type ReviewsListResponse = {
  data: ReviewRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ReviewSummary = {
  averageRating: number;
  reviewCount: number;
};

const buildQueryString = (params: { consultantId: string; page?: number; limit?: number }) => {
  const query = new URLSearchParams({ consultantId: params.consultantId });
  if (params.page) {
    query.set('page', String(params.page));
  }
  if (params.limit) {
    query.set('limit', String(params.limit));
  }
  return `?${query.toString()}`;
};

export const createReview = async (payload: { consultantId: string; rating: number; review: string }) => {
  const response = await apiRequest<{ data: ReviewRecord }>('/reviews', {
    method: 'POST',
    body: payload,
  });

  return response.data;
};

export const listConsultantReviews = async (consultantId: string, params: { page?: number; limit?: number } = {}) => {
  const response = await apiRequest<ReviewsListResponse>(
    `/reviews${buildQueryString({ consultantId, page: params.page, limit: params.limit })}`,
  );

  return response;
};

export const getConsultantRatingSummary = async (consultantId: string) => {
  return apiRequest<ReviewSummary>(`/reviews/consultants/${consultantId}/summary`);
};
