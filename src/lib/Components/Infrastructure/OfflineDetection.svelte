<script lang="ts">
  import { onMount } from 'svelte';
  import { toastStore } from '../../stores/toastStore';

  // State for online/offline status
  let isOnline = $state(navigator.onLine);

  // Initialize
  $effect(() => {
    // Check initial connection status
    isOnline = navigator.onLine;

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  // Handler for when we go online
  function handleOnline() {
    isOnline = true;
    toastStore.add('Connection restored', 'success');
  }

  // Handler for when we go offline
  function handleOffline() {
    isOnline = false;
    toastStore.add('You are offline. Some features may be limited.', 'warning');
  }

  // Function to check if we're online
  export function checkOnlineStatus(): boolean {
    return isOnline;
  }
</script>

<!-- This component provides offline detection and shows connection status -->
<div class="offline-detection d-flex align-items-center">
  {#if isOnline}
    <i class="bi bi-wifi me-2 text-success" title="Online"></i>
    <span class="badge bg-success">
      <small>Online</small>
    </span>
  {:else}
    <i class="bi bi-wifi-off me-2 text-warning" title="Offline"></i>
    <span class="badge bg-warning text-dark">
      <small>Offline</small>
    </span>
  {/if}
</div>