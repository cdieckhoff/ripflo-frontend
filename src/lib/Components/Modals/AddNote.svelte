<script lang="ts">
  import { rfState } from '../../rf.svelte';
  import { createWorkOrderNote, type CreateWorkOrderNoteRequest } from '../../api/endpoints/workorder-related';
  import { WorkOrderNoteType, WorkOrderNoteIsPrivate } from '../../types/consolidated-enums';
  import { toastStore } from '../../stores/toastStore';

  let { workOrder, disabled = false, onNoteAdded, onClose } = $props<{
    workOrder?: any; // WorkOrder object
    disabled?: boolean;
    onNoteAdded?: (note: any) => void;
    onClose?: () => void;
  }>();

  let newNoteType = $state(WorkOrderNoteType.MEMO);
  let newNoteText = $state('');
  let newNoteIsPrivate = $state(false);

  async function handleAddNote() {
    if (!workOrder?.workorder_id || !newNoteText.trim()) return;

    try {
      // Get the current user ID from rfState
      let userId = 3; // Default fallback
      
      if (rfState.currentUser) {
        userId = rfState.currentUser.user_id || 3;
      }

      // Create the note payload
      const notePayload: CreateWorkOrderNoteRequest = {
        workorder_id: workOrder.workorder_id,
        type: newNoteType,
        text: newNoteText.trim(),
        author_user_id: userId,
        is_private: newNoteIsPrivate ? WorkOrderNoteIsPrivate.YES : WorkOrderNoteIsPrivate.NO
      };

      // Call the API to create the note
      const response = await createWorkOrderNote(notePayload);

      if (response.error) {
        console.error('Error creating note:', response.error.message);
        toastStore.add({ message: `Error creating note: ${response.error.message}`, type: 'error' });
        return;
      }

      // If successful, call the callback with the new note
      if (response.data && response.data.length > 0) {
        const newNote = response.data[0];
        if (onNoteAdded) {
          onNoteAdded(newNote);
        }
        
        // Show success message
        toastStore.add({ message: 'Note added successfully', type: 'success' });
        
        // Clear the form
        newNoteText = '';
        newNoteType = WorkOrderNoteType.MEMO;
        newNoteIsPrivate = false;
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toastStore.add({ message: `Error adding note: ${error.message || 'Unknown error'}`, type: 'error' });
    }
  }

  function handleCancel() {
    if (onClose) {
      onClose();
    }
  }
</script>

<div class="add-note-form">
  <div class="mb-3">
    <label for="note-type" class="form-label">Note Type</label>
    <select
      id="note-type"
      class="form-select"
      bind:value={newNoteType}
      disabled={disabled}
    >
      <option value={WorkOrderNoteType.PROBLEM}>Problem</option>
      <option value={WorkOrderNoteType.SOLUTION}>Solution</option>
      <option value={WorkOrderNoteType.MEMO}>Memo</option>
    </select>
  </div>

  <div class="mb-3">
    <label for="note-text" class="form-label">Note Text</label>
    <textarea
      id="note-text"
      class="form-control"
      rows="3"
      bind:value={newNoteText}
      placeholder="Enter note content..."
      disabled={disabled}
    ></textarea>
  </div>

  <div class="mb-3 form-check">
    <input
      type="checkbox"
      id="note-private"
      class="form-check-input"
      bind:checked={newNoteIsPrivate}
      disabled={disabled}
    />
    <label class="form-check-label" for="note-private">
      Private Note
    </label>
  </div>

  <div class="d-flex justify-content-end gap-2">
    <button
      type="button"
      class="btn btn-secondary"
      onclick={handleCancel}
      disabled={disabled}
      title="Cancel"
    >
      Cancel
    </button>
    <button
      type="button"
      class="btn btn-primary"
      onclick={handleAddNote}
      disabled={disabled || !newNoteText.trim()}
      title="Add Note"
    >
      <i class="bi bi-plus-circle me-1"></i>
      Add Note
    </button>
  </div>
</div>