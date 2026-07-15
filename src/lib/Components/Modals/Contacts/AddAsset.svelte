<!-- AddAsset.svelte -->
<script lang="ts">
  import { createAsset, listModelCats } from "$lib/api2/equipment";
  import type { Asset, CreateAssetRequest, ModelCat } from "$lib/api2/equipment";
  import EntitySearch from "../../UI/EntitySearch.svelte";
  import type { ModelWithBrand } from "$lib/api2/equipment";

  let { contactId, onClose, onAssetAdded } = $props<{
    contactId: number;
    onClose: () => void;
    onAssetAdded: (asset: Asset) => void;
  }>();

  let assetData = $state<CreateAssetRequest>({
    contact_id: contactId, // Hidden and can't be changed
    serial: undefined,
    mfg_month: undefined,
    mfg_year: undefined,
    custom_serial: undefined, // Locked and can't be changed
    hours: undefined,
    brand_name: undefined,
    model_name: undefined,
  });

  let brandName = $state("");
  let modelName = $state("");
  let modelCats = $state<ModelCat[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);

  // Load model categories on component initialization
  $effect(() => {
    loadModelCats();
  });

  async function loadModelCats() {
    try {
      const response = await listModelCats({ page: 1, limit: 100 }); // Assuming pagination parameters
      if (!response.error) {
        modelCats = response.data || [];
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load model categories";
    }
  }

  async function addAsset() {
    loading = true;
    error = null;

    try {
      // Update assetData with current brand and model names from UI
      assetData.brand_name = brandName;
      assetData.model_name = modelName;

      const response = await createAsset(assetData);

      if (!response.error && response.data && response.data.length > 0) {
        // Asset will be automatically added to global app state via WebSocket
        // Return the created asset to the parent component
        onAssetAdded(response.data[0]);
        onClose();
      } else {
        error = response.error.message;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to create asset";
    } finally {
      loading = false;
    }
  }

  function resetForm() {
    assetData = {
      contact_id: contactId,
      serial: undefined,
      mfg_month: undefined,
      mfg_year: undefined,
      custom_serial: undefined,
      hours: undefined,
      brand_name: undefined,
      model_name: undefined,
    };
    brandName = "";
    modelName = "";
  }

  // Handle model selection from EntitySearch
  function handleModelSelect(model: ModelWithBrand) {
    brandName = model.brand_name;
    modelName = model.model_name;
  }
</script>

<div class="modal-backdrop fade show"></div>
<div class="modal fade show d-block" >
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-tools me-2"></i>
          Add Asset
        </h5>
        <button type="button" class="btn-close" onclick={onClose} title="Close"
        ></button>
      </div>
      <div class="modal-body">
        {#if error}
          <div class="alert alert-danger" role="alert">
            {error}
            <button
              type="button"
              class="btn-close"
              onclick={() => (error = null)}
              title="Close error message"
            ></button>
          </div>
        {/if}

        <!-- Brand Name and Model Name inputs -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="brand_name" class="form-label">Brand Name</label>
            <input
              id="brand_name"
              type="text"
              class="form-control"
              bind:value={brandName}
              placeholder="Brand Name"
            />
          </div>
          <div class="col-md-6 mb-3">
            <label for="model_name" class="form-label">Model Name</label>
            <input
              id="model_name"
              type="text"
              class="form-control"
              bind:value={modelName}
              placeholder="Model Name"
            />
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-12">
            <EntitySearch
              onSelect={handleModelSelect}
              onAdd={addAsset}
              entityType={'model'}
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="serial" class="form-label">Serial</label>
            <input
              id="serial"
              type="text"
              class="form-control"
              bind:value={assetData.serial}
              placeholder="Serial Number"
            />
          </div>
          <div class="col-md-6 mb-3">
            <label for="custom_serial" class="form-label">Custom Serial</label>
            <input
              id="custom_serial"
              type="text"
              class="form-control"
              bind:value={assetData.custom_serial}
              placeholder="Custom Serial Number"
              disabled
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="mfg_month" class="form-label">Manufacturing Month</label>
            <input
              id="mfg_month"
              type="number"
              class="form-control"
              bind:value={assetData.mfg_month}
              placeholder="Manufacturing Month"
              min="1"
              max="12"
            />
          </div>
          <div class="col-md-6 mb-3">
            <label for="mfg_year" class="form-label">Manufacturing Year</label>
            <input
              id="mfg_year"
              type="number"
              class="form-control"
              bind:value={assetData.mfg_year}
              placeholder="Manufacturing Year"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="hours" class="form-label">Hours</label>
            <input
              id="hours"
              type="number"
              class="form-control"
              bind:value={assetData.hours}
              placeholder="Hours"
            />
          </div>
        </div>

        <!-- Hidden contact_id field -->
        <input
          type="hidden"
          bind:value={assetData.contact_id}
        />
      </div>
      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          onclick={resetForm}
          title="Clear Form"
          disabled={loading}
        >
          <i class="bi bi-arrow-counterclockwise me-1"></i>
          Clear
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          onclick={onClose}
          title="Cancel"
          disabled={loading}
        >
          <i class="bi bi-x-circle me-1"></i>
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          onclick={addAsset}
          title="Add Asset"
          disabled={loading}
        >
          {#if loading}
            <span class="spinner-border spinner-border-sm me-1" role="status"
            ></span>
          {:else}
            <i class="bi bi-check-circle me-1"></i>
          {/if}
          Add Asset
        </button>
      </div>
    </div>
  </div>
</div>
