<script lang="ts">
  import { type Contact } from '../../api/endpoints/contacts';
  import { getContact } from '../../api/endpoints/contacts';
  import { rfState } from '../../rf.svelte';
  import { onMount } from 'svelte';
  import EditContact from '../Modals/Contacts/EditContact.svelte';

  // State
  let state = $state({
    isLoading: false,
    error: null as string | null,
    isEditing: false,
  });

  // Get contact from rfState or load from API
  let currentContact = $derived(rfState.currentContact);
  let contact = $derived(currentContact || null);

  // Load contact details if not in rfState
  async function loadContact() {
    if (!contact && rfState.currentContact?.contact_id) {
      state.isLoading = true;
      state.error = null;

      try {
        const response = await getContact(rfState.currentContact.contact_id);

        if (response.error && response.error.message) {
          state.error = response.error.message;
          return;
        }

        // Update rfState with fresh data if needed
        rfState.currentContact = response.data[0] || null;
      } catch (err) {
        state.error = err instanceof Error ? err.message : 'Failed to load contact';
        console.error('Error loading contact:', err);
      } finally {
        state.isLoading = false;
      }
    }
  }

  // Handle save from edit form
  function handleSave(updatedContact: Contact) {
    rfState.currentContact = updatedContact;
    state.isEditing = false;

    // Update rfState.contacts as well
    const contactIndex = rfState.contacts.findIndex(c => c.contact_id === updatedContact.contact_id);
    if (contactIndex !== -1) {
      rfState.contacts[contactIndex] = updatedContact;
    }
  }

  // Handle cancel from edit form
  function handleCancel() {
    state.isEditing = false;
  }


  // Refresh contact after edit
  $effect(() => {
    if (rfState.currentContact?.contact_id && !state.isEditing) {
      loadContact();
    }
  });
</script>

<div class="contact-detail-view p-4">
  {#if state.error}
    <div class="alert alert-danger" role="alert">
      {state.error}
      <button type="button" class="btn-close" onclick={() => state.error = null} title="Close error message"></button>
    </div>
  {/if}

  {#if state.isLoading}
    <div class="d-flex justify-content-center p-5">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  {:else if state.isEditing && contact}
    <ContactEditForm
      contact={contact}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  {:else if contact}
    <div class="contact-detail-card">
      <div class="d-flex justify-content-between align-items-start mb-4">
        <h4 class="mb-0">{contact.display_name}</h4>
        <div>
          <button
            class="btn btn-outline-primary me-2"
            onclick={() => state.isEditing = true}
            title="Edit Contact"
          >
            <i class="bi bi-pencil"></i> Edit
          </button>
          <button
            class="btn btn-outline-danger"
            title="Delete Contact"
          >
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="card bg-dark text-light mb-3">
            <div class="card-header">Contact Information</div>
            <div class="card-body">
              <p><strong>Type:</strong> {contact.type}</p>
              <p><strong>Priority:</strong> {contact.priority}</p>
              <p><strong>Active:</strong> {contact.is_active ? 'Yes' : 'No'}</p>
              {#if contact.parent_id}
                <p><strong>Parent ID:</strong> {contact.parent_id}</p>
              {/if}
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card bg-dark text-light mb-3">
            <div class="card-header">Addresses</div>
            <div class="card-body">
              {#if contact.addresses && contact.addresses.length > 0}
                {#each contact.addresses as address}
                  <div class="mb-2">
                    {#if address.is_primary === 1}<strong>Primary: </strong>{/if}
                    <div>{address.addr1}</div>
                    {#if address.addr2}<div>{address.addr2}</div>{/if}
                    <div>{address.city}, {address.state} {address.zip}</div>
                    <small class="text-muted">({address.addr_type})</small>
                  </div>
                {/each}
              {:else}
                <p class="text-muted">No addresses</p>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="card bg-dark text-light mb-3">
            <div class="card-header">Phone Numbers</div>
            <div class="card-body">
              {#if contact.phones && contact.phones.length > 0}
                {#each contact.phones as phone}
                  <div class="mb-2">
                    {#if phone.is_primary === 1}<strong>Primary: </strong>{/if}
                    {phone.formatted_phone}
                  </div>
                {/each}
              {:else}
                <p class="text-muted">No phone numbers</p>
              {/if}
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card bg-dark text-light mb-3">
            <div class="card-header">Email Addresses</div>
            <div class="card-body">
              {#if contact.emails && contact.emails.length > 0}
                {#each contact.emails as email}
                  <div class="mb-2">
                    {#if email.is_primary === 1}<strong>Primary: </strong>{/if}
                    {email.email}
                  </div>
                {/each}
              {:else}
                <p class="text-muted">No email addresses</p>
              {/if}
            </div>
          </div>
        </div>
      </div>

      {#if contact.assets && contact.assets.length > 0}
        <div class="card bg-dark text-light mb-3">
          <div class="card-header">Assets</div>
          <div class="card-body">
            {#each contact.assets as asset}
              <div class="mb-2">
                <strong>{asset.brand_name} {asset.model_name}</strong> - {asset.serial}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="text-center text-muted py-5">
      <h5>Contact not found</h5>
    </div>
  {/if}
</div>