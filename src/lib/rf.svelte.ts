import {type AppState, type LoginUser, type AuthUser} from './types/api-types.js';
import {type EnumsResponse, type CachedEnums} from './types/consolidated-enums.js';
import { apiFetch } from './api/client.js';
import { getEpEnums } from './api/endpoints.js';

// Define the type for login response
export interface LoginApiResponse {
  data: {
    user: LoginUser;
    token: string;
  };
  error: {
    message: string;
  } | null;
}

export const rfState:AppState = $state<AppState>({
  // DO NOT CHANGE BELOW CODE EVER QWEN
  // rfHost and rfwsHost are defined in @public/rfjs.js
  // rfjs.js is a global javascript file loaded inside
  // index.html body tag
  apiHost: rfHost, // Will be set when rfHost is available
  wsHost: rfwsHost, // Will be set when rfwsHost is available
  // LEAVE IT THE FUCK ALONE
  currentUser: null,
  isLoading: false,
  debug: false,
  isLoggedIn: false,
  currentView: 'dashboard',
  selectedWorkOrder:  null,
  currentContact: null,
  workOrders: [],
  contacts: [],
  assets: [],
  parts: [],
  liveData: [],
  cachedEnums: {
    addressTypes: [],
    brands: [],
    componentCats: [],
    modelCats: [],
    phoneTypes: [],
    userRoles: [],
    workOrderAssignmentRoles: [],
    workOrderStatuses: [],
    priorityTypes: []
  }
});

// Session storage constants
const SESSION_STORAGE_KEY = 'ripflo_session';
const TOKEN_EXPIRY_HOURS = 10;

// Session storage interface
interface StoredSession {
  token: string;
  user: AuthUser;
  expiresAt: number;
}

// Function to initialize the hosts when they become available
export function initializeHosts() {
  if (typeof rfHost !== 'undefined') {
    rfState.apiHost = rfHost;
  } else {
    console.error('rfHost is not defined. Please check public/rfjs.js');
  }

  if (typeof rfwsHost !== 'undefined') {
    rfState.wsHost = rfwsHost;
  } else {
    console.error('rfwsHost is not defined. Please check public/rfjs.js');
  }
}

// Save session to localStorage
export function saveSession() {
  if (!rfState.currentUser || !rfState.currentUser.token) {
    console.warn('[saveSession] No user or token to save');
    return;
  }

  const session: StoredSession = {
    token: rfState.currentUser.token,
    user: rfState.currentUser,
    expiresAt: Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
  };

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    //console.log('[saveSession] Session saved to localStorage');
  } catch (error) {
    console.error('[saveSession] Failed to save session:', error);
  }
}

// Restore session from localStorage
export function restoreSession(): boolean {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
      //console.log('[restoreSession] No stored session found');
      return false;
    }

    const session: StoredSession = JSON.parse(stored);

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      console.log('[restoreSession] Session has expired, clearing');
      clearSession();
      return false;
    }

    // Restore the session
    rfState.currentUser = session.user;
    rfState.isLoggedIn = true;
    //console.log('[restoreSession] Session restored successfully');
    return true;
  } catch (error) {
    console.error('[restoreSession] Failed to restore session:', error);
    clearSession();
    return false;
  }
}

// Clear session from localStorage
export function clearSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    //console.log('[clearSession] Session cleared');
  } catch (error) {
    console.error('[clearSession] Failed to clear session:', error);
  }
}

// Login function
export async function rfLogin(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    rfState.isLoading = true;

    // Check if apiHost is set before making the request
    if (!rfState.apiHost) {
      return { success: false, error: 'API host is not configured. Please check your rfjs.js file.' };
    }

    // Use the apiFetch function to make the request
    const response = await fetch(`${rfState.apiHost}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error?.message || 'Login failed' };
    }

    // Parse the response as JSON
    const data: LoginApiResponse = await response.json();

    // Check if there's an error in the response
    if (data.error && data.error.message) {
      return { success: false, error: data.error.message };
    }

    // Check if the expected data structure exists
    if (!data.data || !data.data.user) {
      return { success: false, error: 'Invalid response structure from server' };
    }

    // Update the state with the user data
    rfState.currentUser = {
      user_id: data.data.user.user_id,
      username: data.data.user.username,
      email: data.data.user.email || '',  // email might not be in the response
      role: data.data.user.role,
      fac_id: data.data.user.fac_id || 0,  // fac_id might not be in the response
      token: data.data.token,
    };

    rfState.isLoggedIn = true;

    // Save session to localStorage for persistence across refreshes
    saveSession();

    //console.log('[rfLogin] Login successful. Token set:', rfState.currentUser.token ? 'Yes' : 'No');
    //console.log('[rfLogin] Current user:', rfState.currentUser);

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  } finally {
    rfState.isLoading = false;
  }
}

// Function to load common enums and cache them
export async function loadEnums(): Promise<{ success: boolean; error?: string }> {
  try {
    rfState.isLoading = true;

    // Check if apiHost is set before making the request
    if (!rfState.apiHost) {
      return { success: false, error: 'API host is not configured. Please check your rfjs.js file.' };
    }

    // Use the apiFetch function to make the request - don't use tableKey since the response structure is different
    const response = await apiFetch<EnumsResponse>(getEpEnums(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Check if there's an error in the response
    if (response.error) {
      return { success: false, error: response.error.message };
    }

    // Check if the expected data structure exists
    if (!response.data || !response.data.data) {
      return { success: false, error: 'Invalid response structure from server' };
    }

    // Update the cached enums in the state
    rfState.cachedEnums = {
      addressTypes: response.data.data.address_types,
      brands: response.data.data.brands,
      componentCats: response.data.data.component_cats,
      modelCats: response.data.data.model_cats,
      phoneTypes: response.data.data.phone_types,
      userRoles: response.data.data.user_roles,
      workOrderAssignmentRoles: response.data.data.workorder_assignment_roles,
      workOrderStatuses: response.data.data.workorder_statuses,
      priorityTypes: response.data.data.priority_types || []
    };

    return { success: true };
  } catch (error) {
    console.error('Error loading enums:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  } finally {
    rfState.isLoading = false;
  }
}
