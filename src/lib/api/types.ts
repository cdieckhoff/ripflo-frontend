// Response wrapper interface
export interface ApiData<T> {
  data: T;
  error: {
    message: string;
  };
}

// Backend API response format interface - for responses with nested data structure
export interface BackendApiResponse<T> {
  data: {
    [key: string]: T;
  };
  error: {
    message: string;
  };
}