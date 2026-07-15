import { type WorkOrder } from '../api/endpoints/workorders.js';
import { type Contact } from '../api/endpoints/contacts.js';
import { type Asset } from '../api/endpoints/assets.js';
import { type CachedEnums } from './consolidated-enums.js';
 
// WebSocket message types
export interface WorkOrderCreatedMessage {
  type: 'WorkOrderCreated';
  workorder_id: number;
  wo_text: string;
}

export interface WorkOrderUpdatedMessage {
  type: 'WorkOrderUpdated';
  workorder_id: number;
  wo_text: string;
}

export interface WorkOrderDeletedMessage {
  type: 'WorkOrderDeleted';
  workorder_id: number;
}

export interface ContactCreatedMessage {
  type: 'ContactCreated';
  contact_id: number;
  display_name: string;
}

export interface ContactUpdatedMessage {
  type: 'ContactUpdated';
  contact_id: number;
  display_name: string;
}

export interface ContactDeletedMessage {
  type: 'ContactDeleted';
  contact_id: number;
  display_name: string;
}

export interface GeneralMessage {
  type: 'General';
  event_type: string;
  data: any;
}

export type WebSocketMessage =
  | WorkOrderCreatedMessage
  | WorkOrderUpdatedMessage
  | WorkOrderDeletedMessage
  | ContactCreatedMessage
  | ContactUpdatedMessage
  | ContactDeletedMessage
  | GeneralMessage;

// WebSocket client interface
export interface RipfloWebSocketClient {
  connect: (wsHost: string) => void;
  disconnect: () => void;
  onMessage: (callback: (message: WebSocketMessage) => void) => void;
  onError: (callback: (error: Event) => void) => void;
  onClose: (callback: (event: CloseEvent) => void) => void;
}

// Error handling interface
export interface ApiError {
  message: string;
  status: number;
}

// Enhanced API client configuration
export interface ApiClientConfig {
  baseUrl: string;
  wsUrl: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
  retryAttempts?: number;
}

// User interface for login
export interface LoginUser {
  user_id: number;
  username: string;
  email?: string;
  role: string;
  fac_id?: number;
}

// User interface for authenticated user (includes token for API requests)
export interface AuthUser extends LoginUser {
  token: string;
}

// App state interface
export interface AppState {
  apiHost: string;
  wsHost: string;
  currentUser: AuthUser | null;
  isLoading: boolean;
  debug: boolean;
  isLoggedIn: boolean;
  currentView: string;
  selectedWorkOrder: WorkOrder | null;
  currentContact: Contact | null;
  workOrders: WorkOrder[];
  contacts: Contact[];
  assets: Asset[];
  parts: any[]; // Generic type for parts/inventory items until we add specific Part interface
  liveData: {
    type: string;
    data: any;
    timestamp: number;
  }[];
  cachedEnums: CachedEnums;
}