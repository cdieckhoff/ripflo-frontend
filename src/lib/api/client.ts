import { rfState } from '../rf.svelte';
import { type ApiError } from '../types/api-types.js';
import { type BackendApiResponse, type ApiData } from './types.js';
import { type Zip } from './endpoints/facilities.js';
import { getEpZips } from './endpoints.js';

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
  timing?: {
    startTime: number;
    endTime: number;
    duration: number; // milliseconds
  };
};

// Store for API timing data
export interface ApiTiming {
  endpoint: string;
  method: string;
  duration: number;
  timestamp: number;
  status: 'success' | 'error';
}

// In-memory store for recent API timings (last 100 calls)
export const apiTimingLog: ApiTiming[] = [];
const MAX_TIMING_ENTRIES = 100;

// Add timing to log
function logTiming(endpoint: string, method: string, duration: number, status: 'success' | 'error') {
  apiTimingLog.push({
    endpoint,
    method,
    duration,
    timestamp: Date.now(),
    status
  });
  // Keep only last MAX_TIMING_ENTRIES
  if (apiTimingLog.length > MAX_TIMING_ENTRIES) {
    apiTimingLog.shift();
  }
}

// Configuration based on rfState
const apiConfig = {
  baseUrl: typeof rfHost !== 'undefined' ? rfHost : '',
  timeout: 10000, // 10 seconds
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  retryAttempts: 3
};

// Fetch utility function
export async function apiFetch<T>(url: string, options: RequestInit = {}, tableKey?: string): Promise<ApiResult<T>> {
  const startTime = performance.now();
  const method = options.method || 'GET';

  // Ensure we have the correct baseUrl in the url
  if (!url.startsWith('http')) {
    url = `${apiConfig.baseUrl}${url}`;
  }

  // Add default headers
  let headers = {
    ...apiConfig.defaultHeaders,
    ...options.headers
  };

  // Add authorization token if user is logged in
  if (rfState.currentUser && rfState.currentUser.token) {
    headers = {
      ...headers,
      'Authorization': `Bearer ${rfState.currentUser.token}`
    };
  }

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = errorText || `HTTP error! status: ${response.status}`;
      const endTime = performance.now();
      const duration = endTime - startTime;
      logTiming(url, method, duration, 'error');
      return {
        data: null,
        error: new ApiResultError(errorMessage),
        timing: { startTime, endTime, duration }
      };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.json();
      const endTime = performance.now();
      const duration = endTime - startTime;
      logTiming(url, method, duration, 'success');

      // If tableKey is provided, normalize the response according to backend format
      if (tableKey) {
        if (typeof responseData === 'object' && responseData !== null && 'data' in responseData && 'error' in responseData) {
          // This looks like a backend response with nested data structure
          const backendResponse = responseData as BackendApiResponse<T>;
          return {
            data: backendResponse.data[tableKey] || null,
            error: backendResponse.error?.message ? new ApiResultError(backendResponse.error.message) : null,
            timing: { startTime, endTime, duration }
          };
        }
      }

      // Return the raw response if no tableKey provided or not in backend format
      return {
        data: responseData as T,
        error: null,
        timing: { startTime, endTime, duration }
      };
    } else {
      const textData = await response.text();
      const endTime = performance.now();
      const duration = endTime - startTime;
      logTiming(url, method, duration, 'success');
      return {
        data: textData as unknown as T,
        error: null,
        timing: { startTime, endTime, duration }
      };
    }
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    logTiming(url, method, duration, 'error');
    return {
      data: null,
      error: new ApiResultError(error instanceof Error ? error.message : 'Request failed'),
      timing: { startTime, endTime, duration }
    };
  }
}

// Normalize backend API response to common format
export function normalizeApiData<T>(response: BackendApiResponse<T[]>, tableKey: string): ApiData<T[]> {
  return {
    data: response.data[tableKey] || [],
    error: response.error
  };
}

// Generic function for responses with nested data structure from backend
export async function apiFetchWithNormalization<T>(
  url: string,
  options: RequestInit = {},
  tableKey: string
): Promise<ApiResult<T>> {
  // Since apiFetch now handles normalization when tableKey is provided, we can just call it directly
  return await apiFetch<T>(url, options, tableKey);
}

export async function loadZip(id:number): Promise<ApiResult<Zip[]>>{
  try {
    const response = await apiFetch<Zip[]>(`${getEpZips()}/${id}`, {}, 'zips');

    if (response.error) {
      return {
        data: null,
        error: response.error
      };
    }

    if (response.data) {
      // Map the response to match the Zip interface if needed
      // In case the API returns 'state' instead of 'state_name', map it appropriately
      const mappedData = response.data.map(zip => ({
        ...zip,
        // If the API returns 'state' instead of 'state_name', map it appropriately
        state_name: zip.state_name || (zip as any).state || ''
      }));

      return {
        data: mappedData,
        error: null
      };
    }

    return {
      data: null,
      error: new ApiResultError('No data returned from API')
    };
  } catch (error: any) {
    return {
      data: null,
      error: new ApiResultError(error.message || 'Network error occurred')
    };
  }
}
// Zip API functions
export async function getZip(id: number): Promise<Zip> {
  const result = await apiFetch<Zip>(`${getEpZips()}/${id}`);
  if (result.error) {
    throw result.error;
  }
  if (result.data === null) {
    throw new ApiResultError('No zip data returned from API');
  }
  return result.data;
}