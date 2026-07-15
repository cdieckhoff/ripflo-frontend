<script lang="ts">
  import WorkOrderCard from '../DataDisplay/WorkOrderCard.svelte';
  import { type WorkOrder } from '../../api/endpoints/workorders';
  import { Priority } from '../../types/consolidated-enums';

  let { workOrders = [], onShowContextMenu = null, onWorkOrderSelect = null, onStatusChange = null, statuses = [] } = $props();

  // Define priority categories
  const priorityCategories = [
    { id: Priority.URGENT, label: 'Urgent', color: 'danger' },
    { id: Priority.HIGH, label: 'High', color: 'warning' },
    { id: Priority.NORMAL, label: 'Normal', color: 'primary' },
    { id: Priority.LOW, label: 'Low', color: 'success' }
  ];

  let expandedPriorities = $state<Record<string, boolean>>({
    [Priority.URGENT]: true,
    [Priority.HIGH]: true,
    [Priority.NORMAL]: true,
    [Priority.LOW]: true,
    unassigned: true
  });

  // Check if work order is a return work order
  function isReturnWorkOrder(workOrder: any): boolean {
    return workOrder.parent_id !== null && workOrder.parent_id !== undefined;
  }
</script>

  {#if true}
    {@const filteredWorkOrders = workOrders.reduce((acc, wo) => {
      if (wo.workorder_priority && wo.workorder_priority.trim() !== '') {
        if (!acc.withPriority) acc.withPriority = [];
        acc.withPriority.push(wo);
      } else {
        if (!acc.withoutPriority) acc.withoutPriority = [];
        acc.withoutPriority.push(wo);
      }
      return acc;
    }, {})}

    {#each priorityCategories as priority}
      {@const filtered = (filteredWorkOrders.withPriority || []).filter(wo => wo.workorder_priority === priority.id)}
      <div class="card mb-3">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="card-header bg-{priority.color} text-white d-flex justify-content-between align-items-center" onclick={() => expandedPriorities[priority.id] = !expandedPriorities[priority.id]}>
          <h6 class="m-0 small fw-bold text-capitalize">{priority.label} ({filtered.length}) [Priority: {priority.id}]</h6>
          <i class="bi {expandedPriorities[priority.id] ? 'bi-chevron-up' : 'bi-chevron-down'}"></i>
        </div>

        {#if expandedPriorities[priority.id]}
          <div class="card-body">
            {#if filtered.length > 0}
              {#each filtered as workOrder (workOrder.workorder_id)}
                <WorkOrderCard
                  {workOrder}
                  onClick={(wo:WorkOrder) => {if (onWorkOrderSelect) onWorkOrderSelect(wo);}}
                  onShowContextMenu={(e) => {onShowContextMenu(e);}}
                  onStatusChange={(newStatusId, workOrderId) => {if (onStatusChange) onStatusChange(newStatusId, workOrderId);}}
                  />
              {/each}
            {:else}
              <p class="text-muted text-center mb-0">No work orders</p>
            {/if}
          </div>
        {/if}
      </div>
    {/each}

    <!-- Show work orders without priority in a separate section -->
    {#if filteredWorkOrders.withoutPriority && filteredWorkOrders.withoutPriority.length > 0}
      <div class="card mb-3">
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="card-header bg-secondary text-white d-flex justify-content-between align-items-center" onclick={() => expandedPriorities['unassigned'] = !expandedPriorities['unassigned']}>
          <h6 class="m-0 small fw-bold text-capitalize">Unassigned ({filteredWorkOrders.withoutPriority.length})</h6>
          <i class="bi {expandedPriorities['unassigned'] ? 'bi-chevron-up' : 'bi-chevron-down'}"></i>
        </div>

        {#if expandedPriorities['unassigned']}
          <div class="card-body">
            {#each filteredWorkOrders.withoutPriority as workOrder (workOrder.workorder_id)}
              <WorkOrderCard
                {workOrder}
                onClick={(wo:WorkOrder) => {if (onWorkOrderSelect) onWorkOrderSelect(wo);}}
                onShowContextMenu={(e) => {onShowContextMenu(e);}}
                onStatusChange={(newStatusId, workOrderId) => {if (onStatusChange) onStatusChange(newStatusId, workOrderId);}}
                />
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {/if}