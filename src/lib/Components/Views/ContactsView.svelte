<script lang="ts">
  import { rfState } from '../../rf.svelte';
  import { onMount } from 'svelte';
  import { listContacts } from '../../api/endpoints/contacts';
  import ContactsCardView from './ContactsCardView.svelte';
  import ContactsListView from './ContactsListView.svelte';
  import EditContact from '../Modals/Contacts/EditContact.svelte';
  import EntitySearch from '../UI/EntitySearch.svelte';
  import ActionBtn from '../UI/ActionBtn.svelte';
  import ActionIcon2 from '../UI/ActionIcon2.svelte';
  import ViewModeToggle from '../UI/ViewModeToggle.svelte';
  import NewContact from '../Modals/Contacts/AddContact.svelte';

  let viewMode = $state('card');
  let contactViewState = $state('list-view'); // 'list-view', 'card-view', or 'edit-form'
  let currentContact = $state(null);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let showNewContact = $state(false);

  async function fetchContacts() {
    isLoading = true;
    try {
      const response = await listContacts({}, 1, 50); // Fetch first 50 contacts
      if (response.error && response.error.message && response.error.message.trim() !== '') {
        error = response.error.message;
      } else {
        rfState.contacts = response.data || [];
      }
    } catch (err) {
      error = 'Failed to load contacts';
    } finally {
      isLoading = false;
    }
  }

  function handleAddContact() {
    showNewContact = true;
  }

  function handleSearchSelect(result: any) {
    // Handle selected contact from search - go straight to edit form
    currentContact = result;
    contactViewState = 'edit-form';
  }

  function handleEditContact(contact: any) {
    currentContact = contact;
    contactViewState = 'edit-form';
  }

  function handleSaveContact(updatedContact) {
    // Update the contact in the global state
    const contactIndex = rfState.contacts.findIndex(c => c.contact_id === updatedContact.contact_id);
    if (contactIndex !== -1) {
      rfState.contacts[contactIndex] = updatedContact;
    }
    // Reset the view back to the list view
    contactViewState = 'list-view';
    currentContact = null;
  }

  function handleCancelEdit() {
    // Reset the view back to the list view
    contactViewState = 'list-view';
    currentContact = null;
  }

  onMount(async () => {
    await fetchContacts();
  });

  function switchView() {
    switch(contactViewState) {
      case 'edit-form':
        return EditContact;
      default:
        // For list-view and card-view, use viewMode to determine which component to show
        switch(viewMode) {
          case 'list':
            return ContactsListView;
          case 'card':
          default:
            return ContactsCardView;
        }
    }
  }

  const View = $derived(switchView());
</script>

<div class="contacts-view">
  {#if contactViewState === 'edit-form' && currentContact}
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5>Edit Contact</h5>
        <button
          class="btn btn-outline-secondary"
          onclick={() => {contactViewState = 'list-view'; currentContact = null;}}
          title="Back to Contacts"
        >
          <i class="bi bi-arrow-left"></i> Back to Contacts
        </button>
      </div>
      <EditContact
        contact={currentContact}
        onSave={handleSaveContact}
        onCancel={handleCancelEdit}
      />
    </div>
  {:else if showNewContact}
    <NewContact
      onContactAdded={(contact) => {
        showNewContact = false;
        fetchContacts(); // Refresh the contact list
      }}
      onClose={() => showNewContact = false}
    />
  {:else}
    <!-- Header with search and add button -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="col-8">
        <EntitySearch
          entityType="contact"
          onSelect={handleSearchSelect}
          onAdd={handleAddContact}
        />
      </div>
      <div class="d-flex justify-content-end col-4">
        <ActionIcon2
          onClick={handleAddContact}
          props="bi-person-plus"
          action="Add Contact"
          text="Add Contact"
        />
      </div>
    </div>

    <!-- View toggle buttons -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h6>Contacts</h6>
      <ViewModeToggle
        currentMode={viewMode}
        onModeChange={(mode) => viewMode = mode}
      />
    </div>

    <View
      onEditContact={handleEditContact}
    />
  {/if}
</div>