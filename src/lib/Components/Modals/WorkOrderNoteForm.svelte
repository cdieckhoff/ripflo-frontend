<script>

  // Props
  let { note = null } = $props(); // Can be CreateWorkOrderNoteRequest or WorkOrderNote
  let { disabled = false } = $props();
  let { hideLabels = false } = $props();

  // Local state
  let noteText = $state(note?.note_text || '');
  let noteType = $state(note?.note_type || 'General');
  let isPrivate = $state(note?.is_private || false);
  let createdAt = $state(note?.created_at || new Date().toISOString());

  // Expose note data to parent
  $bindable(noteText);
  $bindable(noteType);
  $bindable(isPrivate);
  $bindable(createdAt);

  // Method to get complete note object
  function getNoteObject() {
    return {
      note_text: noteText,
      note_type: noteType,
      is_private: isPrivate,
      created_at: createdAt
    };
  }

  // Export method for parent components
  export { getNoteObject };
</script>

<div class="work-order-note-form">
  <div class="note-text">
    {#if !hideLabels}<label for="note-text">Note</label>{/if}
    <textarea
      id="note-text"
      placeholder="Enter note details..."
      value={noteText}
      oninput={(e) => noteText = e.target.value}
      disabled={disabled}
      rows="4"
    ></textarea>
  </div>

  <div class="note-type">
    {#if !hideLabels}<label for="note-type">Note Type</label>{/if}
    <select
      id="note-type"
      value={noteType}
      onchange={(e) => noteType = e.target.value}
      disabled={disabled}
    >
      <option value="General">General</option>
      <option value="Internal">Internal</option>
      <option value="Customer">Customer</option>
      <option value="Technical">Technical</option>
      <option value="Safety">Safety</option>
    </select>
  </div>

  <div class="private-checkbox">
    <label for="private-note">
      <input
        id="private-note"
        type="checkbox"
        checked={isPrivate}
        onchange={(e) => isPrivate = e.target.checked}
        disabled={disabled}
      />
      Private Note
    </label>
  </div>
</div>