import { apiRequest } from './api';
import { clearTokens, getRefreshToken, setTokens } from './token-store';

export type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  message: string;
  accessToken: string;
  refreshToken: string;
};

type SignupPayload = {
  userName: string;
  email: string;
  password: string;
  role?: string;
  phoneNumber: string;
  userAddress: string;
  BusinessName: string;
  BusinessCity: string;
  BusinessSubCity: string;
  BusinessWereda: string;
  BusinessKebele: string;
  BusinessType: string;
  Business: string;
  TIN?: string;
  agreedToTerms: boolean;
  nationalIdFile?: UploadFile;
};

type SignupResponse = {
  message: string;
  user: Record<string, unknown>;
};

export const login = async (payload: LoginPayload) => {
  const response = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });

  if (response.accessToken && response.refreshToken) {
    await setTokens(response.accessToken, response.refreshToken);
  }
};

export const logout = async () => {
  const refreshToken = await getRefreshToken();
  await apiRequest('/auth/logout', {
    method: 'POST',
    body: refreshToken ? { refreshToken } : undefined,
    skipAuthRefresh: true,
  });
  await clearTokens();
};

export const signup = async (payload: SignupPayload) => {
  const { nationalIdFile, ...fields } = payload;
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    formData.append(key, String(value));
  });

  if (nationalIdFile) {
    formData.append('nationalIdFile', nationalIdFile as unknown as Blob);
  }

  return apiRequest<SignupResponse>('/auth/signup', {
    method: 'POST',
    body: formData,
    isMultipart: true,
  });
};
