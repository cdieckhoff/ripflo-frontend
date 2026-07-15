<!-- AssetEditForm.svelte -->
<script lang="ts">
  import { createAsset, updateAsset, listModelCats } from '$lib/api2/equipment';
  import type { Asset, CreateAssetRequest, UpdateAssetRequest, ModelCat } from '$lib/api2/equipment';
  import EntitySearch from "../../UI/EntitySearch.svelte";
  import type { ModelWithBrand } from "$lib/api2/equipment";

  // Props
  let {
    asset = null,
    contactId = null,
    onSave = (savedAsset: Asset) => {},
    onCancel = () => {}
  } = $props<{
    asset?: Asset | null;
    contactId?: number | null;
    onSave?: (asset: Asset) => void;
    onCancel?: () => void;
  }>();

  let assetData = $state<CreateAssetRequest | UpdateAssetRequest>({
    contact_id: contactId || asset?.contact_id,
    serial: asset?.serial || undefined,
    mfg_month: asset?.mfg_month || undefined,
    mfg_year: asset?.mfg_year || undefined,
    custom_serial: asset?.custom_serial || undefined,
    hours: asset?.hours || undefined,
    brand_name: asset?.brand_name || undefined,
    model_name: asset?.model_name || undefined,
  });

  let brandName = $state(asset?.brand_name || "");
  let modelName = $state(asset?.model_name || "");
  let modelCats = $state<ModelCat[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);

  // Load model categories on component initialization
  $effect(() => {
    loadModelCats();
  });

  async function loadModelCats() {
    try {
      const response = await listModelCats({ page: 1, limit: 100 });
      if (!response.error) {
        modelCats = response.data || [];
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load model categories";
    }
  }

  async function handleSubmit() {
    loading = true;
    error = null;

    try {
      if (asset && asset.asset_id) {
        // Update existing asset
        const updateRequest: UpdateAssetRequest = {
          serial: assetData.serial,
          mfg_month: assetData.mfg_month,
          mfg_year: assetData.mfg_year,
          custom_serial: assetData.custom_serial,
          hours: assetData.hours,
          brand_name: brandName,
          model_name: modelName
        };

        const response = await updateAsset(asset.asset_id, updateRequest);

        if (!response.error && response.data && response.data.length > 0) {
          onSave(response.data[0]);
        } else {
          error = response.error.message;
        }
      } else {
        // Create new asset
        if (!contactId) {
          error = 'Contact ID is required for creating a new asset';
          return;
        }

        const createRequest: CreateAssetRequest = {
          contact_id: contactId,
          serial: assetData.serial,
          mfg_month: assetData.mfg_month,
          mfg_year: assetData.mfg_year,
          custom_serial: assetData.custom_serial,
          hours: assetData.hours,
          brand_name: brandName,
          model_name: modelName
        };

        const response = await createAsset(createRequest);

        if (!response.error && response.data && response.data.length > 0) {
          onSave(response.data[0]);
        } else {
          error = response.error.message;
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to save asset";
    } finally {
      loading = false;
    }
  }

  function resetForm() {
    assetData = {
      contact_id: contactId || asset?.contact_id,
      serial: asset?.serial || undefined,
      mfg_month: asset?.mfg_month || undefined,
      mfg_year: asset?.mfg_year || undefined,
      custom_serial: asset?.custom_serial || undefined,
      hours: asset?.hours || undefined,
      brand_name: asset?.brand_name || undefined,
      model_name: asset?.model_name || undefined,
    };
    brandName = asset?.brand_name || "";
    modelName = asset?.model_name || "";
  }

  // Handle model selection from EntitySearch
  function handleModelSelect(model: ModelWithBrand) {
    brandName = model.brand_name;
    modelName = model.model_name;
  }
</script>

<div class="modal-backdrop fade show"></div>
<div class="modal fade show d-block">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-tools me-2"></i>
          {asset?.asset_id ? 'Edit Asset' : 'Add Asset'}
        </h5>
        <button
          type="button"
          class="btn-close"
          onclick={onCancel}
          title="Close"
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
              onAdd={handleSubmit}
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
              disabled={asset?.custom_serial ? true : false}
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
          onclick={onCancel}
          title="Cancel"
          disabled={loading}
        >
          <i class="bi bi-x-circle me-1"></i>
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          onclick={handleSubmit}
          title="Save Asset"
          disabled={loading}
        >
          {#if loading}
            <span class="spinner-border spinner-border-sm me-1" role="status"></span>
          {:else}
            <i class="bi bi-check-circle me-1"></i>
          {/if}
          {asset?.asset_id ? 'Update Asset' : 'Create Asset'}
        </button>
      </div>
    </div>
  </div>
</div>
