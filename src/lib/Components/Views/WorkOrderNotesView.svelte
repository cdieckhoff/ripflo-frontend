<script lang="ts">
  import { rfState } from '../../rf.svelte';
  import { createWorkOrderNote, type CreateWorkOrderNoteRequest } from '../../api/endpoints/workorder-related';
  import { WorkOrderNoteType, WorkOrderNoteIsPrivate } from '../../types/consolidated-enums';
  import { toastStore } from '../../stores/toastStore';

  let { workOrder, disabled = false } = $props<{
    workOrder?: any; // WorkOrder object
    disabled?: boolean;
  }>();

  let showAddNoteForm = $state(false);
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

      // If successful, add the new note to the work order
      if (response.data && response.data.length > 0) {
        const newNote = response.data[0];
        
        // Add the new note to the work order's notes array
        if (!workOrder.notes) {
          workOrder.notes = [];
        }
        workOrder.notes = [newNote, ...workOrder.notes];
        
        // Show success message
        toastStore.add({ message: 'Note added successfully', type: 'success' });
        
        // Clear the form
        newNoteText = '';
        newNoteType = WorkOrderNoteType.MEMO;
        newNoteIsPrivate = false;
        
        // Hide the form after successful submission
        showAddNoteForm = false;
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toastStore.add({ message: `Error adding note: ${error.message || 'Unknown error'}`, type: 'error' });
    }
  }

  function toggleAddNoteForm() {
    showAddNoteForm = !showAddNoteForm;
  }

  function handleCancel() {
    showAddNoteForm = false;
    // Clear the form
    newNoteText = '';
    newNoteType = WorkOrderNoteType.MEMO;
    newNoteIsPrivate = false;
  }

  // Get other note types that aren't problem, solution, or memo
  let otherNotes = $derived(
    workOrder?.notes 
      ? workOrder.notes.filter(n => !['problem', 'solution', 'memo'].includes(n.type))
      : []
  );
</script>

<div class="work-order-notes card">
  <div class="card-header d-flex justify-content-between align-items-center">
    <h5 class="card-title mb-0">
      <i class="bi bi-sticky me-2"></i>
      Notes
    </h5>
    <button
      type="button"
      class="btn btn-sm btn-outline-primary"
      onclick={toggleAddNoteForm}
      disabled={disabled}
      title="Add Note"
    >
      <i class="bi bi-plus-circle me-1"></i>
      Add Note
    </button>
  </div>
  <div class="card-body">
    {#if workOrder?.notes && workOrder.notes.length > 0}
      <!-- Sort notes by type: problem, solution, memo -->
      {#each ['problem', 'solution', 'memo'] as noteType}
        {#if workOrder.notes.filter(n => n.type === noteType).length > 0}
          <div class="note-type-section mb-3">
            <h6 class="note-type-header">
              <span class="badge bg-{noteType === 'problem' ? 'danger' : noteType === 'solution' ? 'success' : 'info'}">
                {noteType.charAt(0).toUpperCase() + noteType.slice(1)}
              </span>
            </h6>
            <ul class="list-unstyled">
              {#each workOrder.notes.filter(n => n.type === noteType) as note}
                <li class="note-item">
                  <div class="d-flex justify-content-between">
                    <div class="note-content">
                      <span class="bullet-point">•</span> {note.text}
                      {#if note.is_private}
                        <span class="badge bg-warning ms-2">Private</span>
                      {/if}
                    </div>
                    <small class="text-muted">{note.created_at}</small>
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      {/each}
      
      <!-- Show any other note types that aren't problem, solution, or memo -->
      {#if otherNotes.length > 0}
        <div class="note-type-section mb-3">
          <h6 class="note-type-header">
            <span class="badge bg-secondary">Other</span>
          </h6>
          <ul class="list-unstyled">
            {#each otherNotes as note}
              <li class="note-item">
                <div class="d-flex justify-content-between">
                  <div class="note-content">
                    <span class="bullet-point">•</span> {note.text}
                    {#if note.is_private}
                      <span class="badge bg-warning ms-2">Private</span>
                    {/if}
                  </div>
                  <small class="text-muted">{note.created_at}</small>
                </div>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    {:else}
      <p class="text-muted mb-0">No notes available for this work order.</p>
    {/if}

    {#if showAddNoteForm}
      <div class="add-note-form mt-3 pt-3 border-top">
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
    {/if}
  </div>
</div>