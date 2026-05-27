import Constants from 'expo-constants';

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './token-store';

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown> | FormData;
  headers?: Record<string, string>;
  isMultipart?: boolean;
  skipAuthRefresh?: boolean;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const rawBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;
const apiBaseUrl = rawBaseUrl ? rawBaseUrl.replace(/\/$/, '') : '';

const buildUrl = (path: string) => {
  if (!apiBaseUrl) {
    throw new Error('API base URL is missing. Set expo.extra.apiBaseUrl in app.json.');
  }

  return path.startsWith('/') ? `${apiBaseUrl}${path}` : `${apiBaseUrl}/${path}`;
};

const extractErrorMessage = (data: unknown) => {
  if (typeof data === 'string') {
    return data;
  }

  if (data && typeof data === 'object') {
    const message = (data as { message?: string }).message;
    if (message) {
      return message;
    }

    const errors = (data as { errors?: Array<{ msg?: string }> }).errors;
    if (Array.isArray(errors) && errors.length) {
      return errors.map((error) => error.msg).filter(Boolean).join(' ');
    }
  }

  return 'Request failed.';
};

const refreshAccessToken = async () => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const response = await fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    await clearTokens();
    return null;
  }

  const data = (await response.json()) as { accessToken?: string; refreshToken?: string };
  if (!data?.accessToken) {
    await clearTokens();
    return null;
  }

  await setTokens(data.accessToken, data.refreshToken ?? refreshToken);
  return data.accessToken;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { method = 'GET', body, headers, isMultipart, skipAuthRefresh } = options;

  const accessToken = await getAccessToken();

  const executeRequest = async (tokenOverride?: string | null) => {
    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...headers,
    };

    const token = tokenOverride ?? accessToken;
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    let requestBody: BodyInit | undefined;
    if (body instanceof FormData || isMultipart) {
      requestBody = body as BodyInit;
    } else if (body) {
      requestHeaders['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
    }

    return fetch(buildUrl(path), {
      method,
      headers: requestHeaders,
      credentials: 'include',
      body: requestBody,
    });
  };

  let response = await executeRequest();

  if (response.status === 401 && !skipAuthRefresh) {
    const nextAccessToken = await refreshAccessToken();
    if (nextAccessToken) {
      response = await executeRequest(nextAccessToken);
    }
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = extractErrorMessage(data);
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}
