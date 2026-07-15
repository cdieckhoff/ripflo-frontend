<script lang="ts">
  import { onMount } from 'svelte';
  import Toast from '../UI/Toast.svelte';
  import { toastStore } from '../../stores/toastStore';

  let { toasts } = $state({ toasts: [] as { id: string; message: string; type: 'success' | 'error' | 'warning' | 'info'; duration?: number }[] });

  // Subscribe to toast store
  $effect(() => {
    const unsubscribe = toastStore.subscribe(value => {
      toasts = value;
    });

    // Cleanup
    return unsubscribe;
  });
</script>

<div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1100;">
  {#each toasts as toast (toast.id)}
    <Toast
      message={toast.message}
      type={toast.type}
      visible={true}
      duration={toast.duration || 5000}
    />
  {/each}
</div>