<script lang="ts">
  import { type Contact, type UpdateContactRequest, type Address, type Phone, type Email, type CreateAddressRequest, type CreatePhoneRequest, type CreateEmailRequest, type UpdateAddressRequest, type UpdatePhoneRequest, type UpdateEmailRequest } from '$eps/contacts';
  import { updateContact } from '$eps/contacts';
  import { type Asset, createAsset, deleteAsset as deleteAssetApi } from '$eps/assets';
  import { listAssets } from '$lib/api2/equipment';
  import { rfState } from '$lib/rf.svelte';
  import AddressForm from '$ui/AddressForm.svelte';
  import PhoneForm from '$ui/PhoneForm.svelte';
  import EmailForm from '$ui/EmailForm.svelte';
  import ActionBtn from '$ui/ActionBtn.svelte';
  import AddAsset from './AddAsset.svelte';
  import EditAsset from './EditAsset.svelte';

  // Props with defaults
  let { contact = null, onSave = () => {}, onCancel = () => {} } = $props<{
    contact?: Contact | null;
    onSave?: (updatedContact: Contact) => void;
    onCancel?: () => void;
  }>();

  // State
  let state = $state({
    isLoading: false,
    error: null as string | null,
    formData: {
      display_name: '',
      type: 'person',
      is_active: 1,
      priority: 'normal' as const,
      parent_id: null as number | null,
      addresses: [] as (Address | CreateAddressRequest)[],
      phones: [] as (Phone | CreatePhoneRequest)[],
      emails: [] as (Email | CreateEmailRequest)[],
    },
    newAddress: {
      addr1: '',
      addr2: '',
      is_primary: 0,
      addr_type: 'home',
      zip: 0,
    },
    newPhone: {
      formatted_phone: '',
      is_primary: 0,
    },
    newEmail: {
      email: '',
      is_primary: 0,
    },
    assets: [] as Asset[],
    isLoadingAssets: false,
    showEditAssetForm: false,
    editingAsset: null as Asset | null,
    newAsset: {
      brand_name: '',
      model_name: '',
      custom_serial: '',
      hours: null as number | null,
    },
    showAddAddressModal: false,
    showAddPhoneModal: false,
    showAddEmailModal: false,
    showAddAssetModal: false,
  });

  // Helper: Get address type name from ID
  function getAddressTypeName(addrTypeId: number): string {
    const addrType = rfState.cachedEnums.addressTypes.find(t => t.addr_type_id === addrTypeId);
    return addrType?.name || 'home';
  }

  // Helper: Get address type ID from name
  function getAddressTypeId(addrTypeName: string): number {
    const addrType = rfState.cachedEnums.addressTypes.find(t => t.name.toLowerCase() === addrTypeName.toLowerCase());
    return addrType?.addr_type_id || 1;
  }

  // Helper: Sort items with primary first
  function sortWithPrimary<T extends { is_primary?: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => {
      const aPrimary = a.is_primary === 1 ? 0 : 1;
      const bPrimary = b.is_primary === 1 ? 0 : 1;
      return aPrimary - bPrimary;
    });
  }

  // Computed: Sorted addresses (primary first)
  let sortedAddresses = $derived(sortWithPrimary(state.formData.addresses));
  let sortedPhones = $derived(sortWithPrimary(state.formData.phones));
  let sortedEmails = $derived(sortWithPrimary(state.formData.emails));

  // Initialize form when contact changes
  $effect(() => {
    if (contact) {
      state.formData = {
        display_name: contact.display_name || '',
        type: contact.type || 'person',
        is_active: contact.is_active,
        priority: contact.priority || 'normal',
        parent_id: contact.parent_id || null,
        addresses: contact.addresses.map(addr => ({
          addr1: addr.addr1,
          addr2: addr.addr2 || '',
          is_primary: addr.is_primary,
          addr_type: typeof addr.addr_type === 'number' ? getAddressTypeName(addr.addr_type) : addr.addr_type,
          zip: addr.zip,
          contact_id: addr.contact_id,
          addr_id: addr.addr_id
        })),
        phones: contact.phones.map(phone => ({
          formatted_phone: phone.formatted_phone,
          is_primary: phone.is_primary,
          contact_id: phone.contact_id,
          phone_id: phone.phone_id,
          phone_type: phone.phone_type || 'home'
        })),
        emails: contact.emails.map(email => ({
          email: email.email,
          is_primary: email.is_primary,
          contact_id: email.contact_id,
          email_id: email.email_id
        }))
      };
    }
  });

  // Load assets for the contact
  async function loadAssets() {
    if (!contact?.contact_id) return;

    state.isLoadingAssets = true;
    try {
      const response = await listAssets({ contact_id: contact.contact_id });
      if (!response.error) {
        state.assets = response.data;
      } else {
        console.error('Error loading assets:', response.error.message);
      }
    } catch (err) {
      console.error('Error loading assets:', err);
    } finally {
      state.isLoadingAssets = false;
    }
  }

  // Open/close modals
  function openAddAddressModal() {
    state.newAddress = {
      addr1: '',
      addr2: '',
      is_primary: state.formData.addresses.length === 0 ? 1 : 0,
      addr_type: 'home',
      zip: 64067,
    };
    state.showAddAddressModal = true;
  }

  function closeAddAddressModal() {
    state.showAddAddressModal = false;
  }

  function openAddPhoneModal() {
    state.newPhone = {
      formatted_phone: '',
      is_primary: state.formData.phones.length === 0 ? 1 : 0,
    };
    state.showAddPhoneModal = true;
  }

  function closeAddPhoneModal() {
    state.showAddPhoneModal = false;
  }

  function openAddEmailModal() {
    state.newEmail = {
      email: '',
      is_primary: state.formData.emails.length === 0 ? 1 : 0,
    };
    state.showAddEmailModal = true;
  }

  function closeAddEmailModal() {
    state.showAddEmailModal = false;
  }

  function openAddAssetModal() {
    state.newAsset = {
      brand_name: '',
      model_name: '',
      custom_serial: '',
      hours: null,
    };
    state.showAddAssetModal = true;
  }

  function closeAddAssetModal() {
    state.showAddAssetModal = false;
  }

  // Add new address (from modal)
  function addAddress() {
    if (state.newAddress.addr1.trim() !== '') {
      state.formData.addresses = [
        ...state.formData.addresses,
        { ...state.newAddress }
      ];
      closeAddAddressModal();
    }
  }

  // Remove address
  function removeAddress(index: number) {
    state.formData.addresses = state.formData.addresses.filter((_, i) => i !== index);
  }

  // Add new phone (from modal)
  function addPhone() {
    if (state.newPhone.formatted_phone.trim() !== '') {
      state.formData.phones = [
        ...state.formData.phones,
        { ...state.newPhone }
      ];
      closeAddPhoneModal();
    }
  }

  // Remove phone
  function removePhone(index: number) {
    state.formData.phones = state.formData.phones.filter((_, i) => i !== index);
  }

  // Add new email (from modal)
  function addEmail() {
    if (state.newEmail.email.trim() !== '') {
      state.formData.emails = [
        ...state.formData.emails,
        { ...state.newEmail }
      ];
      closeAddEmailModal();
    }
  }

  // Remove email
  function removeEmail(index: number) {
    state.formData.emails = state.formData.emails.filter((_, i) => i !== index);
  }

  // Add a new asset (from modal)
  async function addAsset() {
    if (!contact?.contact_id) return;

    try {
      const assetPayload = {
        contact_id: contact.contact_id,
        brand_name: state.newAsset.brand_name,
        model_name: state.newAsset.model_name,
        custom_serial: state.newAsset.custom_serial,
        hours: state.newAsset.hours
      };

      const response = await createAsset(assetPayload);

      if (!response.error) {
        await loadAssets();
        state.newAsset = {
          brand_name: '',
          model_name: '',
          custom_serial: '',
          hours: null
        };
        closeAddAssetModal();
      } else {
        console.error('Error creating asset:', response.error.message);
      }
    } catch (err) {
      console.error('Error creating asset:', err);
    }
  }

  // Delete an asset
  async function deleteAsset(assetId: number) {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const response = await deleteAssetApi(assetId);
      if (!response.error) {
        await loadAssets();
      } else {
        console.error('Error deleting asset:', response.error.message);
      }
    } catch (err) {
      console.error('Error deleting asset:', err);
    }
  }

  // Edit an asset
  function editAsset(asset: Asset) {
    state.editingAsset = asset;
    state.showEditAssetForm = true;
  }

  // Handle asset update
  async function handleAssetUpdate(updatedAsset: Asset) {
    const assetIndex = state.assets.findIndex(a => a.asset_id === updatedAsset.asset_id);
    if (assetIndex !== -1) {
      state.assets[assetIndex] = updatedAsset;
    }
    state.showEditAssetForm = false;
    state.editingAsset = null;
  }

  // Save contact
  async function saveContact() {
    if (!contact) return;

    state.isLoading = true;
    state.error = null;

    try {
      const updateRequest: UpdateContactRequest = {
        display_name: state.formData.display_name,
        type: state.formData.type,
        is_active: state.formData.is_active,
        priority: state.formData.priority,
        parent_id: state.formData.parent_id,
        addresses: state.formData.addresses.map(addr => {
          if ('addr_id' in addr && addr.addr_id) {
            return {
              addr_id: addr.addr_id,
              contact_id: addr.contact_id,
              addr1: addr.addr1,
              addr2: addr.addr2,
              is_primary: addr.is_primary,
              addr_type: typeof addr.addr_type === 'string' ? getAddressTypeId(addr.addr_type) : addr.addr_type,
              zip: addr.zip
            } as UpdateAddressRequest;
          } else {
            return {
              contact_id: addr.contact_id,
              addr1: addr.addr1,
              addr2: addr.addr2,
              is_primary: addr.is_primary,
              addr_type: typeof addr.addr_type === 'string' ? getAddressTypeId(addr.addr_type) : addr.addr_type,
              zip: addr.zip
            } as CreateAddressRequest;
          }
        }),
        phones: state.formData.phones.map(phone => {
          if ('phone_id' in phone && phone.phone_id) {
            return {
              phone_id: phone.phone_id,
              contact_id: phone.contact_id,
              fac_id: phone.fac_id,
              formatted_phone: phone.formatted_phone,
              is_primary: phone.is_primary,
              phone_type: phone.phone_type
            } as UpdatePhoneRequest;
          } else {
            return {
              contact_id: phone.contact_id,
              fac_id: phone.fac_id,
              formatted_phone: phone.formatted_phone,
              is_primary: phone.is_primary,
              phone_type: phone.phone_type
            } as CreatePhoneRequest;
          }
        }),
        emails: state.formData.emails.map(email => {
          if ('email_id' in email && email.email_id) {
            return {
              email_id: email.email_id,
              contact_id: email.contact_id,
              email: email.email,
              is_primary: email.is_primary
            } as UpdateEmailRequest;
          } else {
            return {
              contact_id: email.contact_id,
              email: email.email,
              is_primary: email.is_primary
            } as CreateEmailRequest;
          }
        })
      };

      const response = await updateContact(contact.contact_id!, updateRequest);

      if (response.error && response.error.message) {
        state.error = response.error.message;
        return;
      }

      const updatedContact = response.data[0];
      if (updatedContact) {
        const contactIndex = rfState.contacts.findIndex(c => c.contact_id === contact?.contact_id);
        if (contactIndex !== -1) {
          rfState.contacts[contactIndex] = updatedContact;
        }
        onSave(updatedContact);
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to update contact';
      console.error('Error updating contact:', err);
    } finally {
      state.isLoading = false;
    }
  }

  // Cancel edit
  function cancelEdit() {
    onCancel();
  }

  // Initialize assets when component loads
  $effect(() => {
    if (contact?.contact_id) {
      loadAssets();
    }
  });
</script>

<div class="contact-edit-form p-4">
  <h4 class="mb-4">Edit Contact</h4>

  {#if state.error}
    <div class="alert alert-danger" role="alert">
      {state.error}
      <button type="button" class="btn-close" onclick={() => state.error = null} title="Close"></button>
    </div>
  {/if}

  {#if state.isLoading}
    <div class="d-flex justify-content-center p-5">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Saving...</span>
      </div>
    </div>
  {:else}
    <form onsubmit={(e) => { e.preventDefault(); saveContact(); }}>
      <!-- Basic Info -->
      <div class="row mb-4">
        <div class="col-md-6">
          <label for="display_name" class="form-label">Display Name</label>
          <input
            type="text"
            id="display_name"
            class="form-control bg-dark text-light"
            bind:value={state.formData.display_name}
            required
          />
        </div>
        <div class="col-md-3">
          <label for="type" class="form-label">Type</label>
          <select
            id="type"
            class="form-select bg-dark text-light"
            bind:value={state.formData.type}
          >
            <option value="person">Person</option>
            <option value="employee">Employee</option>
            <option value="company">Company</option>
            <option value="supplier">Supplier</option>
          </select>
        </div>
        <div class="col-md-3">
          <label for="priority" class="form-label">Priority</label>
          <select
            id="priority"
            class="form-select bg-dark text-light"
            bind:value={state.formData.priority}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-6">
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="is_active"
              bind:checked={state.formData.is_active}
              onchange={() => state.formData.is_active = state.formData.is_active ? 1 : 0}
            />
            <label class="form-check-label" for="is_active">Active</label>
          </div>
        </div>
        <div class="col-md-6">
          <label for="parent_id" class="form-label">Parent ID (optional)</label>
          <input
            type="number"
            id="parent_id"
            class="form-control bg-dark text-light"
            bind:value={state.formData.parent_id}
            placeholder="Parent contact ID"
          />
        </div>
      </div>

      <!-- Addresses -->
      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5>Addresses</h5>
          <ActionBtn
            icon="plus-circle"
            title="Add Address"
            variant="outline-primary"
            size="sm"
            onClick={openAddAddressModal}
          />
        </div>

        {#if sortedAddresses.length > 0}
          {#each sortedAddresses as addr, i}
            <div class="card bg-secondary mb-2">
              <div class="card-body">
                <AddressForm
                  address={addr}
                  disabled={false}
                  hideLabels={false}
                  onChange={(updatedAddr) => {
                    const originalIndex = state.formData.addresses.findIndex(a => 
                      (a.addr_id && a.addr_id === updatedAddr.addr_id) || 
                      (!a.addr_id && a === addr)
                    );
                    if (originalIndex !== -1) {
                      state.formData.addresses[originalIndex] = updatedAddr;
                    }
                  }}
                />
                <div class="mt-2">
                  <ActionBtn
                    icon="trash"
                    title="Remove Address"
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      const originalIndex = state.formData.addresses.findIndex(a => 
                        (a.addr_id && a.addr_id === addr.addr_id) || 
                        (!a.addr_id && a === addr)
                      );
                      if (originalIndex !== -1) {
                        removeAddress(originalIndex);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          {/each}
        {:else}
          <p class="text-muted">No addresses added yet.</p>
        {/if}
      </div>

      <!-- Phones -->
      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5>Phones</h5>
          <ActionBtn
            icon="plus-circle"
            title="Add Phone"
            variant="outline-primary"
            size="sm"
            onClick={openAddPhoneModal}
          />
        </div>

        {#if sortedPhones.length > 0}
          {#each sortedPhones as phone, i}
            <div class="card bg-secondary mb-2">
              <div class="card-body">
                <PhoneForm
                  phone={phone}
                  disabled={false}
                  hideLabels={false}
                  onChange={(updatedPhone) => {
                    const originalIndex = state.formData.phones.findIndex(p => 
                      (p.phone_id && p.phone_id === updatedPhone.phone_id) || 
                      (!p.phone_id && p === phone)
                    );
                    if (originalIndex !== -1) {
                      state.formData.phones[originalIndex] = updatedPhone;
                    }
                  }}
                />
                <div class="mt-2">
                  <ActionBtn
                    icon="trash"
                    title="Remove Phone"
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      const originalIndex = state.formData.phones.findIndex(p => 
                        (p.phone_id && p.phone_id === phone.phone_id) || 
                        (!p.phone_id && p === phone)
                      );
                      if (originalIndex !== -1) {
                        removePhone(originalIndex);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          {/each}
        {:else}
          <p class="text-muted">No phones added yet.</p>
        {/if}
      </div>

      <!-- Emails -->
      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5>Emails</h5>
          <ActionBtn
            icon="plus-circle"
            title="Add Email"
            variant="outline-primary"
            size="sm"
            onClick={openAddEmailModal}
          />
        </div>

        {#if sortedEmails.length > 0}
          {#each sortedEmails as email, i}
            <div class="card bg-secondary mb-2">
              <div class="card-body">
                <EmailForm
                  email={email}
                  disabled={false}
                  hideLabels={false}
                  onChange={(updatedEmail) => {
                    const originalIndex = state.formData.emails.findIndex(e => 
                      (e.email_id && e.email_id === updatedEmail.email_id) || 
                      (!e.email_id && e === email)
                    );
                    if (originalIndex !== -1) {
                      state.formData.emails[originalIndex] = updatedEmail;
                    }
                  }}
                />
                <div class="mt-2">
                  <ActionBtn
                    icon="trash"
                    title="Remove Email"
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      const originalIndex = state.formData.emails.findIndex(e => 
                        (e.email_id && e.email_id === email.email_id) || 
                        (!e.email_id && e === email)
                      );
                      if (originalIndex !== -1) {
                        removeEmail(originalIndex);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          {/each}
        {:else}
          <p class="text-muted">No emails added yet.</p>
        {/if}
      </div>

      <!-- Assets Section -->
      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5>Assets</h5>
          <ActionBtn
            icon="plus-circle"
            title="Add Asset"
            variant="outline-primary"
            size="sm"
            onClick={openAddAssetModal}
          />
        </div>

        {#if state.isLoadingAssets}
          <div class="text-center py-2">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        {:else if state.assets && state.assets.length > 0}
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Serial</th>
                  <th>Hours</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each state.assets as asset}
                  <tr>
                    <td>{asset.brand_name}</td>
                    <td>{asset.model_name}</td>
                    <td>{asset.serial || asset.custom_serial || 'N/A'}</td>
                    <td>{asset.hours || 'N/A'}</td>
                    <td>
                      <ActionBtn
                        icon="pencil"
                        title="Edit Asset"
                        variant="outline-warning"
                        size="sm"
                        onClick={() => editAsset(asset)}
                      />
                      <ActionBtn
                        icon="trash"
                        title="Delete Asset"
                        variant="outline-danger"
                        size="sm"
                        onClick={() => deleteAsset(asset.asset_id)}
                        class="ms-1"
                      />
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p class="text-muted mb-0">No assets associated with this contact.</p>
        {/if}
      </div>

      <!-- Form Actions -->
      <div class="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          class="btn btn-outline-secondary"
          onclick={cancelEdit}
          title="Cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          title="Save Contact"
        >
          Save Changes
        </button>
      </div>
    </form>
  {/if}

  <!-- Add Address Modal -->
  {#if state.showAddAddressModal}
    <div class="modal-backdrop fade show" style="z-index: 1050;"></div>
    <div class="modal fade show d-block" tabindex="-1" style="z-index: 1051;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              Add Address
            </h6>
            <button
              type="button"
              class="btn-close"
              onclick={closeAddAddressModal}
              title="Close"
            ></button>
          </div>
          <div class="modal-body">
            <AddressForm
              address={state.newAddress}
              disabled={false}
              hideLabels={false}
              onChange={(updatedAddress) => {
                state.newAddress = {
                  ...state.newAddress,
                  ...updatedAddress,
                };
              }}
            />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline-secondary"
              onclick={closeAddAddressModal}
              title="Cancel"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary"
              onclick={addAddress}
              title="Add Address"
            >
              Add Address
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Add Phone Modal -->
  {#if state.showAddPhoneModal}
    <div class="modal-backdrop fade show" style="z-index: 1050;"></div>
    <div class="modal fade show d-block" tabindex="-1" style="z-index: 1051;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              Add Phone
            </h6>
            <button
              type="button"
              class="btn-close"
              onclick={closeAddPhoneModal}
              title="Close"
            ></button>
          </div>
          <div class="modal-body">
            <PhoneForm
              phone={state.newPhone}
              disabled={false}
              hideLabels={false}
              onChange={(updatedPhone) => {
                state.newPhone = updatedPhone;
              }}
            />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline-secondary"
              onclick={closeAddPhoneModal}
              title="Cancel"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary"
              onclick={addPhone}
              title="Add Phone"
            >
              Add Phone
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Add Email Modal -->
  {#if state.showAddEmailModal}
    <div class="modal-backdrop fade show" style="z-index: 1050;"></div>
    <div class="modal fade show d-block" tabindex="-1" style="z-index: 1051;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              Add Email
            </h6>
            <button
              type="button"
              class="btn-close"
              onclick={closeAddEmailModal}
              title="Close"
            ></button>
          </div>
          <div class="modal-body">
            <EmailForm
              email={state.newEmail}
              disabled={false}
              hideLabels={false}
              onChange={(updatedEmail) => {
                state.newEmail = updatedEmail;
              }}
            />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline-secondary"
              onclick={closeAddEmailModal}
              title="Cancel"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary"
              onclick={addEmail}
              title="Add Email"
            >
              Add Email
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Add Asset Modal -->
  {#if state.showAddAssetModal}
    <AddAsset
      contactId={contact?.contact_id || 0}
      onClose={closeAddAssetModal}
      onAssetAdded={(asset) => {
        state.assets = [...state.assets, asset];
        closeAddAssetModal();
      }}
    />
  {/if}

  <!-- Edit Asset Form (inline) -->
  {#if state.showEditAssetForm && state.editingAsset}
    <div class="modal-backdrop fade show" style="z-index: 1050;"></div>
    <div class="modal fade show d-block" tabindex="-1" style="z-index: 1051;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title">
              <i class="bi bi-pencil me-2"></i>
              Edit Asset
            </h6>
            <button
              type="button"
              class="btn-close"
              onclick={() => {
                state.showEditAssetForm = false;
                state.editingAsset = null;
              }}
              title="Close"
            ></button>
          </div>
          <div class="modal-body">
            <EditAsset
              asset={state.editingAsset}
              contactId={contact?.contact_id}
              onSave={handleAssetUpdate}
              onCancel={() => {
                state.showEditAssetForm = false;
                state.editingAsset = null;
              }}
            />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline-secondary"
              onclick={() => {
                state.showEditAssetForm = false;
                state.editingAsset = null;
              }}
              title="Cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
