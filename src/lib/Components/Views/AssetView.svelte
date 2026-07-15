<script lang="ts">
  import { rfState } from '../../rf.svelte';
  import { toastStore } from '../../stores/toastStore';
  import { listAssets, createAsset, updateAsset } from '../../api2/equipment';
  import type { Asset, CreateAssetRequest, UpdateAssetRequest } from '../../api2/equipment';

  // Use rfState directly since it's reactive
  let appState = rfState;

  // Types
  type AssetWithDetails = Asset & {
    contact_name?: string;
  };

  // Local state for this component
  let assetState = $state({
    searchTerm: '',
    selectedContactId: null as number | null,
    isLoading: false,
    showAddEditModal: false,
    editingAsset: null as AssetWithDetails | null,
    assetForm: {
      contact_id: 0,
      model_id: undefined as number | undefined,
      serial: undefined as string | undefined,
      mfg_month: undefined as number | undefined,
      mfg_year: undefined as number | undefined,
      custom_serial: undefined as string | undefined,
      hours: undefined as number | undefined,
    },
    selectedModelId: null as number | null
  });

  // Initialize
  $effect(() => {
    loadAssets();
  });

  // Load assets from API
  async function loadAssets() {
    assetState.isLoading = true;
    try {
      const response = await listAssets(); // Use listAssets from new API
      if (response.error && response.error.message) {
        throw new Error(response.error.message);
      }

      // Map asset names using global app state
      const assetsWithDetails = response.data.map(asset => {
        const contact = appState.contacts.find(c => c.contact_id === asset.contact_id);
        return {
          ...asset,
          contact_name: contact?.display_name || 'Unknown'
        };
      });

      // Update global app state - the WebSocket will automatically update this when changes occur
      appState.assets = response.data; // Store raw assets in appState

      toastStore.add('Assets loaded successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load assets';
      toastStore.add(errorMessage, 'error');
      console.error('Error loading assets:', err);
    } finally {
      assetState.isLoading = false;
    }
  }

  // Filter assets based on search term and selected contact
  const filteredAssets = $derived(() => {
    let filtered = appState.assets.map(asset => {
      const contact = appState.contacts.find(c => c.contact_id === asset.contact_id);
      return {
        ...asset,
        contact_name: contact?.display_name || 'Unknown'
      };
    });

    // Filter by search term
    const term = assetState.searchTerm.toLowerCase();
    if (term) {
      filtered = filtered.filter(asset =>
        (asset.custom_serial && asset.custom_serial.toLowerCase().includes(term)) ||
        (asset.serial && asset.serial.toLowerCase().includes(term)) ||
        (asset.model_name && asset.model_name.toLowerCase().includes(term)) ||
        (asset.brand_name && asset.brand_name.toLowerCase().includes(term)) ||
        (asset.contact_name && asset.contact_name.toLowerCase().includes(term))
      );
    }

    // Filter by selected contact
    if (assetState.selectedContactId !== null) {
      filtered = filtered.filter(asset => asset.contact_id === assetState.selectedContactId);
    }

    return filtered;
  });

  // Show add asset modal
  function showAddAsset() {
    resetForm();
    assetState.editingAsset = null;
    assetState.showAddEditModal = true;
  }

  // Show edit asset modal
  function showEditAsset(asset: AssetWithDetails) {
    resetForm();
    assetState.editingAsset = { ...asset };
    assetState.assetForm = {
      contact_id: asset.contact_id,
      model_id: asset.model_id || undefined,
      serial: asset.serial || undefined,
      mfg_month: asset.mfg_month || undefined,
      mfg_year: asset.mfg_year || undefined,
      custom_serial: asset.custom_serial || undefined,
      hours: asset.hours || undefined,
    };
    assetState.selectedModelId = asset.model_id || null;
    assetState.showAddEditModal = true;
  }

  // Reset form
  function resetForm() {
    assetState.assetForm = {
      contact_id: 0,
      model_id: undefined,
      serial: undefined,
      mfg_month: undefined,
      mfg_year: undefined,
      custom_serial: undefined,
      hours: undefined,
    };
    assetState.selectedModelId = null;
  }

  // Save asset
  async function saveAsset() {
    try {
      if (assetState.editingAsset) {
        // Update existing asset
        const updateRequest: UpdateAssetRequest = {
          contact_id: assetState.assetForm.contact_id,
          model_id: assetState.selectedModelId || null,
          serial: assetState.assetForm.serial,
          mfg_month: assetState.assetForm.mfg_month,
          mfg_year: assetState.assetForm.mfg_year,
          custom_serial: assetState.assetForm.custom_serial,
          hours: assetState.assetForm.hours
        };

        const response = await updateAsset(assetState.editingAsset.asset_id!, updateRequest);
        if (response.error) {
          throw new Error(response.error.message);
        }
        toastStore.add('Asset updated successfully', 'success');
      } else {
        // Create new asset
        const createRequest: CreateAssetRequest = {
          contact_id: assetState.assetForm.contact_id,
          model_id: assetState.selectedModelId || undefined,
          serial: assetState.assetForm.serial,
          mfg_month: assetState.assetForm.mfg_month,
          mfg_year: assetState.assetForm.mfg_year,
          custom_serial: assetState.assetForm.custom_serial,
          hours: assetState.assetForm.hours
        };

        const response = await createAsset(createRequest);
        if (response.error) {
          throw new Error(response.error.message);
        }
        toastStore.add('Asset created successfully', 'success');
      }

      // Close modal
      assetState.showAddEditModal = false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save asset';
      toastStore.add(errorMessage, 'error');
      console.error('Error saving asset:', err);
    }
  }

  // Format hours for display
  function formatHours(hours: number | undefined): string {
    if (hours === undefined || hours === null) return 'N/A';
    return `${hours} hours`;
  }
</script>

<div class="assets-view">
  <!-- Search and Filter Controls -->
  <div class="row mb-3 g-3">
    <div class="col-md-6">
      <input
        type="text"
        class="form-control"
        placeholder="Search assets by serial, model, brand, or contact..."
        bind:value={assetState.searchTerm}
        aria-label="Search assets"
      />
    </div>
    <div class="col-md-6">
      <select
        class="form-select bg-secondary text-light"
        bind:value={assetState.selectedContactId}
      >
        <option value={null}>All Contacts</option>
        {#each appState.contacts as contact}
          <option value={contact.contact_id}>{contact.display_name}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Add Asset Button -->
  <div class="mb-3 d-flex justify-content-between align-items-center">
    <h5 class="mb-0">Assets</h5>
    <button class="btn btn-primary" type="button" onclick={showAddAsset}>
      <i class="bi bi-plus-circle"></i> Add Asset
    </button>
  </div>

  <!-- Loading Spinner -->
  {#if assetState.isLoading}
    <div class="d-flex justify-content-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  {/if}

  <!-- Assets Grid -->
  <div class="row g-3">
    {#each filteredAssets as asset (asset.asset_id)}
      <div class="col-md-6 col-lg-4">
        <div class="card bg-dark text-light border-secondary h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <h6 class="card-title">
                {asset.brand_name || 'No Brand'} {asset.model_name || 'No Model'}
              </h6>
              <span class="badge bg-info text-dark">
                {formatHours(asset.hours)}
              </span>
            </div>

            <p class="card-text">
              <small class="text-muted">
                Serial: {asset.custom_serial || asset.serial || 'N/A'}
              </small>
            </p>

            <div class="mt-3">
              <div class="d-flex align-items-center mb-1">
                <i class="bi bi-person me-2"></i>
                <small>{asset.contact_name || 'Unknown Contact'}</small>
              </div>

              {#if asset.brand_name}
                <div class="d-flex align-items-center mb-1">
                  <i class="bi bi-tag me-2"></i>
                  <small>{asset.brand_name}</small>
                </div>
              {/if}

              {#if asset.model_name}
                <div class="d-flex align-items-center mb-1">
                  <i class="bi bi-gear me-2"></i>
                  <small>{asset.model_name}</small>
                </div>
              {/if}

              {#if asset.custom_serial || asset.serial}
                <div class="d-flex align-items-center">
                  <i class="bi bi-upc-scan me-2"></i>
                  <small>{asset.custom_serial || asset.serial}</small>
                </div>
              {/if}
            </div>
          </div>

          <div class="card-footer bg-transparent border-top-secondary">
            <div class="d-flex justify-content-end">
              <button class="btn btn-sm btn-outline-light" onclick={() => showEditAsset(asset)} title="Edit Asset">
                <i class="bi bi-pencil"></i> Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    {:else}
      {#if !assetState.isLoading}
        <div class="col-12">
          <div class="text-center py-5">
            <i class="bi bi-gear-wide-connected fs-1 mb-3"></i>
            <h5>No assets found</h5>
            <p class="text-muted">Try adjusting your search or add a new asset</p>
          </div>
        </div>
      {/if}
    {/each}
  </div>

  <!-- Add/Edit Asset Modal -->
  {#if assetState.showAddEditModal}
    <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content bg-dark text-light">
          <div class="modal-header border-secondary">
            <h5 class="modal-title">
              {#if assetState.editingAsset} Edit Asset {:else} Add New Asset {/if}
            </h5>
            <button type="button" class="btn-close btn-close-white" onclick={() => assetState.showAddEditModal = false} title="Close modal"></button>
          </div>

          <div class="modal-body">
            <!-- Contact Selection -->
            <div class="mb-3">
              <label class="form-label" for="owner-contact">Owner Contact *</label>
              <select
                id="owner-contact"
                class="form-select bg-secondary text-light"
                bind:value={assetState.assetForm.contact_id}
                disabled={!!assetState.editingAsset}
              >
                <option value="">Select a contact</option>
                {#each appState.contacts as contact}
                  <option value={contact.contact_id}>{contact.display_name}</option>
                {/each}
              </select>
            </div>

            <!-- Hours -->
            <div class="mb-3">
              <label class="form-label" for="hours-of-operation">Hours of Operation</label>
              <input
                id="hours-of-operation"
                type="number"
                class="form-control bg-secondary text-light"
                bind:value={assetState.assetForm.hours}
                placeholder="0"
                min="0"
              />
            </div>

            <!-- Serial Number -->
            <div class="mb-3">
              <label class="form-label" for="serial-number">Serial Number</label>
              <input
                id="serial-number"
                type="text"
                class="form-control bg-secondary text-light"
                bind:value={assetState.assetForm.custom_serial}
                placeholder="Enter serial number"
              />
            </div>
          </div>

          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-secondary" onclick={() => assetState.showAddEditModal = false}>
              Cancel
            </button>
            <button type="button" class="btn btn-primary" onclick={saveAsset}>
              {#if assetState.editingAsset} Update {:else} Create {/if} Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
