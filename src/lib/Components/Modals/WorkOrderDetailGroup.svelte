<script>
  import WorkOrderNoteForm from './WorkOrderNoteForm.svelte';
  import WorkOrderTechForm from './WorkOrderTechForm.svelte';
  import WorkOrderItemForm from './WorkOrderItemForm.svelte';

  // Props
  let { workOrder = null } = $props(); // Full work order object
  let { disabled = false } = $props();

  // Local state for notes, techs, and items
  let notes = $state(workOrder?.notes || [{}]);
  let techs = $state(workOrder?.technicians || [{}]);
  let items = $state(workOrder?.items || [{}]);

  // Add new note entry
  function addNote() {
    notes = [...notes, {}];
  }

  // Remove note entry
  function removeNote(index) {
    if (notes.length > 1) {
      notes = notes.filter((_, i) => i !== index);
    }
  }

  // Add new tech entry
  function addTech() {
    techs = [...techs, {}];
  }

  // Remove tech entry
  function removeTech(index) {
    if (techs.length > 1) {
      techs = techs.filter((_, i) => i !== index);
    }
  }

  // Add new item entry
  function addItem() {
    items = [...items, {}];
  }

  // Remove item entry
  function removeItem(index) {
    if (items.length > 1) {
      items = items.filter((_, i) => i !== index);
    }
  }

  // Update note at specific index
  function updateNote(index, updatedNote) {
    notes[index] = { ...notes[index], ...updatedNote };
  }

  // Update tech at specific index
  function updateTech(index, updatedTech) {
    techs[index] = { ...techs[index], ...updatedTech };
  }

  // Update item at specific index
  function updateItem(index, updatedItem) {
    items[index] = { ...items[index], ...updatedItem };
  }

  // Get complete work order detail object
  function getWorkOrderDetailObject() {
    return {
      notes: notes.filter(note => note.note_text),
      technicians: techs.filter(tech => tech.user_id),
      items: items.filter(item => item.code || item.description)
    };
  }

  // Export method for parent components
  export { getWorkOrderDetailObject, addNote, addTech, addItem };
</script>

<div class="work-order-detail-group">
  <!-- Notes Section -->
  <div class="notes-section">
    <h3>Notes</h3>
    {#each notes as note, i (i)}
      <div class="note-entry">
        <WorkOrderNoteForm
          note={note}
          disabled={disabled}
          onchange={(e) => updateNote(i, e.detail)}
        />
        {notes.length > 1 && (
          <button 
            type="button" 
            onclick={() => removeNote(i)}
            disabled={disabled}
            title="Remove Note"
          >
            Remove
          </button>
        )}
      </div>
    {/each}
    <button 
      type="button" 
      onclick={addNote}
      disabled={disabled}
      title="Add Another Note"
    >
      Add Note
    </button>
  </div>

  <!-- Technicians Section -->
  <div class="technicians-section">
    <h3>Technicians</h3>
    {#each techs as tech, i (i)}
      <div class="tech-entry">
        <WorkOrderTechForm
          tech={tech}
          disabled={disabled}
          onchange={(e) => updateTech(i, e.detail)}
        />
        {techs.length > 1 && (
          <button 
            type="button" 
            onclick={() => removeTech(i)}
            disabled={disabled}
            title="Remove Technician"
          >
            Remove
          </button>
        )}
      </div>
    {/each}
    <button 
      type="button" 
      onclick={addTech}
      disabled={disabled}
      title="Add Another Technician"
    >
      Add Technician
    </button>
  </div>

  <!-- Items Section -->
  <div class="items-section">
    <h3>Items</h3>
    {#each items as item, i (i)}
      <div class="item-entry">
        <WorkOrderItemForm
          item={item}
          disabled={disabled}
          onchange={(e) => updateItem(i, e.detail)}
        />
        {items.length > 1 && (
          <button 
            type="button" 
            onclick={() => removeItem(i)}
            disabled={disabled}
            title="Remove Item"
          >
            Remove
          </button>
        )}
      </div>
    {/each}
    <button 
      type="button" 
      onclick={addItem}
      disabled={disabled}
      title="Add Another Item"
    >
      Add Item
    </button>
  </div>
</div>