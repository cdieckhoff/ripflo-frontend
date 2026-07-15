<script lang="ts">
  let { state, saveGeneralSettings } = $props<{
    state: any;
    saveGeneralSettings: () => Promise<void>;
  }>();
</script>

<!-- Policies Tab -->
<div class="tab-content">
  <div class="card bg-dark text-light mb-4">
    <div class="card-header">
      <h5 class="mb-0">Storage & Abandonment Policies</h5>
    </div>
    <div class="card-body">
      <div class="mb-3">
        <label class="form-label">Storage Fee Per Day</label>
        <div class="input-group bg-secondary">
          <span class="input-group-text">$</span>
          <input
            type="number"
            class="form-control bg-dark text-light"
            bind:value={state.shopConfig.storage_fee_per_day}
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Days Before Abandonment</label>
        <input
          type="number"
          class="form-control bg-secondary text-light"
          bind:value={state.shopConfig.abandonment_days}
          min="1"
        />
        <div class="form-text text-muted">
          After this many days, equipment will be marked as abandoned
        </div>
      </div>
    </div>
  </div>

  <button class="btn btn-primary" onclick={saveGeneralSettings}>
    Save Policies
  </button>
</div>