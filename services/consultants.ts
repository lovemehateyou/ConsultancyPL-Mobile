import { apiRequest } from './api';

export type Consultant = {
  id: string;
  name: string;
  email: string;
  title?: string | null;
  about?: string | null;
  profileImage?: string | null;
  phone?: string | null;
  businessName?: string | null;
  businessCity?: string | null;
  businessSubCity?: string | null;
  businessWereda?: string | null;
  businessKebele?: string | null;
  businessType?: string | null;
  businessArea?: string | null;
  tin?: string | null;
};

type ConsultantListResponse = {
  data: Consultant[];
};

type ConsultantResponse = {
  data: Consultant;
};

type ConsultantListParams = {
  search?: string;
};

const buildQueryString = (params: ConsultantListParams) => {
  const query = new URLSearchParams();
  if (params.search) {
    query.append('search', params.search);
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const fetchConsultants = async (params: ConsultantListParams = {}) => {
  const response = await apiRequest<ConsultantListResponse>(`/users/consultants${buildQueryString(params)}`);
  return response.data;
};

export const fetchConsultantById = async (consultantId: string) => {
  const response = await apiRequest<ConsultantResponse>(`/users/consultants/${consultantId}`);
  return response.data;
};
