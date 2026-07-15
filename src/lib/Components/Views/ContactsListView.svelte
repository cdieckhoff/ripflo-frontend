<script lang="ts">
  import { type Contact } from '../../api/endpoints/contacts';
  import { listContacts } from '../../api/endpoints/contacts';
  import {rfState} from '../../rf.svelte';
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
      console.error('ContactsListView: Error loading contacts:', err);
    } finally {
      state.isLoading = false;
    }
  }

  // Initialize data
  onMount(loadContacts);
</script>

<div class="contacts-list-view">
  <h4 class="mb-4">Contacts</h4>

  {#if state.error}
    <div class="alert alert-danger" role="alert">
      {state.error}
      <button title='Close' type="button" class="btn-close" onclick={() => {state.error = null}}></button>
    </div>
  {/if}

  <!-- Contacts Table -->
  <div class="card bg-dark text-light">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Contacts ({rfState.contacts.length})</h5>
    </div>
    <div class="card-body p-0">
      {#if state.isLoading}
        <div class="p-5 text-center">
          <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      {:else}
        <div class="table-responsive">
          <table class="table  table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each rfState.contacts as contact}
                <tr>
                  <td>{contact.contact_id}</td>
                  <td>{contact.display_name}</td>
                  <td>
                    {#if contact.emails && contact.emails.length > 0}
                      {contact.emails[0]?.email || 'No email'}
                    {:else}
                      No email
                  {/if}
                  </td>
                  <td>
                    {#if contact.phones && contact.phones.length > 0}
                      {contact.phones[0]?.formatted_phone || 'No phone'}
                    {:else}
                      No phone
                    {/if}
                  </td>
                  <td>
                    {#if contact.addresses && contact.addresses.length > 0}
                      {contact.addresses[0]?.addr1 || 'No address'},
                      {contact.addresses[0]?.city || ''},
                      {contact.addresses[0]?.state || ''}
                      {contact.addresses[0]?.zip || ''}
                    {:else}
                      No address
                    {/if}
                  </td>
                  <td>
                    <button
                      class="btn btn-outline-primary btn-sm me-2"
                      title="Edit contact"
                      onclick={() => {if (onEditContact) onEditContact(contact);}}
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" title="Delete contact">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              {/each}
              {#if rfState.contacts.length === 0}
                <tr>
                  <td colspan="6" class="text-center text-muted py-4">
                    No contacts found
                  </td>
                </tr>
              {/if}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>

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