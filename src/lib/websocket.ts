import { type WorkOrder } from './api/endpoints/workorders.js';
import { type Contact } from './api/endpoints/contacts.js';
import { type Asset } from './api/endpoints/assets.js';
import { getWorkOrder } from './api/endpoints/workorders.js';
import { getContact } from './api/endpoints/contacts.js';
import { getAsset } from './api/endpoints/assets.js';
import { rfState } from './rf.svelte.js';

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

// WebSocket client interface with extended methods for reconnection
export interface RipfloWebSocketClient {
  connect: (wsHost: string) => void;
  disconnect: () => void;
  reconnect: () => void;
  onMessage: (callback: (message: WebSocketMessage) => void) => void;
  onError: (callback: (error: Event) => void) => void;
  onClose: (callback: (event: CloseEvent) => void) => void;
  onConnecting: (callback: () => void) => void;
  onReconnecting: (callback: (attempt: number) => void) => void;
  isConnected: () => boolean;
}

// Reconnection configuration
const RECONNECT_CONFIG = {
  initialDelay: 1000,      // Start with 1 second
  maxDelay: 30000,         // Max 30 seconds
  multiplier: 2,           // Exponential backoff
  maxAttempts: 0           // 0 = infinite retries
};

// Heartbeat configuration
const HEARTBEAT_CONFIG = {
  interval: 30000,         // Send ping every 30 seconds
  timeout: 10000           // Expect pong within 10 seconds
};

// WebSocket client implementation
export function createRipfloWebSocketClient(): RipfloWebSocketClient {
  let ws: WebSocket | null = null;
  let wsHost: string = typeof rfwsHost !== 'undefined' ? rfwsHost : '';
  
  // Callbacks
  let onMessageCallback: ((message: WebSocketMessage) => void) | null = null;
  let onErrorCallback: ((error: Event) => void) | null = null;
  let onCloseCallback: ((event: CloseEvent) => void) | null = null;
  let onConnectingCallback: (() => void) | null = null;
  let onReconnectingCallback: ((attempt: number) => void) | null = null;
  
  // Connection state
  let reconnectAttempts = 0;
  let reconnectDelay = RECONNECT_CONFIG.initialDelay;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;
  let isConnecting = false;
  let shouldReconnect = true;
  let isManuallyDisconnected = false;

  // Start heartbeat mechanism
  function startHeartbeat() {
    stopHeartbeat();
    
    heartbeatTimer = setTimeout(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        // Send ping
        ws.send(JSON.stringify({ Ping: {} }));
        //console.log('[WebSocket] Sent heartbeat ping');
        
        // Set timeout for pong response
        heartbeatTimeout = setTimeout(() => {
          console.warn('[WebSocket] Heartbeat timeout - no pong received, reconnecting');
          scheduleReconnect();
        }, HEARTBEAT_CONFIG.timeout);
      }
    }, HEARTBEAT_CONFIG.interval);
  }

  // Stop heartbeat
  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearTimeout(heartbeatTimer);
      heartbeatTimer = null;
    }
    if (heartbeatTimeout) {
      clearTimeout(heartbeatTimeout);
      heartbeatTimeout = null;
    }
  }

  // Schedule reconnection with exponential backoff
  function scheduleReconnect() {
    if (isManuallyDisconnected) {
      //console.log('[WebSocket] Manual disconnect, not reconnecting');
      return;
    }

    if (RECONNECT_CONFIG.maxAttempts > 0 && reconnectAttempts >= RECONNECT_CONFIG.maxAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      shouldReconnect = false;
      return;
    }

    const delay = Math.min(reconnectDelay, RECONNECT_CONFIG.maxDelay);
    reconnectDelay *= RECONNECT_CONFIG.multiplier;
    reconnectAttempts++;

    console.log(`[WebSocket] Scheduling reconnect in ${delay}ms (attempt ${reconnectAttempts})`);
    
    if (onReconnectingCallback) {
      onReconnectingCallback(reconnectAttempts);
    }

    reconnectTimer = setTimeout(() => {
      //console.log('[WebSocket] Attempting to reconnect');
      connect(wsHost);
    }, delay);
  }

  // Reset reconnection state
  function resetReconnectState() {
    reconnectAttempts = 0;
    reconnectDelay = RECONNECT_CONFIG.initialDelay;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  // Connect to WebSocket
  function connect(host: string) {
    if (isConnecting) {
      //console.log('[WebSocket] Already connecting, skipping');
      return;
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      //console.log('[WebSocket] Already connected');
      return;
    }

    isConnecting = true;
    wsHost = host || (typeof rfwsHost !== 'undefined' ? rfwsHost : wsHost);

    if (!wsHost) {
      console.error('[WebSocket] No WebSocket host configured');
      isConnecting = false;
      return;
    }

    if (onConnectingCallback) {
      onConnectingCallback();
    }

    // Close existing connection if any
    if (ws) {
      ws.close();
      ws = null;
    }

    try {
      ws = new WebSocket(wsHost);

      ws.onopen = () => {
        //console.log(`[WebSocket] Connected to ${wsHost}`);
        isConnecting = false;
        resetReconnectState();
        startHeartbeat();
        
        // Notify callbacks
        if (onMessageCallback) {
          // Send a connected message to update UI
          onMessageCallback({
            type: 'General',
            event_type: 'Connected',
            data: { timestamp: Date.now() }
          } as GeneralMessage);
        }
      };

      ws.onmessage = (event) => {
        try {
          const rawMsg = JSON.parse(event.data);

          // Handle backend ping (empty JSON object for keep-alive)
          if (Object.keys(rawMsg).length === 0) {
            //console.log('[WebSocket] Backend ping received');
            ws?.send(JSON.stringify({ Pong: {} }));
            return;
          }

          // Handle heartbeat pong
          if (rawMsg.Pong) {
            //console.log('[WebSocket] Heartbeat pong received');
            if (heartbeatTimeout) {
              clearTimeout(heartbeatTimeout);
              heartbeatTimeout = null;
            }
            return;
          }

          //console.log('[WebSocket] Received message:', rawMsg);

          let msg: WebSocketMessage;

          // Handle the actual server message format
          if (rawMsg.WorkOrderCreated) {
            msg = {
              type: 'WorkOrderCreated',
              workorder_id: rawMsg.WorkOrderCreated.workorder_id,
              wo_text: rawMsg.WorkOrderCreated.wo_text
            };
            if (msg.type === 'WorkOrderCreated') {
              updateWorkOrderInState(msg.workorder_id);
            }
          } else if (rawMsg.WorkOrderUpdated) {
            msg = {
              type: 'WorkOrderUpdated',
              workorder_id: rawMsg.WorkOrderUpdated.workorder_id,
              wo_text: rawMsg.WorkOrderUpdated.wo_text
            };
            if (msg.type === 'WorkOrderUpdated') {
              updateWorkOrderInState(msg.workorder_id);
            }
          } else if (rawMsg.WorkOrderDeleted) {
            msg = {
              type: 'WorkOrderDeleted',
              workorder_id: rawMsg.WorkOrderDeleted.workorder_id
            };
            if (msg.type === 'WorkOrderDeleted') {
              rfState.workOrders = rfState.workOrders.filter(wo => wo.workorder_id !== msg.workorder_id);
            }
          } else if (rawMsg.ContactCreated) {
            msg = {
              type: 'ContactCreated',
              contact_id: rawMsg.ContactCreated.contact_id,
              display_name: rawMsg.ContactCreated.display_name
            };
            if (msg.type === 'ContactCreated') {
              updateContactInState(msg.contact_id);
            }
          } else if (rawMsg.ContactUpdated) {
            msg = {
              type: 'ContactUpdated',
              contact_id: rawMsg.ContactUpdated.contact_id,
              display_name: rawMsg.ContactUpdated.display_name
            };
            if (msg.type === 'ContactUpdated') {
              updateContactInState(msg.contact_id);
            }
          } else if (rawMsg.ContactDeleted) {
            msg = {
              type: 'ContactDeleted',
              contact_id: rawMsg.ContactDeleted.contact_id,
              display_name: rawMsg.ContactDeleted.display_name
            };
            if (msg.type === 'ContactDeleted') {
              rfState.contacts = rfState.contacts.filter(c => c.contact_id !== msg.contact_id);
            }
          } else if (rawMsg.General) {
            msg = {
              type: 'General',
              event_type: rawMsg.General.event_type,
              data: rawMsg.General.data
            };
            rfState.liveData.push({
              type: msg.event_type,
              data: msg.data,
              timestamp: Date.now()
            });
          } else {
            //console.error('[WebSocket] Unknown message format:', rawMsg);
            return;
          }

          if (onMessageCallback) {
            onMessageCallback(msg);
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`[WebSocket] Closed: code=${event.code}, reason=${event.reason || 'none'}`);
        isConnecting = false;
        stopHeartbeat();
        ws = null;
        
        if (onCloseCallback) {
          onCloseCallback(event);
        }

        // Attempt to reconnect if not manually disconnected
        if (shouldReconnect && !isManuallyDisconnected) {
          scheduleReconnect();
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        isConnecting = false;
        stopHeartbeat();
        
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      };
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
      isConnecting = false;
      scheduleReconnect();
    }
  }

  // Disconnect from WebSocket
  function disconnect() {
    isManuallyDisconnected = true;
    shouldReconnect = false;
    stopHeartbeat();
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    
    if (ws) {
      ws.close(1000, 'Client disconnect');
      ws = null;
    }
  }

  // Reconnect to WebSocket
  function reconnect() {
    isManuallyDisconnected = false;
    shouldReconnect = true;
    resetReconnectState();
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      //console.log('[WebSocket] Already connected, skipping reconnect');
      return;
    }
    
    //console.log('[WebSocket] Initiating reconnect');
    connect(wsHost);
  }

  // Check if connected
  function isConnected(): boolean {
    return ws !== null && ws.readyState === WebSocket.OPEN;
  }

  return {
    connect,
    disconnect,
    reconnect,
    onMessage: (callback: (message: WebSocketMessage) => void) => {
      onMessageCallback = callback;
    },
    onError: (callback: (error: Event) => void) => {
      onErrorCallback = callback;
    },
    onClose: (callback: (event: CloseEvent) => void) => {
      onCloseCallback = callback;
    },
    onConnecting: (callback: () => void) => {
      onConnectingCallback = callback;
    },
    onReconnecting: (callback: (attempt: number) => void) => {
      onReconnectingCallback = callback;
    },
    isConnected
  };
}

// Helper function to update work order in state
async function updateWorkOrderInState(workorderId: number) {
  try {
    const response = await getWorkOrder(workorderId);
    if ((response.error === null || response.error.message === null || response.error.message === '') && response.data && response.data.length > 0) {
      const updatedWorkOrder = response.data[0];
      if (updatedWorkOrder) {
        const index = rfState.workOrders.findIndex(wo => wo.workorder_id === workorderId);
        if (index !== -1) {
          rfState.workOrders[index] = updatedWorkOrder;
        } else {
          rfState.workOrders = [...rfState.workOrders, updatedWorkOrder];
        }
      }
    }
  } catch (error) {
    console.error(`Error updating work order ${workorderId} from WebSocket event:`, error);
  }
}

// Helper function to update contact in state
async function updateContactInState(contactId: number) {
  try {
    const response = await getContact(contactId);
    if ((response.error === null || response.error.message === null || response.error.message === '') && response.data && response.data.length > 0) {
      const updatedContact = response.data[0];
      if (updatedContact) {
        const index = rfState.contacts.findIndex(c => c.contact_id === contactId);
        if (index !== -1) {
          rfState.contacts[index] = updatedContact;
        } else {
          rfState.contacts = [...rfState.contacts, updatedContact];
        }
      }
    }
  } catch (error) {
    console.error(`Error updating contact ${contactId} from WebSocket event:`, error);
  }
}

// Helper function to update asset in state
async function updateAssetInState(assetId: number) {
  try {
    const response = await getAsset(assetId);
    if ((response.error === null || response.error.message === null || response.error.message === '') && response.data && response.data.length > 0) {
      const updatedAsset = response.data[0];
      if (updatedAsset) {
        const index = rfState.assets.findIndex(a => a.asset_id === assetId);
        if (index !== -1) {
          rfState.assets[index] = updatedAsset;
        } else {
          rfState.assets = [...rfState.assets, updatedAsset];
        }
      }
    }
  } catch (error) {
    console.error(`Error updating asset ${assetId} from WebSocket event:`, error);
  }
}

// Global WebSocket client instance
export let globalWsClient: RipfloWebSocketClient | null = null;

// Function to initialize the global WebSocket client
export function initWebSocketClient(): RipfloWebSocketClient {
  globalWsClient = createRipfloWebSocketClient();
  return globalWsClient;
}

// Function to get the global WebSocket client
export function getWebSocketClient(): RipfloWebSocketClient | null {
  return globalWsClient;
}
