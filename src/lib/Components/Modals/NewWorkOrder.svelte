<!-- NewWorkOrder.svelte -->
<script lang="ts">
  import ContactSearch from "../DataDisplay/ContactSearch.svelte";
  import ContactDisplay from "./Contacts/ContactDisplay.svelte";
  import WorkOrderForm from "./WorkOrderForm.svelte";
  //import SignaturePad from './SignaturePad.svelte';
  import AddContact from "./Contacts/AddContact.svelte";
  import AddAsset from "./Contacts/AddAsset.svelte";
  import Selector from '$ui/Selector.svelte';

  import {rfState} from '$lib/rf.svelte';
  import {
    type CreateWorkOrderRequest

   } from "../../ripflo";
  import { getContact, type Contact, type ContactSearchResults} from '../../api/endpoints/contacts';
  import { createWorkOrder } from '../../api/endpoints/workorders';
  import { createWorkOrderNote, type CreateWorkOrderNoteRequest, createWorkOrderItem } from '../../api/endpoints/workorder-related';
  import { WorkOrderNoteType, Priority } from '../../types/consolidated-enums';
  import { listUsers, type User } from '../../api/endpoints/users';
  import { listFacilities, type Facility } from '../../api/endpoints/facilities';

  let { onClose } = $props<{ onClose: () => void }>();

  import { type Asset } from '../../api/endpoints/assets';

  let selectedContact = $state<Contact | null>(null);
  let selectedAsset = $state<Asset | null>(null);
  let selectedFacility = $state<Facility | null>(null);
  let facilities = $state<Facility[]>([]);
  let showAddContactModal = $state(false);
  let showAddEquipmentModal = $state(false);
  let showUncatModal = $state(false);
  let workOrderDetails = $state({
    description: "",
    priority: Priority.NORMAL,
    notes: "",
  });
  let signature = $state("");

  // Load facilities on mount
  $effect(() => {
    async function loadFacilities() {
      try {
        const result = await listFacilities();
        if (!result.error && result.data) {
          facilities = result.data.filter(f => f.is_active === 1);
          // Default to user's facility if available
          if (rfState.currentUser?.fac_id) {
            selectedFacility = facilities.find(f => f.fac_id === rfState.currentUser.fac_id) || null;
          }
        }
      } catch (error) {
        console.error('Error loading facilities:', error);
      }
    }
    loadFacilities();
  });

  // Function to be called when the parent modal is closed
  export function resetFormAndClose() {
    // Reset form
    selectedContact = null;
    selectedAsset = null;
    workOrderDetails = {
      description: "",
      priority: Priority.NORMAL,
      notes: "",
    };
    signature = "";
  }

  function hideModal() {
    // Notify parent component to close the modal
    if (onClose) {
      onClose();
    }
  }

  async function handleContactSelect(contact:ContactSearchResults) {
      // Otherwise, fetch the full contact details including assets
      try {
        const response = await getContact(contact.contact_id);
        console.log(response);
        if (!response.error && response.data) {
          selectedContact = response.data[0];
        } else {
          // If there's an error, use the basic contact info from search
          selectedContact = null;
        }
      } catch (error) {
        console.error('Error fetching full contact details:', error);
        // Fallback to the basic contact info from search
        selectedContact = null;
      }
  }

  function handleRemoveContact() {
    selectedContact = null;
  }

  function handleAddContact() {
    showAddContactModal = true;
  }

  function handleAddEquipment(contactId: number) {
    if (selectedContact && selectedContact.contact_id === contactId) {
      showAddEquipmentModal = true;
    }
  }

  async function handleContactAdded(newContact) {
    // Fetch the full contact details including assets
    try {
      const response = await getContact(newContact.contact_id);
      if (!response.error && response.data && response.data.length > 0) {
        selectedContact = response.data[0];
      } else {
        // If there's an error, use the basic contact info from the new contact
        selectedContact = newContact;
      }
    } catch (error) {
      console.error('Error fetching full contact details:', error);
      // Fallback to the basic contact info from the new contact
      selectedContact = newContact;
    }
    showAddContactModal = false;
  }

  function handleAssetAdded(newEquipment: Asset) {
    // Update the selected contact's assets array
    if (selectedContact) {
      if (selectedContact.assets) {
        // Add the new asset to the existing assets array
        selectedContact.assets = [...selectedContact.assets, newEquipment];
      } else {
        // Initialize the assets array with the new asset
        selectedContact.assets = [newEquipment];
      }
    }
    selectedAsset = newEquipment;
    showAddEquipmentModal = false;

    // Check if the model category is uncategorized
    if (newEquipment.model_category && newEquipment.model_category.toLowerCase().includes('uncategorized')) {
      showUncatModal = true;
    }
  }

  function handleCloseAddContact() {
    showAddContactModal = false;
  }

  function handleCloseAddEquipment() {
    showAddEquipmentModal = false;
  }

  function handleDescriptionChange(value) {
    workOrderDetails.description = value;
  }

  function handlePriorityChange(value) {
    workOrderDetails.priority = value;
  }

  function handleNotesChange(value) {
    workOrderDetails.notes = value;
  }

  function handleSignatureChange(newSignature) {
    signature = newSignature;
  }

  function handleClearSignature() {
    signature = "";
  }

  function resetForm() {
    selectedContact = null;
    selectedAsset = null;
    workOrderDetails = {
      description: "",
      priority: Priority.NORMAL,
      notes: "",
    };
    signature = "";
  }

  async function handleCreateWorkOrder() {
    //if (!signature) {
      //alert("Please sign before creating the work order");
      //return;
    //}

    // Check if the selected equipment has an uncategorized model category
    if (selectedAsset && selectedAsset.model_category &&
        selectedAsset.model_category.toLowerCase().includes('uncategorized')) {
      showUncatModal = true;
      return; // Don't create the work order yet
    }

    try {
      // Get the current user ID from rfState
      let userId = 3; // Default fallback

      if (rfState.currentUser) {
        userId = rfState.currentUser.user_id || 3;
      }

      // Use selected facility ID, fallback to user's facility ID
      const facilityId = selectedFacility?.fac_id || rfState.currentUser?.fac_id || 1;

      // Create the work order
      const workOrderPayload = {
        contact_id: selectedContact.contact_id,
        asset_id: selectedAsset ? selectedAsset.asset_id : null,
        created_by: userId,
        fac_id: facilityId,
        status: 1, // Status is number in CreateWorkOrderRequest
        priority: workOrderDetails.priority,
      };

      const workOrderResponse = await createWorkOrder(workOrderPayload);

      if (workOrderResponse.error) {
        console.error('Error creating work order:', workOrderResponse.error.message);
        alert(`Error creating work order: ${workOrderResponse.error.message}`);
        return;
      }

      if (workOrderResponse.data && workOrderResponse.data.length > 0) {
        const createdWorkOrder = workOrderResponse.data[0];
        const workOrderId = createdWorkOrder.workorder_id;

        // Create workorder_notes for each line in description (problem type)
        if (workOrderDetails.description) {
          const descriptionLines = workOrderDetails.description.split('\n').filter(line => line.trim() !== '');
          for (const line of descriptionLines) {
            const workOrderNotePayload: CreateWorkOrderNoteRequest = {
              workorder_id: workOrderId, // Using correct field name
              type: WorkOrderNoteType.PROBLEM, // Using PROBLEM as the note type
              text: line.trim(), // Using text field for the content
              author_user_id: userId, // Include the signed-in user's ID
            };

            try {
              await createWorkOrderNote(workOrderNotePayload);
            } catch (error) {
              console.error('Error creating workorder_note for description line:', error);
              // Don't fail the entire operation if note creation fails
            }
          }
        }

        // Create workorder_notes for each line in notes
        if (workOrderDetails.notes) {
          const notesLines = workOrderDetails.notes.split('\n').filter(line => line.trim() !== '');
          for (const line of notesLines) {
            const workOrderNotePayload: CreateWorkOrderNoteRequest = {
              workorder_id: workOrderId, // Using correct field name
              type: WorkOrderNoteType.MEMO, // Using MEMO as the note type
              text: line.trim(), // Using text field for the content
              author_user_id: userId, // Include the signed-in user's ID
            };

            try {
              await createWorkOrderNote(workOrderNotePayload);
            } catch (error) {
              console.error('Error creating workorder_note for note line:', error);
              // Don't fail the entire operation if note creation fails
            }
          }
        }
      }

      hideModal();
    } catch (error) {
      console.error('Error creating work order:', error);
      alert('An error occurred while creating the work order');
    }
  }

  // Handle uncategorized confirmation
  function handleUncatConfirm(rateId) {
    showUncatModal = false;
    // Continue with work order creation
    hideModal();
  }

  // Handle uncategorized cancellation
  function handleUncatCancel() {
    showUncatModal = false;
  }
</script>

<!-- Modal backdrop -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-backdrop fade show" style="z-index: 1050;" onclick={hideModal}></div>

<!-- Modal dialog -->
<div class="modal d-block" style="z-index: 1051;">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-dialog modal-lg" onclick={event => event.stopPropagation()}>
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-clipboard2 me-2"></i>
          New Work Order
        </h5>
        <button type="button" class="btn-close" onclick={hideModal} title="Close"></button>
      </div>
      <div class="modal-body">
        {#if !selectedContact}
          <div class="mb-3">
            <label for="contact-search" class="form-label">
              <i class="bi bi-search me-1"></i>
              Search Customer (Name, Phone, or Email)
            </label>
            <ContactSearch
              onSelectContact={handleContactSelect}
              onAddContact={handleAddContact}
            />
          </div>
        {:else}
          <ContactDisplay
            contact={selectedContact}
            onRemoveContact={handleRemoveContact}
            onAddAsset={handleAddEquipment}
            onAssetSelected={(asset) => selectedAsset = asset}
          />

          <div class="mb-3">
            <label for="facility-select" class="form-label">
              <i class="bi bi-building me-1"></i>
              Facility
            </label>
            <select
              id="facility-select"
              class="form-select"
              disabled={facilities.length === 0}
              title="Select facility"
              onchange={(e) => {
                const facId = parseInt(e.currentTarget.value, 10);
                selectedFacility = facilities.find(f => f.fac_id === facId) || null;
              }}
            >
              <option value="">Select a facility...</option>
              {#each facilities as facility}
                <option value={facility.fac_id} selected={facility.fac_id === selectedFacility?.fac_id}>
                  {facility.fac_name}
                </option>
              {/each}
            </select>
          </div>

          <WorkOrderForm
            contact={selectedContact}
            {workOrderDetails}
            onDescriptionChange={handleDescriptionChange}
            onPriorityChange={handlePriorityChange}
            onNotesChange={handleNotesChange}
          />
        {/if}
      </div>
      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          onclick={resetForm}
          title="Clear Form"
        >
          <i class="bi bi-arrow-counterclockwise me-1"></i>
          Clear
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          onclick={hideModal}
          title="Cancel"
        >
          <i class="bi bi-x-circle me-1"></i>
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          onclick={handleCreateWorkOrder}
          title="Create Work Order"
          disabled={!selectedContact}
        >
          <i class="bi bi-check-circle me-1"></i>
          Create
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Add Contact Modal -->
{#if showAddContactModal}
  <AddContact
    onContactAdded={handleContactAdded}
    onClose={handleCloseAddContact}
  />
{/if}

<!-- Add Equipment Modal -->
{#if showAddEquipmentModal && selectedContact}
  <div style="position: relative; z-index: 1052;">
    <AddAsset
      contactId={selectedContact.contact_id}
      onAssetAdded={handleAssetAdded}
      onClose={handleCloseAddEquipment}
    />
  </div>
{/if}


