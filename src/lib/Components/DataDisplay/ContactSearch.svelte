<script lang="ts">
  import {rfState} from '../../rf.svelte';
  import { type Contact } from '$api/endpoints/contacts';
  import { searchContacts as apiSearchContacts } from '../../api/endpoints/contacts';
  let { onSelectContact, onAddContact } = $props<{
    onSelectContact: (contact: Contact) => void;
    onAddContact: () => void;
  }>();

  let searchTerm = $state('');
  let searchResults = $state<Contact[]>([]);
  let isLoading = $state(false);

  // Function to search contacts using backend API
  async function searchContacts() {
    if (!searchTerm.trim()) {
      searchResults = [];
      return;
    }

    isLoading = true;

    try {
      // Use the backend searchContacts API
      const result = await apiSearchContacts(searchTerm);

      if (result.error && result.error.message) {
        console.error('Search contacts error:', result.error.message);
        searchResults = [];
      } else {
        searchResults = result.data || [];
      }
    } catch (error) {
      console.error('Error searching contacts:', error);
      searchResults = [];
    } finally {
      isLoading = false;
    }
  }

  function isAlpha(str: string) {
    return /^[a-zA-Z\s]+$/.test(str.trim());
  }

  function isPhone(str: string) {
    const cleaned = str.replace(/[\s\-\(\)\.]/g, '');
    return /^\d{7,15}$/.test(cleaned);
  }

  function isEmail(str: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  function clearSearch() {
    searchTerm = '';
    searchResults = [];
  }

  function handleSelect(contact: Contact) {
    onSelectContact(contact);
    searchTerm = '';
    searchResults = [];
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      searchContacts();
    }
  }
</script>

<div class="input-group">
  <input
    type="text"
    class="form-control"
    id="contact-search"
    placeholder="Search by name, phone or email..."
    bind:value={searchTerm}
    onkeypress={handleKeyPress}
  >
  <button class="btn btn-outline-secondary" onclick={searchContacts} title="Search">
    <i class="bi bi-search"></i>
  </button>
  <button class="btn btn-outline-secondary" onclick={clearSearch} title="Clear Search">
    <i class="bi bi-x-lg"></i>
  </button>
  <button class="btn btn-outline-success" onclick={onAddContact} title="Add New Contact">
    <i class="bi bi-person-plus"></i>
  </button>
</div>

{#if isLoading}
  <div class="alert alert-info mt-2">Searching contacts...</div>
{:else if searchResults.length > 0}
  <div class="list-group mt-2">
    {#each searchResults as contact (contact.contact_id)}
      <!-- svelte-ignore a11y_invalid_attribute -->
      <a
        href="#"
        class="list-group-item list-group-item-action"
        onclick={(e: MouseEvent) => { e.preventDefault(); handleSelect(contact); }}
        title="Select Contact"
        target="_parent"
      >
        <div class="d-flex w-100 justify-content-between">
          <h6 class="mb-1">{contact.display_name}</h6>
          {#if contact.phones && contact.phones.length > 0}
            <small>{contact.phones[0].formatted_phone}</small>
          {/if}
        </div>
        {#if contact.emails && contact.emails.length > 0}
          <p class="mb-1">{contact.emails[0].email}</p>
        {/if}
      </a>
    {/each}
  </div>
{:else if searchTerm}
  <div class="alert alert-info mt-2">No contacts match your search.</div>
{/if}

