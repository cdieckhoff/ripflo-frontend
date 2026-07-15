<script lang="ts">
  import { rfState } from "$lib/rf.svelte";
  import { loadZip } from "$lib/api/client.js";
  import Selector from "$lib/Components/UI/Selector.svelte";
  import type {
    Address,
    CreateAddressRequest,
  } from "$eps/contacts";
  import { listAddressTypes } from "$lib/api/endpoints/addresses";

  // Props
  let {
    address = null,
    disabled = false,
    hideLabels = false,
    onChange,
  } = $props<{
    address?: Address | null;
    disabled?: boolean;
    hideLabels?: boolean;
    onChange?: (address: Address) => void;
  }>();
  let laddr = $state<Address>(address);

  // Get address type options from cached enums (exclude 'deleted' type)
  let addressTypeOptions = $derived(
    rfState.cachedEnums.addressTypes
      .filter(at => at.name !== 'deleted')
      .map(at => ({
        id: at.name,
        name: at.name
      }))
  );

  // Get the default address type from the address prop or 'primary'
  let defaultAddressType = $derived(
    address?.addr_type || 'primary'
  );

  // ZipLookup state (inlined)
  let zipLocation = $state({ city: "", state: "" });
  let zipInput = $state(address?.zip?.toString() || "");
  let zipIsLoading = $state(false);
  let zipError = $state("");
  let zipLoaded = $state(false); // Track if we've already loaded city/state

  // Initialize zip input when address changes
  $effect(() => {
    if (address?.zip && !zipLoaded) {
      zipInput = address.zip.toString();
      // Auto-load city/state if zip is already set
      if (address.zip.toString().length === 5) {
        loadCityState(address.zip);
      }
    }
  });

  // Handle zip code input (inlined from ZipLookup)
  async function handleZipInput(val: string) {
    zipInput = val;

    // Call the callback if provided
    if (onChange) {
      const numVal = parseInt(val, 10);
      if (!isNaN(numVal)) {
        handleZipChange(numVal);
      }
    }

    // Reset error when user types
    if (zipError) {
      zipError = "";
    }

    // Validate zip code format (5 digits)
    if (val.length === 5 && /^\d{5}$/.test(val)) {
      await loadCityState(parseInt(val, 10));
    } else if (val.length < 5) {
      // Reset location if zip code is less than 5 digits
      zipLocation = { city: "", state: "" };
      handleLocationChange({ city: "", state: "" });
    }
  }

  // Load city and state from zip code
  async function loadCityState(zip: number) {
    zipIsLoading = true;
    zipLocation = { city: "", state: "" };

    try {
      const response = await loadZip(zip);
      if (response.error && response.error.message && response.error.message.trim() !== '') {
        console.log('Zip lookup error:', response.error.message);
        zipError = response.error.message;
        zipLocation = { city: "", state: "" };
        handleLocationChange({ city: "", state: "" });
        zipLoaded = true; // Mark as loaded even on error
        return;
      }

      if (response.data && response.data.length > 0) {
        const zipInfo = response.data[0];
        if (zipInfo.zip_id == zip) {
          zipLocation.city = zipInfo.city;
          zipLocation.state = zipInfo.state_id || zipInfo.state_name || '';
        }
      }

      handleLocationChange({
        city: zipLocation.city,
        state: zipLocation.state
      });
      zipLoaded = true; // Mark as successfully loaded
    } catch (e) {
      console.error('Error fetching zip code data:', e);
      zipError = 'Failed to lookup zip code';
      zipLocation = { city: "", state: "" };
      handleLocationChange({ city: "", state: "" });
      zipLoaded = true; // Mark as loaded even on error
    } finally {
      zipIsLoading = false;
    }
  }


  function handleAddressTypeChange(selectedValue: string) {
    const updatedAddress = {
      ...address,
      addr_type: selectedValue,
    } as Address;
    if (onChange) onChange(updatedAddress);
    //laddr = updatedAddress;
  }

  // Handle changes to address fields
  function handleAddressLine1Change(e: Event) {
    const target = e.target as HTMLInputElement;
    const updatedAddress = { ...address, addr1: target.value } as
      | Address
      | CreateAddressRequest;
    if (onChange) onChange(updatedAddress);
    //laddr = updatedAddress;
  }

  function handleAddressLine2Change(e: Event) {
    const target = e.target as HTMLInputElement;
    const updatedAddress = { ...address, addr2: target.value } as
      | Address
      | CreateAddressRequest;
    if (onChange) onChange(updatedAddress);
    //laddr = updatedAddress;
  }

  function handleZipChange(zip: string | number) {
    const zipNum = typeof zip === "string" ? parseInt(zip, 10) : zip;
    const updatedAddress = { ...address, zip: zipNum } as
      | Address
      | CreateAddressRequest;
    if (onChange) onChange(updatedAddress);
    //laddr = updatedAddress;
  }

  function handleLocationChange(location: { city: string; state: string }) {
    // City and state are not part of the Address interface in the new API
    // The ZipLookup component provides this information but we don't store it in the Address object
    // We can still use the location data if needed for other purposes
    const updatedAddress = { ...address } as Address | CreateAddressRequest;
    if (onChange) onChange(updatedAddress);
    //laddr = updatedAddress;
  }

  function handlePrimaryChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const updatedAddress = {
      ...address,
      is_primary: target.checked ? 1 : 0,
    } as Address;
    if (onChange) onChange(updatedAddress);
    //laddr = updatedAddress;
  }
</script>

<div class="row border-bottom">
  <div class="d-flex justify-content-between align-items-center">
    <div class="col-4 mb-3">
      {#if !hideLabels}<label for="address-type-selector" class="form-label"
          >Address Type</label
        >{/if}
      <Selector
        id="address-type-selector"
        options={addressTypeOptions}
        preselectedValue={defaultAddressType}
        placeholder="Select Type"
        {disabled}
        onSelectionChange={handleAddressTypeChange}
      />
    </div>
    <div class="form-check form-switch">
      <input
        class="form-check-input"
        type="checkbox"
        id="primary-checkbox"
        checked={address?.is_primary === 1}
        onchange={handlePrimaryChange}
        {disabled}
      />
      <label class="form-check-label" for="primary-checkbox">
        Primary Address
      </label>
    </div>
  </div>
  <div class="mb-3 me-2">
    {#if !hideLabels}<label for="addr1" class="form-label">Address</label>{/if}
    <input
      id="addr1"
      type="text"
      class="form-control"
      value={address?.addr1 || ""}
      oninput={handleAddressLine1Change}
      placeholder="123 Main St."
      {disabled}
    />
  </div>

  {#if !laddr.addr1 === ""}
    <div class="mb-3">
      {#if !hideLabels}<label for="addr2" class="form-label"
          >Address Line 2 (Optional)</label
        >{/if}
      <input
        id="addr2"
        type="text"
        class="form-control"
        value={address?.addr2 || ""}
        oninput={handleAddressLine2Change}
        placeholder="Apartment, suite, etc."
        {disabled}
      />
    </div>
  {/if}

  <!-- ZipLookup inlined -->
  <div class="zip-lookup">
    <div class="d-flex justify-content-between">
      <div class="me-2 mb-3">
        <label for="city" class="form-label">City</label>
        <input id="city" type="text" class="form-control" value={zipLocation.city} disabled />
      </div>
      <div class="col-2 mb-3">
        <label for="state" class="form-label">State</label>
        <input id="state" type="text" class="form-control" value={zipLocation.state} disabled />
      </div>
      <div class="col-3 mb-3">
        <label for="zip" class="form-label">Zip</label>
        <input
          id="zip"
          type="text"
          class="form-control"
          bind:value={zipInput}
          oninput={(e) => handleZipInput(e.target.value)}
          maxlength="5"
          placeholder="zip"
          disabled={disabled}
        />
      </div>
    </div>
  </div>
</div>
