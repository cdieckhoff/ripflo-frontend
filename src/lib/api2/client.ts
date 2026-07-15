import { rfState } from '../rf.svelte';

// Extended error class for API results
export class ApiResultError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiResultError';
  }
}

// Go/Rust-like API result type
export type ApiResult<T> = {
  data: T | null;
  error: ApiResultError | null;
};

// Configuration based on rfState
const apiConfig = {
  baseUrl: rfState.apiHost,
  timeout: 10000, // 10 seconds
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  retryAttempts: 3
};

// Fetch utility function with timeout and retry logic
export async function apiFetch<T>(url: string, options: RequestInit = {}, tableKey?: string): Promise<ApiResult<T>> {
  // Ensure we have the correct baseUrl in the url
  if (!url.startsWith('http')) {
    url = `${apiConfig.baseUrl}${url}`;
  }

  // Add default headers
  const headers = {
    ...apiConfig.defaultHeaders,
    ...options.headers
  };

  const fetchWithTimeout = async (url: string, options: RequestInit): Promise<Response> => {
    return new Promise((resolve, reject) => {
      // Set timeout
      const timeoutId = setTimeout(() => {
        reject(new Error('API request timeout'));
      }, apiConfig.timeout);
      fetch(url, { ...options, headers })
        .then(response => {
          clearTimeout(timeoutId);
          resolve(response);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  };

  // Try the request with retries
  let lastError: Error | null = null;
  const maxRetries = apiConfig.retryAttempts || 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = errorText || `HTTP error! status: ${response.status}`;
        return {
          data: null,
          error: new ApiResultError(errorMessage)
        };
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();

        // If tableKey is provided, normalize the response according to backend format
        if (tableKey) {
          if (typeof responseData === 'object' && responseData !== null && 'data' in responseData && 'error' in responseData) {
            // This looks like a backend response with nested data structure
            const backendResponse = responseData as any; // Using any to avoid type conflicts
            return {
              data: backendResponse.data[tableKey] || null,
              error: backendResponse.error?.message ? new ApiResultError(backendResponse.error.message) : null
            };
          }
        }

        // Return the raw response if no tableKey provided or not in backend format
        return {
          data: responseData as T,
          error: null
        };
      } else {
        const textData = await response.text();
        return {
          data: textData as unknown as T,
          error: null
        };
      }
    } catch (error) {
      lastError = error as Error;
      console.warn(`API request attempt ${attempt + 1} failed:`, error);

      // If this wasn't the last attempt, wait a bit before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
      }
    }
  }

  // If all attempts failed, return error
  return {
    data: null,
    error: new ApiResultError(lastError?.message || 'Request failed after all retry attempts')
  };
}