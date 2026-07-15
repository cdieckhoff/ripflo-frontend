<!-- AddFacility.svelte -->
<script lang="ts">
  import {type Facility, type CreateFacilityRequest} from '$lib/api/endpoints/facilities';
  import {createFacility} from '$lib/api/endpoints/facilities';
  import {FacilityIsActive} from '$lib/types/consolidated-enums';
  import AddressForm from '../../UI/AddressForm.svelte';
  import PhoneForm from '../../UI/PhoneForm.svelte';

  let { onClose, onFacilityAdded} = $props();

  let facilityData = $state<CreateFacilityRequest>({
    fac_name: "",
    fac_short: "",
    fac_zip: 64067,
    is_active: 1, // Default to active
    addresses: [{
      addr1: "",
      addr2: '',
      zip: 64067,
      is_primary: 1,
    }],
    phones: [{
      formatted_phone: '',
      is_primary: 1,
    }],
  });

  let error = $state<string | null>(null);
  let loading = $state(false);

  async function addFacility() {
    loading = true;
    error = null;

    try {
      // Prepare the facility data
      const newFacility: CreateFacilityRequest = {
        fac_name: facilityData.fac_name,
        fac_short: facilityData.fac_short,
        fac_zip: facilityData.addresses[0].zip, // Use the zip from address data
        is_active: facilityData.is_active,
        addresses: facilityData.addresses,
        phones: facilityData.phones,
      };

      const response = await createFacility(newFacility);

      if (!response.error) {
        // Facility will be automatically added to global app state via WebSocket
        onFacilityAdded(newFacility)
        onClose();
      } else {
        error = response.error.message;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create facility';
    } finally {
      loading = false;
    }
  }

  function resetForm() {
    facilityData = {
      fac_name: "",
      fac_short: "",
      fac_zip: 64067,
      is_active: 1, // Default to active
      addresses: [{
        addr1: "",
        addr2: "",
        zip: 64067,
        is_primary: 1,
      }],
      phones: [{
        formatted_phone: '',
        is_primary: 1,
      }],
    };
  }
</script>

<div class="modal fade show d-block" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h6 class="modal-title">
          <i class="bi bi-building me-2"></i>
          New Facility
        </h6>
        <button type="button" class="btn-close" onclick={onClose} title="Close"
        ></button>
      </div>
      <div class="modal-body">
        {#if error}
          <div class="alert alert-danger" role="alert">
            {error}
            <button type="button" class="btn-close" onclick={() => error = null} title="Close error message"></button>
          </div>
        {/if}

        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="fac_name" class="form-label">Facility Name</label>
            <input
              id="fac_name"
              type="text"
              class="form-control"
              bind:value={facilityData.fac_name}
              placeholder="Facility Name"
            />
          </div>
          <div class="col-md-6 mb-3">
            <label for="fac_short" class="form-label">Short Name</label>
            <input
              id="fac_short"
              type="text"
              class="form-control"
              bind:value={facilityData.fac_short}
              placeholder="Short Name"
            />
          </div>
        </div>

        <div class="mb-4">
          <h6>Address</h6>
          <AddressForm
            address={facilityData.addresses[0]}
            disabled={false}
            hideLabels={false}
            onChange={(updatedAddress) => {
              facilityData.addresses[0] = { ...facilityData.addresses[0], ...updatedAddress };
              // Update the facility zip when address zip changes
              facilityData.fac_zip = updatedAddress.zip;
            }}
          />
        </div>

        <div class="mb-4">
          <h6>Phone</h6>
          <PhoneForm
            phone={facilityData.phones[0]}
            disabled={false}
            hideLabels={false}
            onChange={(updatedPhone) => {
              facilityData.phones[0] = { ...facilityData.phones[0], ...updatedPhone };
            }}
          />
        </div>

        <div class="mb-3">
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="facilityIsActive"
              checked={facilityData.is_active === FacilityIsActive.ACTIVE}
              onchange={() => facilityData.is_active = facilityData.is_active ? FacilityIsActive.INACTIVE : FacilityIsActive.ACTIVE}
            />
            <label class="form-check-label" for="facilityIsActive">
              Is Active
            </label>
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
          onclick={addFacility}
          title="Add Facility"
          disabled={loading}
        >
          {#if loading}
            <span class="spinner-border spinner-border-sm me-1" role="status"></span>
          {:else}
            <i class="bi bi-check-circle me-1"></i>
          {/if}
          Add Facility
        </button>
      </div>
    </div>
  </div>
</div>