<script lang="ts">
  // Props
  let {
    options = [],
    disabled = false,
    preselectedValue = '',
    placeholder = 'Select...',
    onSelectionChange = null
  } = $props<{
    options?: Array<{ id: string | number; name: string }>;
    disabled?: boolean;
    preselectedValue?: string | number;
    placeholder?: string;
    onSelectionChange?: (value: string | number) => void;
  }>();

  // Local state - track the current selection
  let selectedValue = $state(preselectedValue);

  // Handle selection change
  function handleSelectionChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    
    // Update local state
    selectedValue = value;
    
    // Notify parent
    if (onSelectionChange) {
      onSelectionChange(value);
    }
  }
</script>

<div class="selector-component">
  <select
    class="form-select"
    bind:value={selectedValue}
    onchange={handleSelectionChange}
    disabled={disabled}
    title={placeholder}
  >
    <option value="">{placeholder}</option>
    {#each options as option}
      <option value={option.id}>
        {option.name}
      </option>
    {/each}
  </select>
</div>