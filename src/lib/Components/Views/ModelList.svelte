<script>
  import { rfState } from '';
  import ModelCard from '../DataDisplay/ModelCard.svelte';

  // Props
  let { disabled = false } = $props();

  // Local state
  let models = $state([]);
  let loading = $state(true);
  let error = $state(null);
  let searchTerm = $state('');
  let sortBy = $state('name');
  let sortDirection = $state('asc');
  let selectedModels = $state([]);

  // Load models on initialization
  $effect(() => {
    loadModels();
  });

  async function loadModels() {
    try {
      loading = true;
      const result = await rfState.api.getModels();
      
      if (result?.error?.message && result.error.message.trim() !== '') {
        error = result.error.message;
      } else {
        models = result?.data?.models || [];
      }
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  // Filter and sort models
  $derived({
    let result = models;
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(model => 
        model.model_name.toLowerCase().includes(lowerSearchTerm) ||
        (model.model_number && model.model_number.toLowerCase().includes(lowerSearchTerm)) ||
        (model.brand && model.brand.brand_name.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.model_name.localeCompare(b.model_name);
          break;
        case 'brand':
          comparison = (a.brand?.brand_name || '').localeCompare(b.brand?.brand_name || '');
          break;
        case 'category':
          comparison = (a.category?.name || '').localeCompare(b.category?.name || '');
          break;
        case 'date':
          comparison = new Date(a.created_at || 0) - new Date(b.created_at || 0);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  });

  // Handle model selection
  function handleModelSelect(model) {
    if (!selectedModels.some(m => m.id === model.id)) {
      selectedModels = [...selectedModels, model];
    } else {
      selectedModels = selectedModels.filter(m => m.id !== model.id);
    }
  }

  // Check if a model is selected
  function isModelSelected(model) {
    return selectedModels.some(m => m.id === model.id);
  }

  // Handle sort change
  function handleSortChange(field) {
    if (sortBy === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = field;
      sortDirection = 'asc';
    }
  }

  // Bulk delete selected models
  async function bulkDelete() {
    if (selectedModels.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedModels.length} model(s)?`)) {
      return;
    }
    
    try {
      for (const model of selectedModels) {
        const result = await rfState.api.deleteModel(model.id);
        if (result?.error?.message && result.error.message.trim() !== '') {
          console.error(`Error deleting model ${model.id}:`, result.error.message);
        }
      }
      
      // Reload models after deletion
      await loadModels();
      selectedModels = [];
    } catch (err) {
      error = `Error deleting models: ${err.message}`;
    }
  }

  // Method to refresh the model list
  async function refreshList() {
    await loadModels();
    selectedModels = [];
  }

  // Export method for parent components
  export { refreshList };
</script>

<div class="model-list">
  <div class="list-controls">
    <input
      type="text"
      placeholder="Search models..."
      bind:value={searchTerm}
      disabled={disabled}
    />
    
    <div class="sort-controls">
      <label>Sort by:</label>
      <select bind:value={sortBy} onchange={() => handleSortChange(sortBy)} disabled={disabled}>
        <option value="name">Name</option>
        <option value="brand">Brand</option>
        <option value="category">Category</option>
        <option value="date">Date Created</option>
      </select>
      
      <button 
        onclick={() => handleSortChange(sortBy)}
        disabled={disabled}
        title={sortDirection === 'asc' ? "Sort Descending" : "Sort Ascending"}
      >
        {sortDirection === 'asc' ? '↑' : '↓'}
      </button>
    </div>
    
    {selectedModels.length > 0 && (
      <button 
        onclick={bulkDelete}
        disabled={disabled}
        title="Delete Selected Models"
      >
        Delete Selected ({selectedModels.length})
      </button>
    )}
    
    <button 
      onclick={refreshList}
      disabled={disabled}
      title="Refresh List"
    >
      Refresh
    </button>
  </div>

  {#if loading}
    <div class="loading">Loading models...</div>
  {/if}

  {#if error}
    <div class="error">Error: {error}</div>
  {/if}

  {#if not loading and not error}
    {#if filteredModels.length === 0}
      <div class="no-results">No models found</div>
    {:else}
      <div class="models-grid">
        {#each filteredModels as model}
          <ModelCard
            model={model}
            disabled={disabled}
            class={isModelSelected(model) ? 'selected' : ''}
            onclick={() => handleModelSelect(model)}
          />
        {/each}
      </div>
    {/if}
  {/if}
</div>