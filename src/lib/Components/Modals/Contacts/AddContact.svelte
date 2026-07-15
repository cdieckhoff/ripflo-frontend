<!-- AddContact.svelte -->
<script lang="ts">
  import {
    type Contact,
    type CreateContactRequest,
    createContact,
  } from "$lib/api/endpoints/contacts";
  import { loadZip, getZip } from "$lib/api/client";
  import { ContactType } from "$lib/types/consolidated-enums";
  import AddAsset from "./AddAsset.svelte";
  import ActionBtn from "../../UI/ActionBtn.svelte";
  import AddressForm from "../../UI/AddressForm.svelte";
  import PhoneForm from "../../UI/PhoneForm.svelte";
  import { type Asset } from "$lib/api/endpoints/assets";

  let { onClose, onContactAdded } = $props();

  let isPerson = $state(true);
  let isCompany = $state(false);
  let isSupplier = $state(false);
  let isEmployee = $state(false);
  let hiddenVals = $state({ city: "", state: "" });
  let showAddAsset = $state(false);

  let contactData = $state<CreateContactRequest>({
    display_name: "",
    type_field: ContactType.PERSON,
    addresses: [
      {
        addr1: "",
        addr2: "",
        zip: 64067,
        is_primary: 1,
      },
    ],
    phones: [
      {
        formatted_phone: "",
        is_primary: 1,
      },
    ],
    emails: [{ email: "" }],
  });
  let newContact = $state<Contact>();
  let error = $state<string | null>(null);
  let loading = $state(false);
  let createdContactId = $state<number | null>(null);

  async function addContact() {
    loading = true;
    error = null;

    try {
      // Prepare the contact data
      const response = await createContact(contactData);

      if (!response.error && response.data && response.data.length > 0) {
        // Contact will be automatically added to global app state via WebSocket
        // we still need to return the contact here for continuation
        // of workorder. For now, this is the only time Contacts get added.
        const createdContact = response.data[0];
        newContact = createdContact;
        createdContactId = createdContact.contact_id;
        onContactAdded(newContact);
        onClose();
      } else {
        error = response.error.message;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to create contact";
    } finally {
      loading = false;
    }
  }

  function resetForm() {
    contactData = {
      display_name: "",
      type_field: ContactType.PERSON,
      addresses: [
        {
          addr1: "",
          zip: 64067,
          is_primary: 1,
        },
      ],
      phones: [
        {
          formatted_phone: "",
          is_primary: 1,
        },
      ],
      emails: [{ email: "" }],
    };
  }

</script>

{#if !showAddAsset}
  <div class="modal-backdrop fade show" style="z-index: 1050;"></div>
  <div class="modal fade show d-block" tabindex="-1" style="z-index: 1051;">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h6 class="modal-title">
            <i class="bi bi-person-plus me-2"></i>
            New Contact
          </h6>
          <button
            type="button"
            class="btn-close"
            onclick={onClose}
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

          <div class="row">
            <div class="d-flex justify-content-between mb-2">
              <div class="form-check form-check-inline mb-1">
                <input
                  class="form-check-input"
                  type="checkbox"
                  name="addContact"
                  bind:checked={isPerson}
                  onchange={(e) => {
                    isPerson = true;
                    isCompany = false;
                    isSupplier = false;
                    contactData.type_field = ContactType.PERSON;
                  }}
                />
                <label class="form-check-label" for="cbPerson">Person</label>
              </div>
              <div class="form-check form-check-inline">
                <input
                  class="form-check-input"
                  type="checkbox"
                  name="cbtype"
                  bind:checked={isCompany}
                  onchange={(e) => {
                    isCompany = true;
                    isPerson = false;
                    isSupplier = false;
                    contactData.type_field = ContactType.COMPANY;
                  }}
                />
                <label class="form-check-label" for="cbCompany">Company</label>
              </div>
              <div class="form-check form-check-inline">
                <input
                  class="form-check-input"
                  type="checkbox"
                  name="cbtype"
                  bind:checked={isSupplier}
                  onchange={(e) => {
                    isSupplier = true;
                    isPerson = false;
                    isCompany = false;
                    contactData.type_field = ContactType.SUPPLIER;
                  }}
                />
                <label class="form-check-label" for="cbSupplier">Supplier</label
                >
              </div>
            </div>
          </div>
          <div class="row">
            <div class="mb-3">
              <label for="display_name" class="form-label">Name</label>
              <input
                id="display_name"
                type="text"
                class="form-control"
                bind:value={contactData.display_name}
                placeholder="Name"
              />
            </div>
          </div>

          <div class="mb-3">
            <AddressForm
              address={contactData.addresses[0]}
              disabled={false}
              hideLabels={false}
              onChange={(updatedAddress) => {
                contactData.addresses[0] = {
                  ...contactData.addresses[0],
                  ...updatedAddress,
                };
                // Update the facility zip when address zip changes
                contactData.fac_zip = updatedAddress.zip;
              }}
            />
          </div>

          <div class="row border-bottom mb-3">
            <div class="d-flex justify-content-between">
              <PhoneForm
                phone={contactData.phones[0]}
                disabled={false}
                hideLabels={false}
                onChange={(updatedPhone) => {
                  contactData.phones[0] = {
                    ...contactData.phones[0],
                    ...updatedPhone,
                  };
                }}
              />
              </div>
              <div class="col-md-6 mb-3">
                <label for="email" class="form-label">Email (Optional)</label>
                <input
                  id="email"
                  type="email"
                  class="form-control"
                  bind:value={contactData.emails[0].email}
                  placeholder="email@example.com"
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
          onclick={addContact}
          title="Add Contact"
          disabled={loading}
        >
          {#if loading}
            <span class="spinner-border spinner-border-sm me-1" role="status"></span>
          {:else}
            <i class="bi bi-check-circle me-1"></i>
          {/if}
          Add Contact
        </button>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if showAddAsset}
  <AddAsset
    contactId={createdContactId || 0}
    onClose={closeAddAsset}
    onAssetAdded={handleAssetAdded}
  />
{/if}
