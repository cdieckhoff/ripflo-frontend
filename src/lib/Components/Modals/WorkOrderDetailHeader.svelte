<script lang="ts">
  import { deleteWorkOrder } from '../../api/endpoints/workorders';
  import { toastStore } from '../../stores/toastStore';
  import ActionBtn from  '../UI/ActionBtn.svelte';

  // Props
  let { workOrder = null, disabled = false } = $props();

  // Local state
  let showActions = $state(true);

  // Functions for the action buttons
  function handleEdit() {
    // Implement edit functionality
    console.log('Edit work order:', workOrder);
  }

  function handleSave() {
    // Save functionality is handled in the parent component
    console.log('Save work order:', workOrder);
    toastStore.add({ message: 'Work order saved successfully', type: 'success' });
  }

  async function handleDelete() {
    if (!workOrder?.workorder_id) return;

    if (confirm('Are you sure you want to delete this work order?')) {
      try {
        const response = await deleteWorkOrder(workOrder.workorder_id);
        if (!response.error) {
          toastStore.add({ message: 'Work order deleted successfully', type: 'success' });
          // Navigate back to work orders list
          // This would be handled by parent component
        } else {
          toastStore.add({ message: `Error deleting work order: ${response.error.message}`, type: 'error' });
        }
      } catch (error) {
        toastStore.add({ message: `Error deleting work order: ${error.message}`, type: 'error' });
      }
    }
  }
</script>

<div class="work-order-detail-header">
  <div class="header-content">
    <div class="work-order-info">
      {#if workOrder}
        <div class="d-flex align-items-center">
          <!-- svelte-ignore element_invalid_self_closing_tag -->
          <i
            class="{workOrder.status}"
            title="{workOrder.status}"
          />
          <h6 class="mb-0 me-2">Work Order: {workOrder.wo_text || `WO-${workOrder.workorder_id}`}</h6>
          <span class="priority-tag">{workOrder.priority || 'Normal'}</span>
        </div>
      {/if}
    </div>

    {#if showActions}
      <div class="header-actions">
        <ActionBtn
          icon="pencil"
          title="Edit Work Order"
          variant="outline-primary"
          size="sm"
          onClick={handleEdit}
          disabled={disabled}
        />
        <ActionBtn
          icon="save"
          title="Save Work Order"
          variant="outline-success"
          size="sm"
          onClick={handleSave}
          disabled={disabled}
        />
        <ActionBtn
          icon="trash"
          title="Delete Work Order"
          variant="outline-danger"
          size="sm"
          onClick={handleDelete}
          disabled={disabled}
        />
      </div>
    {/if}
  </div>
</div>