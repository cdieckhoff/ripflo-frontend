<script lang="ts">
  import type { Asset } from '$lib/api2/equipment';

  // Props
  let { asset = null, disabled = false } = $props<{
    asset?: Asset | null;
    disabled?: boolean;
  }>();
</script>

<div class="asset-information">
  {#if asset}
    <h3>Asset Information</h3>
    <div class="asset-details">
      <div class="model-section">
        <strong>{asset.brand_name} {asset.model_name}</strong>
      </div>

      {#if asset.serial}
        <div class="serial-section">
          <label for="asset-serial">Serial Number:</label>
          <span id="asset-serial">{asset.serial}</span>
        </div>
      {/if}

      {#if asset.custom_serial}
        <div class="custom-serial-section">
          <label for="asset-custom-serial">Custom Serial:</label>
          <span id="asset-custom-serial">{asset.custom_serial}</span>
        </div>
      {/if}

      {#if asset.mfg_year}
        <div class="year-section">
          <label for="asset-model-year">Model Year:</label>
          <span id="asset-model-year">{asset.mfg_year}</span>
        </div>
      {/if}
    </div>
  {:else}
    <p>No asset information available</p>
  {/if}
</div>