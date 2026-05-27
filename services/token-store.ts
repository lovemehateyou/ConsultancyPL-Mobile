import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'meri_access_token';
const REFRESH_TOKEN_KEY = 'meri_refresh_token';

export const setTokens = async (accessToken: string, refreshToken: string) => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
};

export const getAccessToken = () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};
