<script lang="ts">
  import { listBrands, listModels, createModel, updateModel } from '$lib/api2/equipment';
  import type { Model, CreateModelRequest, UpdateModelRequest, Brand } from '$lib/api2/equipment';
  import ModelCategorySelector from './ModelCategorySelector.svelte';

  // Props
  let {
    model = null, // Model or null for new
    disabled = false
  } = $props<{
    model?: Model | null;
    disabled?: boolean
  }>();

  // Local state
  let modelData = $state<Partial<Model>>({
    brand_id: model?.brand_id || null,
    model_cat_id: model?.model_cat_id || null,
    model_name: model?.model_name || ''
  });
  let brands = $state<Brand[]>([]);
  let models = $state<Model[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Load brands and models on initialization
  $effect(() => {
    loadBrands();
    loadModels();
  });

  async function loadBrands() {
    try {
      const result = await listBrands();

      if (result.error) {
        error = result.error.message;
      } else {
        brands = result.data || [];
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load brands';
    }
  }

  async function loadModels() {
    try {
      const result = await listModels();

      if (result.error) {
        // Don't set error if it's just an empty list
        if (result.error.message && result.error.message !== '') {
          error = result.error.message;
        }
      } else {
        models = result.data || [];
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load models';
    } finally {
      loading = false;
    }
  }

  // Handle form submission
  // svelte-ignore non_reactive_update
    async function handleSubmit() {
    if (!modelData.model_name?.trim()) {
      error = 'Model name is required';
      return;
    }

    if (!modelData.brand_id) {
      error = 'Brand is required';
      return;
    }

    try {
      if (model && model.model_id) {
        // Update existing model
        const result = await updateModel(model.model_id, modelData as UpdateModelRequest);

        if (result.error) {
          error = result.error.message;
          return;
        }
      } else {
        // Create new model
        const result = await createModel(modelData as CreateModelRequest);

        if (result.error) {
          error = result.error.message;
          return;
        }
      }

      // Success - notify parent or reset form
      console.log('Model saved successfully');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to save model';
    }
  }

  // Handle category selection
  function handleCategorySelect(selectedCats: { id: number; name: string }[]) {
    if (selectedCats.length > 0) {
      modelData.model_cat_id = selectedCats[0].id;
    } else {
      modelData.model_cat_id = null;
    }
  }

  // Expose form data to parent is handled via the handleSubmit function

  // Method to get form data
  function getFormData() {
    return { ...modelData };
  }

  // Export method for parent components
  export { getFormData, handleSubmit };
</script>

<div class="model-edit-form">
  {#if loading}
    <div class="loading">Loading form data...</div>
  {/if}

  {#if error}
    <div class="alert alert-danger" role="alert">
      {error}
      <button type="button" class="btn-close" onclick={() => error = null} title="Close"></button>
    </div>
  {/if}

  {#if !loading}
    <div class="form-field mb-3">
      <label for="brand-select" class="form-label">Brand</label>
      <select
        id="brand-select"
        class="form-select bg-dark text-light"
        bind:value={modelData.brand_id}
        onchange={(e) => modelData.brand_id = e.target.value ? parseInt(e.target.value) : null}
        disabled={disabled}
      >
        <option value="">Select Brand</option>
        {#each brands as brand}
          <option value={brand.brand_id}>{brand.name}</option>
        {/each}
      </select>
    </div>

    <div class="form-field mb-3">
      <label for="model-name" class="form-label">Model Name</label>
      <input
        id="model-name"
        type="text"
        class="form-control bg-dark text-light"
        bind:value={modelData.model_name}
        placeholder="Enter model name"
        disabled={disabled}
      />
    </div>

    <div class="form-field mb-3">
      <label for="category-selector" class="form-label">Category</label>
      <ModelCategorySelector
        onselect={handleCategorySelect}
        preselectedCategory={model?.model_cat_id ? { id: model.model_cat_id, name: '' } : undefined}
      />
    </div>


    <div class="form-actions">
      <button
        type="button"
        class="btn btn-primary"
        onclick={handleSubmit}
        disabled={disabled}
        title="Save Model"
      >
        {model?.model_id ? 'Update Model' : 'Create Model'}
      </button>
    </div>
  {/if}
</div>