<script lang="ts">
  import {  type WorkOrder } from '../../ripflo';
  import {rfState } from '../../rf.svelte'
  import { getStatusClass, getStatusString } from '../Modals/workOrderUtils';
  import { getWorkOrders } from '../../api/endpoints/workorders';
  import { onMount } from 'svelte';

  let { onWorkOrderSelect } = $props<{ onWorkOrderSelect?: (workOrder: WorkOrder) => void }>();
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  // Function to determine the badge class based on priority
  function getPriorityClass(priority: string) {
    const normalizedPriority = priority?.toLowerCase();
    if (normalizedPriority === 'high') {
      return 'bg-info';
    } else if (normalizedPriority === 'normal') {
      return 'bg-secondary';
    } else if (normalizedPriority === 'low') {
      return 'bg-success';
    } else {
      return 'bg-warning';
    }
  }

  // Load work orders if not already loaded
  onMount(async () => {
    if (!rfState.workOrders || rfState.workOrders.length === 0) {
      isLoading = true;
      error = null;
      try {
        const response = await getWorkOrders();
        if (!response.error) {
          rfState.workOrders = response.data || [];
        } else {
          throw new Error(response.error?.message || 'Failed to load work orders');
        }
      } catch (err) {
        error = err instanceof Error ? err.message : 'Failed to load work orders';
        console.error('Error loading work orders in RecentWorkOrders:', err);
      } finally {
        isLoading = false;
      }
    }
  });

  // Reactive variable to store recent work orders
  let recentWorkOrders = $state<WorkOrder[]>([]);

  // State to track whether to show all work orders or only open ones
  let showAllWorkOrders = $state(false);

  // Function to toggle showing all work orders
  function toggleWorkOrderVisibility() {
    showAllWorkOrders = !showAllWorkOrders;
  }

  // Reactive statement to update recentWorkOrders when rfState.workOrders changes
  $effect(() => {
    if (!rfState.workOrders || rfState.workOrders.length === 0) {
      recentWorkOrders = [];
      return;
    }

    // Filter work orders assigned to the current user
    let userWorkOrders = [];
    if (rfState.currentUser) {
      // Assuming work orders have an assigned_tech_id or similar field
      userWorkOrders = rfState.workOrders.filter(wo =>
        wo.assigned_tech_id === rfState.currentUser.id ||
        wo.assigned_tech === rfState.currentUser.id ||
        wo.tech_id === rfState.currentUser.id ||
        wo.assigned_to === rfState.currentUser.username
      );
    }

    // Determine which work orders to use based on the toggle
    let workOrdersToUse = userWorkOrders.length > 0 ? userWorkOrders : rfState.workOrders;

    // Apply the open work orders filter if showAllWorkOrders is false
    if (!showAllWorkOrders) {
      workOrdersToUse = workOrdersToUse.filter(wo =>
        wo.status &&
        wo.status.toLowerCase() !== 'done' &&
        wo.status.toLowerCase() !== 'cancel' &&
        wo.status.toLowerCase() !== 'paid'
      );
    }

    // Sort by creation date or priority (newest first), assuming there's a created_dt field
    recentWorkOrders = workOrdersToUse
      .sort((a, b) => {
        // Try different possible date fields for sorting
        const dateA = new Date(a.created_dt || a.date_created || a.created_at || a.start_dt || '1970-01-01');
        const dateB = new Date(b.created_dt || b.date_created || b.created_at || b.start_dt || '1970-01-01');
        return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
      })
      .slice(0, 5); // Take only the 5 most recent
  });
</script>

<div class="card bg-dark text-light" role="region" aria-labelledby="recent-work-orders">
  <div class="card-header d-flex justify-content-between align-items-center">
    <h5 id="recent-work-orders" class="mb-0">Recent Work Orders</h5>
    <button 
      class="btn btn-sm btn-outline-primary" 
      onclick={toggleWorkOrderVisibility}
      title={showAllWorkOrders ? "Hide Closed Work Orders" : "Show All Work Orders"}
    >
      {#if showAllWorkOrders}
        <i class="bi bi-eye-slash me-1"></i> Hide Closed
      {:else}
        <i class="bi bi-eye me-1"></i> Show All
      {/if}
    </button>
  </div>
  <div class="card-body">
    <div class="table-responsive">
      <table class="table " aria-label="Recent work orders table">
        <thead>
          <tr>
            <th scope="col">WO #</th>
            <th scope="col">Customer</th>
            <th scope="col">Equipment</th>
            <th scope="col">Status</th>
            <th scope="col">Priority</th>
            <th scope="col">Due Date</th>
          </tr>
        </thead>
        <tbody>
          {#if recentWorkOrders && recentWorkOrders.length > 0}
            {#each recentWorkOrders as workOrder}
              <tr>
                <td><button class="btn btn-link text-primary p-0 border-0 align-baseline" onclick={() => onWorkOrderSelect?.(workOrder)} title="View work order details">{workOrder.wo_text || `#WO-${workOrder.workorder_id || 'N/A'}`}</button></td>
                <td>{workOrder.contact_name || 'N/A'}</td>
                <td>{workOrder.brand_name} {workOrder.model_name}</td>
                <td>
                  <span class="badge" class:bg-primary={workOrder.status === 1 || workOrder.status_name === 'new'} class:bg-warning={workOrder.status === 2 || workOrder.status_name === 'diagnosing'} class:bg-info={workOrder.status === 3 || workOrder.status_name === 'in-progress'} class:bg-secondary={workOrder.status === 4 || workOrder.status_name === 'awaiting-parts'} class:bg-success={workOrder.status === 5 || workOrder.status_name === 'awaiting-approval'} class:bg-light={workOrder.status === 6 || workOrder.status_name === 'testing'} class:bg-dark={workOrder.status === 7 || workOrder.status_name === 'finished'}>
                    {workOrder.status_name || getStatusString(workOrder.status) || 'Unknown'}
                  </span>
                </td>
                <td>
                  <span class="badge" class:bg-info={workOrder.priority === 'High' || workOrder.priority === 'high'} class:bg-secondary={workOrder.priority === 'Normal' || workOrder.priority === 'normal'} class:bg-success={workOrder.priority === 'Low' || workOrder.priority === 'low'} class:bg-warning={!(workOrder.priority === 'High' || workOrder.priority === 'high' || workOrder.priority === 'Normal' || workOrder.priority === 'normal' || workOrder.priority === 'Low' || workOrder.priority === 'low')}>{workOrder.priority || 'Normal'}</span>
                </td>
                <td>{workOrder.end_dt ? new Date(workOrder.end_dt).toLocaleDateString() : 'N/A'}</td>
              </tr>
            {/each}
          {:else}
            <tr>
              <td colspan="6" class="text-center text-muted">No work orders found</td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>