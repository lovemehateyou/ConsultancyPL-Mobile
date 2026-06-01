import { apiRequest } from './api';

export type UserProfile = {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  title?: string | null;
  about?: string | null;
  profileImage?: string | null;
  userAddress?: string | null;
  businessName?: string | null;
  businessCity?: string | null;
  businessSubCity?: string | null;
  businessWereda?: string | null;
  businessKebele?: string | null;
  businessType?: string | null;
  businessArea?: string | null;
  tin?: string | null;
};

export type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

export type ProfileUpdatePayload = {
  name?: string;
  phone?: string;
  title?: string;
  about?: string;
  userAddress?: string;
  businessName?: string;
  businessCity?: string;
  businessSubCity?: string;
  businessWereda?: string;
  businessKebele?: string;
  businessType?: string;
  businessArea?: string;
  tin?: string;
  profileImage?: UploadFile;
};

export type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

type ProfileResponse = {
  user: UserProfile;
  message?: string;
};

type ChangePasswordResponse = {
  message: string;
};

export const fetchProfile = async () => {
  const response = await apiRequest<ProfileResponse>('/users/profile');
  return response.user;
};

export const updateProfile = async (payload: ProfileUpdatePayload) => {
  if (payload.profileImage) {
    const { profileImage, ...fields } = payload;
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
      if (typeof value === 'undefined' || value === null) {
        return;
      }
      formData.append(key, String(value));
    });

    formData.append('profileImage', profileImage as unknown as Blob);

    const response = await apiRequest<ProfileResponse>('/users/profile', {
      method: 'PATCH',
      body: formData,
      isMultipart: true,
    });

    return response.user;
  }

  const response = await apiRequest<ProfileResponse>('/users/profile', {
    method: 'PATCH',
    body: payload,
  });

  return response.user;
};

export const changePassword = async (payload: ChangePasswordPayload) => {
  return apiRequest<ChangePasswordResponse>('/users/change-password', {
    method: 'PATCH',
    body: payload,
  });
};
