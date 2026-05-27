import { apiRequest } from './api';

export type AvailabilityStatus = 'open' | 'pending' | 'booked' | 'archived';

export type AvailabilitySlot = {
  id: string;
  consultantId: string;
  slotStart: string;
  slotEnd: string;
  timezone: string;
  status: AvailabilityStatus;
  meta?: Record<string, unknown> | null;
};

type AvailabilityResponse = {
  data: AvailabilitySlot[];
};

type AvailabilityParams = {
  status?: AvailabilityStatus;
};

const buildQueryString = (params: AvailabilityParams) => {
  const query = new URLSearchParams();
  if (params.status) {
    query.append('status', params.status);
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const fetchAvailabilityByConsultant = async (consultantId: string, params: AvailabilityParams = {}) => {
  const response = await apiRequest<AvailabilityResponse>(
    `/availability/consultants/${consultantId}${buildQueryString(params)}`,
  );
  return response.data;
};
