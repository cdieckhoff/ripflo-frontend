import { apiFetch, type ApiResult } from '../client.js';
import { getEpHealth } from '../endpoints.js';

export async function healthCheck(): Promise<{ data: { status: string; message?: string }; error: { message: string } }> {
  try {
    const response = await fetch(`${rfHost}/health`);
    if (response.ok) {
      const data = await response.json();
      return {
        data: { status: data.status, message: data.message },
        error: { message: '' }
      };
    } else {
      return {
        data: { status: 'error', message: 'Health check failed' },
        error: { message: 'Response not ok' }
      };
    }
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      data: { status: 'error', message: 'Network error' },
      error: { message: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}