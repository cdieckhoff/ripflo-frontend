<script lang="ts">
  import { listBrands, createModel, updateModel } from '$lib/api2/equipment';
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
    model_name: model?.model_name || '',
    serial: model?.serial || '',
    mfg_month: model?.mfg_month || null,
    mfg_year: model?.mfg_year || null
  });
  let brands = $state<Brand[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Load brands on initialization
  $effect(() => {
    loadBrands();
  });

  async function loadBrands() {
    try {
      loading = true;
      const result = await listBrands();

      if (result.error) {
        error = result.error.message;
      } else {
        brands = result.data || [];
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load brands';
    } finally {
      loading = false;
    }
  }

  // Handle form submission
  // svelte-ignore non_reactive_update
    async function handleSubmit() {
    if (!modelData.model_name.trim()) {
      error = 'Model name is required';
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

<div class="model-form">
  {#if loading}
    <div class="loading">Loading form data...</div>
  {/if}

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if !loading}
    <div class="form-field">
      <label for="brand-select">Brand</label>
      <select
        id="brand-select"
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

    <div class="form-field">
      <label for="category-selector">Category</label>
      <ModelCategorySelector
        onselect={handleCategorySelect}
        preselectedCategory={model?.model_cat_id ? { id: model.model_cat_id, name: '' } : undefined}
      />
    </div>

    <div class="form-field">
      <label for="model-name">Model Name *</label>
      <input
        id="model-name"
        type="text"
        placeholder="Enter model name"
        bind:value={modelData.model_name}
        oninput={(e) => modelData.model_name = e.target.value}
        disabled={disabled}
      />
    </div>

    <div class="form-field">
      <label for="serial">Serial</label>
      <input
        id="serial"
        type="text"
        placeholder="Enter serial"
        bind:value={modelData.serial}
        oninput={(e) => modelData.serial = e.target.value}
        disabled={disabled}
      />
    </div>

    <div class="form-field">
      <label for="mfg-month">Manufacturing Month</label>
      <input
        id="mfg-month"
        type="number"
        placeholder="Manufacturing Month"
        bind:value={modelData.mfg_month}
        oninput={(e) => modelData.mfg_month = e.target.value ? parseInt(e.target.value) : null}
        min="1"
        max="12"
        disabled={disabled}
      />
    </div>

    <div class="form-field">
      <label for="mfg-year">Manufacturing Year</label>
      <input
        id="mfg-year"
        type="number"
        placeholder="Manufacturing Year"
        bind:value={modelData.mfg_year}
        oninput={(e) => modelData.mfg_year = e.target.value ? parseInt(e.target.value) : null}
        disabled={disabled}
      />
    </div>

    <div class="form-actions">
      <button 
        type="button" 
        onclick={handleSubmit}
        disabled={disabled}
        title="Save Model"
      >
        Save Model
      </button>
    </div>
  {/if}
</div>