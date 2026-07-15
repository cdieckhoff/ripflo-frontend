<!-- ContactDisplay.svelte -->
<script lang="ts">
  import {type Contact } from '$api/endpoints/contacts';
  import {rfState}  from '../../../rf.svelte'

  import { type Asset } from '$api/endpoints/assets';

  let { contact, onAddAsset, onRemoveContact, onAssetSelected } = $props<{
    contact: Contact;
    onAddAsset: (contactId: number) => void;
    onRemoveContact?: (contact: Contact) => void;
    onAssetSelected?: (asset: Asset) => void;  // Callback when an asset is selected
  }>();

  // Get the global app state
  let showAssetModal = $state(false);
  let selectedAssetId = $state<number | null>(null);
    let localAssets = $state<Asset[] | null>(contact.assets);

  function handleRemoveContact() {
    // In the new approach, we let the parent handle the removal
    // The global state will be updated automatically via WebSocket
    if(onRemoveContact)
      onRemoveContact(contact);
  }

  // Handle asset selection
  function handleAssetSelect(asset: Asset) {
    selectedAssetId = asset.asset_id;
    console.log(contact);
    if (onAssetSelected) {
      onAssetSelected(asset);
    }
  }
</script>

<div class="card mt-2">
  <div class="card-body">
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <h6 class="card-title mb-1">{contact.display_name}</h6>
        {#if contact.phones && contact.phones.length > 0}
          <p class="card-text mb-1"><i class="bi bi-telephone me-1"></i> {contact.phones[0].formatted_phone}</p>
        {/if}
        {#if contact.emails && contact.emails.length > 0}
          <p class="card-text mb-0"><i class="bi bi-envelope me-1"></i> {contact.emails[0].email}</p>
        {/if}
      </div>
      <button class="btn btn-sm btn-outline-danger" onclick={handleRemoveContact} title="Remove Contact">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <div class="mt-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="mb-0">Assets</h6>
        <button class="btn btn-sm btn-outline-primary" onclick={() => showAssetModal = !showAssetModal} title="Toggle Asset List">
          <i class="bi bi-chevron-{showAssetModal ? 'up' : 'down'}"></i>
        </button>
      </div>

      {#if showAssetModal}
        <div class="mt-2">
          {#if contact.assets && contact.assets.length > 0}
            <div class="list-group">
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              {#each contact.assets as asset (asset.asset_id)}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                  class="list-group-item list-group-item-action {asset.asset_id === selectedAssetId ? 'active' : ''}"
                  onclick={() => handleAssetSelect(asset)}
                  title="Select this asset"
                >
                  <div class="d-flex justify-content-between">
                    <div>
                      <strong>{asset.brand_name} {asset.model_name}</strong>
                      <div class="small text-light">Serial: {asset.serial}</div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="alert alert-info">No equipment found for this contact</div>
          {/if}

          <button
            class="btn btn-sm btn-outline-success mt-2"
            onclick={() => onAddAsset(contact.contact_id)}
            title="Add Asset"
          >
            <i class="bi bi-plus-circle"></i> Add Equipment
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>