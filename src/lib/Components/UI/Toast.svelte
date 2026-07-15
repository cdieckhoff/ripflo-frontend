<script lang="ts">
  import { onMount } from 'svelte';

  let { message = '', type = 'info', visible = false, duration = 5000 } = $props<{
    message?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    visible?: boolean;
    duration?: number;
  }>();

  let internalVisible = $state(false);
  let timeoutId: number | null = null;

  // Update visibility when prop changes
  $effect(() => {
    if (visible) {
      internalVisible = true;
      if (duration > 0) {
        timeoutId = window.setTimeout(() => {
          internalVisible = false;
        }, duration);
      }
    } else {
      internalVisible = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }
  });

  // Close toast
  function close() {
    internalVisible = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  // Get CSS classes based on toast type
  function getClasses() {
    const baseClasses = 'toast position-fixed end-0 m-3 p-2 rounded text-light border-0 z-index-1000';
    const typeClasses = {
      success: 'bg-success',
      error: 'bg-danger',
      warning: 'bg-warning text-dark',
      info: 'bg-primary'
    };
    return `${baseClasses} ${typeClasses[type]}`;
  }
</script>

{#if internalVisible}
  <div class={getClasses()} role="alert" aria-live="assertive" aria-atomic="true">
    <div class="d-flex">
      <div class="toast-body">
        {message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close" onclick={close}></button>
    </div>
  </div>
{/if}