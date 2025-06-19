
import { API_BASE_URL, AUTH_TOKEN_KEY } from './constants';

interface RequestOptions extends RequestInit {
  useAuthToken?: boolean;
}

async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { useAuthToken = true, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});
  headers.set('Content-Type', 'application/json');

  if (useAuthToken) {
    try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    } catch (e) {
        console.warn("localStorage is not available for auth token retrieval.");
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }
    console.error('API Error:', endpoint, response.status, errorData);
    throw { status: response.status, data: errorData, message: errorData?.error || errorData?.message || 'An API error occurred' };
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T; // Handle No Content responses
  }
  
  return response.json();
}

export default apiClient;
