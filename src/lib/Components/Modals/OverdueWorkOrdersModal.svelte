<script lang="ts">
  import { rfState } from '../../rf.svelte';
  import { type WorkOrder } from '../../api/endpoints/workorders';
  import { getStatusString } from './workOrderUtils';

  let {
    overdueWorkOrders = [],
    onClose = null,
    onWorkOrderSelect = null
  } = $props<{
    overdueWorkOrders?: WorkOrder[];
    onClose?: () => void;
    onWorkOrderSelect?: (workOrder: WorkOrder) => void;
  }>();

  // Get status badge class
  function getStatusClass(status: string): string {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === 'new') return 'bg-primary';
    if (normalizedStatus === 'diagnosing') return 'bg-warning';
    if (normalizedStatus === 'in-progress') return 'bg-info';
    if (normalizedStatus === 'awaiting-parts') return 'bg-secondary';
    if (normalizedStatus === 'awaiting-approval') return 'bg-success';
    if (normalizedStatus === 'testing') return 'bg-light';
    if (normalizedStatus === 'finished') return 'bg-dark';
    return 'bg-secondary';
  }

  // Get priority badge class
  function getPriorityClass(priority: string): string {
    const normalizedPriority = priority?.toLowerCase();
    if (normalizedPriority === 'high') return 'bg-info';
    if (normalizedPriority === 'normal') return 'bg-secondary';
    if (normalizedPriority === 'low') return 'bg-success';
    return 'bg-warning';
  }

  // Format date
  function formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  // Handle clicking on a work order
  function handleWorkOrderClick(workOrder: WorkOrder) {
    onWorkOrderSelect?.(workOrder);
  }
</script>

<div class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); z-index: 1050; display: flex; align-items: center; justify-content: center;">
  <div class="modal-dialog modal-lg" style="max-width: 900px;">
    <div class="modal-content bg-dark border border-secondary">
      <div class="modal-header border-bottom border-secondary">
        <h5 class="modal-title">
          <i class="bi bi-exclamation-triangle text-danger me-2"></i>
          Overdue Work Orders ({overdueWorkOrders.length})
        </h5>
        <button
          type="button"
          class="btn-close btn-close-white"
          onclick={onClose}
          title="Close"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body p-0">
        {#if overdueWorkOrders && overdueWorkOrders.length > 0}
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>WO #</th>
                  <th>Customer</th>
                  <th>Equipment</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                </tr>
              </thead>
              <tbody>
                {#each overdueWorkOrders as workOrder}
                  <tr style="cursor: pointer;" onclick={() => handleWorkOrderClick(workOrder)}>
                    <td>
                      <button
                        class="btn btn-link text-primary p-0 border-0 align-baseline"
                        title="View work order details"
                      >
                        {workOrder.wo_text || `#WO-${workOrder.workorder_id || 'N/A'}`}
                      </button>
                    </td>
                    <td>{workOrder.contact_name || 'N/A'}</td>
                    <td>{workOrder.brand_name} {workOrder.model_name}</td>
                    <td>
                      <span class="badge" class:bg-primary={workOrder.status === 'new'} class:bg-warning={workOrder.status === 'diagnosing'} class:bg-info={workOrder.status === 'in-progress'} class:bg-secondary={workOrder.status === 'awaiting-parts'} class:bg-success={workOrder.status === 'awaiting-approval'} class:bg-light={workOrder.status === 'testing'} class:bg-dark={workOrder.status === 'finished'}>
                        {workOrder.status || getStatusString(workOrder.status) || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span class="badge" class:bg-info={workOrder.priority === 'high'} class:bg-secondary={workOrder.priority === 'normal'} class:bg-success={workOrder.priority === 'low'} class:bg-warning={!(workOrder.priority === 'high' || workOrder.priority === 'normal' || workOrder.priority === 'low')}>
                        {workOrder.priority || 'Normal'}
                      </span>
                    </td>
                    <td class="{new Date(workOrder.end_dt) < new Date() ? 'text-danger fw-bold' : ''}">
                      {formatDate(workOrder.end_dt)}
                    </td>
                    <td>
                      {#if workOrder.end_dt}
                        {@const daysOverdue = Math.floor((new Date().getTime() - new Date(workOrder.end_dt).getTime()) / (1000 * 60 * 60 * 24))}
                        <span class="text-danger fw-bold">{daysOverdue} days</span>
                      {:else}
                        N/A
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <div class="text-center text-muted py-5">
            <i class="bi bi-check-circle fs-1 text-success"></i>
            <p class="mt-3">No overdue work orders!</p>
          </div>
        {/if}
      </div>
      <div class="modal-footer border-top border-secondary">
        <button type="button" class="btn btn-secondary" onclick={onClose}>
          <i class="bi bi-x-circle me-1"></i>
          Close
        </button>
      </div>
    </div>
  </div>
</div>
