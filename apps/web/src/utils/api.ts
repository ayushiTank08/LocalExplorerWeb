import { store } from '@/store';
import { ensureToken } from './tokenRefresh';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiRequestOptions {
  url: string;
  method?: RequestMethod;
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
}

export const apiRequest = async <T>({
  url,
  method = 'GET',
  body,
  headers = {},
  params = {}
}: ApiRequestOptions): Promise<T> => {
  const token = await ensureToken();
  
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders['AuthKey'] = token;
  }

  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  const requestUrl = queryString ? `${url}?${queryString}` : url;

  try {
    const response = await fetch(requestUrl, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData as T;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

export const fetchWithAuth = async <T>(url: string, options: RequestInit = {}) => {
  const token = await ensureToken();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'AuthKey': token } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};