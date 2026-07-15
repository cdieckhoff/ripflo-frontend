<script lang="ts">
  import { rfState } from "$lib/rf.svelte";
  import Selector from "$lib/Components/UI/Selector.svelte";
  import type { Phone, CreatePhoneRequest } from '$lib/api/endpoints/contacts';

  // Props
  let { phone = null, disabled = false, hideLabels = false, onChange } = $props<{
    phone?: Phone | CreatePhoneRequest | null;
    disabled?: boolean;
    hideLabels?: boolean;
    onChange?: (phone: Phone | CreatePhoneRequest) => void;
  }>();

  // Get phone type options from cached enums (exclude 'deleted' type)
  let phoneTypeOptions = $derived(
    rfState.cachedEnums.phoneTypes
      .filter(pt => pt.type !== 'deleted')
      .map(pt => ({
        id: pt.type,
        name: pt.type
      }))
  );

  // Get the default phone type from the phone prop or 'home'
  let defaultPhoneType = $derived(
    phone?.phone_type || 'home'
  );

  // Format phone number as user types
  function formatPhoneNumber(value: string) {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');

    // Limit to 10 digits
    const truncated = cleaned.substring(0, 10);

    // Apply formatting: (XXX) XXX-XXXX
    if (truncated.length <= 3) {
      return truncated;
    } else if (truncated.length <= 6) {
      return `(${truncated.slice(0, 3)}) ${truncated.slice(3)}`;
    } else {
      return `(${truncated.slice(0, 3)}) ${truncated.slice(3, 6)}-${truncated.slice(6, 10)}`;
    }
  }

  function handlePhoneInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const rawValue = target.value.replace(/\D/g, ''); // Only digits
    if (rawValue.length <= 10) {
      const updatedPhone = { ...phone, formatted_phone: formatPhoneNumber(rawValue) } as Phone;
      if (onChange) onChange(updatedPhone);
    }
  }

  function handlePhoneTypeChange(selectedValue: string) {
    // The Selector returns the type (e.g., "home", "work", "mobile")
    const updatedPhone = { ...phone, phone_type: selectedValue } as Phone;
    if (onChange) onChange(updatedPhone);
  }

  function handlePrimaryChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const updatedPhone = { ...phone, is_primary: target.checked ? 1 : 0 } as Phone;
    if (onChange) onChange(updatedPhone);
  }
</script>

<div class="row">
  <div class="d-flex justify-content-between align-items-center">
  <div class="col-4 mb-3">
    {#if !hideLabels}<label for="phone-type-selector" class="form-label">Phone Type</label>{/if}
    <Selector
      id="phone-type-selector"
      options={phoneTypeOptions}
      preselectedValue={defaultPhoneType}
      placeholder="Select Type"
      {disabled}
      onSelectionChange={handlePhoneTypeChange}
    />
  </div>
  <div class="form-check form-switch">
    <input
      class="form-check-input"
      type="checkbox"
      id="primary-phone"
      checked={phone?.is_primary === 1}
      onchange={handlePrimaryChange}
      disabled={disabled}
    />
    <label class="form-check-label" for="primary-phone">
      Primary Phone
    </label>
  </div>

  </div>

  <div class="mb-3">
    {#if !hideLabels}<label for="phone" class="form-label">Phone</label>{/if}
    <input
      id="phone"
      type="tel"
      class="form-control"
      value={phone?.formatted_phone || ''}
      oninput={handlePhoneInput}
      placeholder="(555) 123-4567"
      disabled={disabled}
    />
  </div>


</div>