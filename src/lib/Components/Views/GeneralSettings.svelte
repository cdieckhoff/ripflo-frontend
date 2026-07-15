<script lang="ts">
  import { formatCurrency } from './settingsUtils';

  let { state, saveGeneralSettings } = $props<{
    state: any;
    saveGeneralSettings: () => Promise<void>;
  }>();
</script>

<!-- General Settings Tab -->
<div class="tab-content">
  <div class="card bg-dark text-light mb-4">
    <div class="card-header">
      <h5 class="mb-0">Shop Information</h5>
    </div>
    <div class="card-body">
      <div class="mb-3">
        <label for="" class="form-label">Shop Name</label>
        <input
          type="text"
          class="form-control text-light"
          bind:value={state.shopConfig.shop_name}
        />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">Default Facility</label>
        <select
          class="form-select text-light"
          bind:value={state.shopConfig.default_facility_id}
        >
          {#each state.facilities as facility}
            <option value={facility.fac_id}>{facility.fac_name}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  <button class="btn btn-primary" onclick={saveGeneralSettings}>
    Save General Settings
  </button>
</div>