<script lang="ts">
  import { type Contact } from '../../api/endpoints/contacts';
  import { listContacts } from '../../api/endpoints/contacts';
  import {rfState} from '../../rf.svelte'
  import { onMount } from 'svelte';

  let { onEditContact = null } = $props<{
    onEditContact?: (contact: Contact) => void;
  }>();

  // State variables
  let state = $state({
    isLoading: false,
    error: null as string | null,
    currentPage: 1,
    pageSize: 10,
    totalContacts: 0,
    totalPages: 0
  });

  // Fetch contacts and sync with rfState
  async function loadContacts() {
    state.isLoading = true;
    state.error = null;
    try {
      const response = await listContacts({}, state.currentPage, state.pageSize);
      if (response.error && response.error.message && response.error.message.trim() !== '') {
        state.error = response.error.message;
      } else {
        if (response.data && response.data.length > 0) {
          rfState.contacts = [...response.data];
        } else {
          rfState.contacts = [];
        }
        // For now, we'll set total contacts to the length of returned data
        // In a real implementation, this would come from the API response
        state.totalContacts = response.data?.length || 0;
        state.totalPages = Math.ceil(state.totalContacts / state.pageSize);
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to load contacts';
      console.error('Error loading contacts:', err);
    } finally {
      state.isLoading = false;
    }
  }

  // Initialize data
  onMount(loadContacts);
</script>

<div class="contacts-card-view">
  <h4 class="mb-4">Contacts</h4>

  {#if state.error}
    <div class="alert alert-danger" role="alert">
      {state.error}
      <button title='Close' type="button" class="btn-close" onclick={() => {state.error = null}}></button>
    </div>
  {/if}

  {#if state.isLoading}
    <div class="d-flex justify-content-center p-5">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  {:else}
    {#if rfState.contacts.length === 0}
      <div class="text-center text-muted py-5">
        <h5>No contacts found</h5>
      </div>
    {:else}
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {#each rfState.contacts as contact}
          <div class="col">
            <div class="card bg-dark text-light h-100">
              <div class="card-body">
                <h5 class="card-title">{contact.display_name}</h5>
                <p class="card-text">
                  {#if contact.emails && contact.emails.length > 0}
                    <i class="bi bi-envelope me-2"></i>{contact.emails[0]?.email || 'No email'}<br>
                  {:else}
                    <i class="bi bi-envelope me-2"></i>No email<br>
                  {/if}
                  {#if contact.phones && contact.phones.length > 0}
                    <i class="bi bi-telephone me-2"></i>{contact.phones[0]?.formatted_phone || 'No phone'}<br>
                  {:else}
                    <i class="bi bi-telephone me-2"></i>No phone<br>
                  {/if}
                  {#if contact.addresses && contact.addresses.length > 0}
                    <i class="bi bi-geo-alt me-2"></i>
                    {contact.addresses[0]?.addr1 || 'No address'},
                    {contact.addresses[0]?.city || ''},
                    {contact.addresses[0]?.state || ''}
                    {contact.addresses[0]?.zip || ''}
                  {:else}
                    <i class="bi bi-geo-alt me-2"></i>No address
                  {/if}
                </p>
              </div>
              <div class="card-footer bg-transparent border-top-secondary">
                <div class="d-flex justify-content-between">
                  <button
                    class="btn btn-outline-primary btn-sm"
                    title="Edit contact"
                    onclick={() => {if (onEditContact) onEditContact(contact);}}
                  >
                    <i class="bi bi-pencil"></i> Edit
                  </button>
                  <button class="btn btn-outline-danger btn-sm" title="Delete contact">
                    <i class="bi bi-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}

  {#if !state.isLoading && rfState.contacts.length > 0}
    <!-- Pagination controls -->
    <div class="d-flex justify-content-between align-items-center mt-4">
      <div>
        <span>Page {state.currentPage} of {state.totalPages}</span>
      </div>
      <div class="btn-group" role="group">
        <button
          class="btn btn-outline-secondary"
          title="Previous page"
          disabled={state.currentPage <= 1}
          onclick={() => {state.currentPage = Math.max(1, state.currentPage - 1); loadContacts();}}
        >
          Previous
        </button>
        <button
          class="btn btn-outline-secondary"
          title="Next page"
          disabled={state.currentPage >= state.totalPages}
          onclick={() => {state.currentPage = Math.min(state.totalPages, state.currentPage + 1); loadContacts();}}
        >
          Next
        </button>
      </div>
    </div>
  {/if}
</div>