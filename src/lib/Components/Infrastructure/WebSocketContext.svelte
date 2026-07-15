<script lang="ts">
  import { onMount } from 'svelte';
  import { getWebSocketClient, initWebSocketClient } from '../../websocket';
  import { rfState } from '../../rf.svelte';

  // State for WebSocket connection status
  let isConnected = $state(false);
  let connectionError = $state<string | null>(null);
  let isConnecting = $state(false);
  let isReconnecting = $state(false);
  let reconnectAttempt = $state(0);
  let messages = $state([]);

  // Get the app state to update when WebSocket messages arrive
  const appState = rfState;

  onMount(() => {
    connectWebSocket();
    setupVisibilityListener();
  });

  // Function to connect to WebSocket
  function connectWebSocket() {
    isConnecting = true;
    connectionError = null;

    try {
      // Get or initialize the global WebSocket client instance
      let wsClient = getWebSocketClient();
      if (!wsClient) {
        wsClient = initWebSocketClient();
      }

      // Use the global WebSocket URL from rfjs.js
      const wsHost = typeof rfwsHost !== 'undefined' ? rfwsHost : appState.wsHost;

      if (!wsHost) {
        connectionError = 'WebSocket host not configured';
        console.warn('WebSocket host not configured, skipping connection');
        isConnecting = false;
        return;
      }

      // Set up WebSocket event handlers
      wsClient.onMessage((message) => {
        // Add message to the messages array for debugging
        messages = [...messages, message];
        //console.log('Received WebSocket message:', message);

        // Handle connection status messages
        if (message.type === 'General' && message.event_type === 'Connected') {
          isConnected = true;
          isConnecting = false;
          isReconnecting = false;
          connectionError = null;
          reconnectAttempt = 0;
        }
      });

      wsClient.onClose((event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        isConnected = false;
        isConnecting = false;
        // Don't set error on close - reconnection will happen automatically
      });

      wsClient.onError((error) => {
        console.error('WebSocket error:', error);
        isConnected = false;
        isConnecting = false;
        connectionError = (error as ErrorEvent).message || 'WebSocket connection error';
      });

      wsClient.onConnecting(() => {
        //console.log('WebSocket connecting...');
        isConnecting = true;
        isReconnecting = false;
        connectionError = null;
      });

      wsClient.onReconnecting((attempt) => {
        console.log(`WebSocket reconnecting (attempt ${attempt})...`);
        isReconnecting = true;
        isConnecting = true;
        reconnectAttempt = attempt;
        connectionError = `Reconnecting... (attempt ${attempt})`;
      });

      // Connect to WebSocket
      wsClient.connect(wsHost);
    } catch (err) {
      connectionError = err instanceof Error ? err.message : 'Failed to establish WebSocket connection';
      console.error('WebSocket connection error:', err);
      isConnecting = false;
    }
  }

  // Setup visibility change listener for mobile reconnection
  function setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Tab became visible - check if we need to reconnect
        const wsClient = getWebSocketClient();
        if (wsClient && !wsClient.isConnected()) {
          console.log('[WebSocket] Tab visible, initiating reconnect');
          wsClient.reconnect();
        }
      }
    });
  }

  // Cleanup function
  const cleanup = () => {
    const wsClient = getWebSocketClient();
    if (wsClient) {
      wsClient.disconnect();
    }
    document.removeEventListener('visibilitychange', setupVisibilityListener);
  };

  // Ensure cleanup happens when component is destroyed
  $effect(() => {
    return cleanup;
  });
</script>

<!-- WebSocket status indicator with broadcast icon -->
  <div class="websocket-context d-flex align-items-center">
    <i class="bi bi-broadcast me-2" title="Real-time Updates"></i>
    {#if connectionError && !isReconnecting}
      <span class="badge bg-danger">
        <small>Disconnected</small>
      </span>
    {:else if isReconnecting}
      <span class="badge bg-warning text-dark">
        <small>Reconnecting ({reconnectAttempt})...</small>
      </span>
    {:else if isConnected}
      <span class="badge bg-success">
        <small>Connected</small>
      </span>
    {:else if isConnecting}
      <span class="badge bg-warning text-dark">
        <small>Connecting...</small>
      </span>
    {/if}
  </div>
