import { apiRequest } from './api';

export type BookingPayment = {
  checkout_url: string;
  tx_ref: string;
  amount_charged: string;
  currency: string;
};

export type BookingRecord = {
  id: string;
  status: string;
  consultantId: string;
  availabilityId?: string | null;
  slotStart?: string | null;
  slotEnd?: string | null;
  timezone?: string | null;
};

export type BookingPerson = {
  id: string;
  name?: string | null;
  email?: string | null;
};

export type BookingListItem = BookingRecord & {
  appointmentDate?: string | null;
  user?: BookingPerson | null;
  consultant?: BookingPerson | null;
};

type CreateBookingPayload = {
  consultantId: string;
  availabilityId: string;
  notes?: string;
};

type CreateBookingResponse = {
  data: {
    booking: BookingRecord;
    payment: BookingPayment;
  };
};

type BookingListResponse = {
  data: BookingListItem[];
};

type BookingListParams = {
  status?: string;
};

const buildQueryString = (params: BookingListParams) => {
  const query = new URLSearchParams();
  if (params.status) {
    query.append('status', params.status);
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const createBooking = async (payload: CreateBookingPayload) => {
  const response = await apiRequest<CreateBookingResponse>('/bookings', {
    method: 'POST',
    body: payload,
  });

  return response.data;
};

export const fetchBookings = async (params: BookingListParams = {}) => {
  const response = await apiRequest<BookingListResponse>(`/bookings${buildQueryString(params)}`);
  return response.data;
};
