import { apiRequest } from './api';

export type ContentItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileUrl?: string | null;
  imageUrl?: string | null;
  contentType: 'file' | 'article';
  createdAt?: string;
};

type ContentListParams = {
  category?: string;
  search?: string;
};

const buildQueryString = (params: ContentListParams) => {
  const query = new URLSearchParams();
  if (params.category) {
    query.append('category', params.category);
  }
  if (params.search) {
    query.append('search', params.search);
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const fetchContentList = (params: ContentListParams = {}) => {
  return apiRequest<ContentItem[]>(`/content${buildQueryString(params)}`);
};

export const fetchContentById = (id: string) => {
  return apiRequest<ContentItem>(`/content/${id}`);
};
