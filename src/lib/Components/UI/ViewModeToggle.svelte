<script lang="ts">
  let {
    currentMode = 'card',
    onModeChange = (mode: string) => {},
    onVisibilityChange = (visibility: boolean) => {},
    showAllWorkOrders = false,
    disabled = false,
    modes = [
      { id: 'card', label: 'Card View', icon: 'grid' },
      { id: 'list', label: 'List View', icon: 'list' }
    ],
    showVisibilityToggle = false
  } = $props<{
    currentMode?: string;
    onModeChange?: (mode: string) => void;
    onVisibilityChange?: (visibility: boolean) => void;
    showAllWorkOrders?: boolean;
    disabled?: boolean;
    modes?: Array<{ id: string; label: string; icon: string }>;
    showVisibilityToggle?: boolean;
  }>();

  function handleModeChange(modeId: string) {
    if (!disabled) {
      onModeChange(modeId);
    }
  }

  function handleVisibilityChange() {
    if (!disabled) {
      onVisibilityChange(!showAllWorkOrders);
    }
  }
</script>

<div class="view-mode-toggle d-flex gap-1">
  {#if showVisibilityToggle}
    <button
      class="btn {showAllWorkOrders ? 'btn-primary' : 'btn-outline-primary'}"
      onclick={handleVisibilityChange}
      disabled={disabled}
      title={showAllWorkOrders ? "Hide Closed Work Orders" : "Show All Work Orders"}
      aria-label={showAllWorkOrders ? "Hide Closed Work Orders" : "Show All Work Orders"}
    >
      <i class="bi bi-{showAllWorkOrders ? 'eye-slash' : 'eye'}"></i>
    </button>
  {/if}
  {#each modes as mode}
    <button
      class="btn {currentMode === mode.id ? 'btn-primary' : 'btn-outline-primary'}"
      onclick={() => handleModeChange(mode.id)}
      disabled={disabled}
      title={mode.label}
      aria-label={mode.label}
    >
      <i class="bi bi-{mode.icon}"></i>
    </button>
  {/each}
</div>