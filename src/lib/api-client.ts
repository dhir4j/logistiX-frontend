
import { API_BASE_URL } from './constants';

// Removed RequestOptions and useAuthToken logic

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {} // Standard RequestInit
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  // Removed Authorization header logic

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options, // Use options directly
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, use statusText or a generic message
      errorData = { message: response.statusText || 'An API error occurred without a JSON body' };
    }
    console.error('API Error:', endpoint, response.status, errorData);
    // Ensure the error object always has a message for consistent handling
    const message = errorData?.error || errorData?.message || `API request failed with status ${response.status}`;
    throw { status: response.status, data: errorData, message: message };
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T; // Handle No Content responses
  }
  
  return response.json();
}

export default apiClient;
