<!-- WorkOrderForm.svelte -->
<script>
  let { contact, workOrderDetails, onDescriptionChange, onPriorityChange, onNotesChange } = $props();
</script>

<div class="mb-3">
  <label for="work-order-description" class="form-label">Work Requested / Problems</label>
  <textarea
    id="work-order-description"
    class="form-control"
    value={workOrderDetails.description}
    oninput={(e) => onDescriptionChange(e.target.value)}
    rows="3"
    placeholder="Describe the work requested or problems..."
  ></textarea>
  {#if workOrderDetails.description}
    <div class="mt-2">
      <strong>Preview:</strong>
      <ul class="list-unstyled">
        {#each workOrderDetails.description.split('\n') as descLine}
          {#if descLine.trim() !== ''}
            <li class="mb-1"><i class="bi bi-circle-fill text-muted me-2" style="font-size: 0.4rem;"></i> {descLine}</li>
          {/if}
        {/each}
      </ul>
    </div>
  {/if}
</div>

<div class="row">
  <div class="col-md-6 mb-3">
    <label for="work-order-priority" class="form-label">Priority</label>
    <select
      id="work-order-priority"
      class="form-select"
      value={workOrderDetails.priority}
      onchange={(e) => onPriorityChange(e.target.value)}
    >
      <option value="low">Low</option>
      <option value="normal">Normal</option>
      <option value="high">High</option>
      <option value="urgent">Urgent</option>
    </select>
  </div>
  <div class="col-md-6 mb-3">
    <label for="work-order-notes" class="form-label">Notes</label>
    <textarea
      id="work-order-notes"
      class="form-control"
      value={workOrderDetails.notes}
      oninput={(e) => onNotesChange(e.target.value)}
      rows="4"
      placeholder="Add notes (each line will be displayed as a bullet point)..."
    ></textarea>
    {#if workOrderDetails.notes}
      <div class="mt-2">
        <strong>Preview:</strong>
        <ul class="list-unstyled">
          {#each workOrderDetails.notes.split('\n') as noteLine}
            {#if noteLine.trim() !== ''}
              <li class="mb-1"><i class="bi bi-circle-fill text-muted me-2" style="font-size: 0.4rem;"></i> {noteLine}</li>
            {/if}
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</div>