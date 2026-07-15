<script lang="ts">
  import { onMount } from 'svelte';
  import { getStatusClass, getStatusString } from '../Modals/workOrderUtils';
  import NewWorkOrder from '../Modals/NewWorkOrder.svelte';
  import ActionIcon2 from '../UI/ActionIcon2.svelte';
  import ActionBtn from '../UI/ActionBtn.svelte';
  import { getWorkOrders, deleteWorkOrder as apiDeleteWorkOrder } from '../../api/endpoints/workorders';

  // Define status classes mapping
  const statusClasses = {
    1: 'bi-plus-circle status-1', // status 1
    2: 'bi-search status-2',      // status 2
    3: 'bi-tools status-3',       // status 3
    4: 'bi-box status-4',         // status 4
    5: 'bi-clock status-5',       // status 5
    6: 'bi-check-circle status-6', // status 6
    7: 'bi-check-square status-7', // status 7
    'new': 'bi-plus-circle status-1', // status 'new'
    'diagnosing': 'bi-search status-2', // status 'diagnosing'
    'in-progress': 'bi-tools status-3', // status 'in-progress'
    'awaiting-parts': 'bi-box status-4', // status 'awaiting-parts'
    'awaiting-approval': 'bi-clock status-5', // status 'awaiting-approval'
    'testing': 'bi-check-circle status-6', // status 'testing'
    'finished': 'bi-check-square status-7' // status 'finished'
  };

  // Props
  let { workOrders = [], onShowContextMenu = null, onWorkOrderSelect = null, statuses = [] } = $props();

  // State variables
  let state = $state({
    isLoading: false,
    error: null as string | null,
    editingId: null as number | null,
    editingWorkOrder: null as any | null, // Would be WorkOrder type in real implementation
    searchQuery: '',
    sortBy: 'workorder_id', // Changed to a field that definitely exists
    sortOrder: 'desc', // 'asc' or 'desc'
    showAddForm: false,
  });

  // Local filtered work orders to avoid modifying global state
  let filteredWorkOrders = $state([]);

  // Update filtered work orders when workOrders prop changes
  $effect(() => {
    let localWorkOrders = [...workOrders]; // Create a copy to avoid modifying the original

    // Apply sorting (without filtering)
    localWorkOrders.sort((a, b) => {
      const aVal = a[state.sortBy] ?? '';
      const bVal = b[state.sortBy] ?? '';

      if (aVal < bVal) return state.sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return state.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    filteredWorkOrders = localWorkOrders;
  });

  // Fallback function to get contact name by ID if not available in work order
  function getContactName(contactId: number | null | undefined): string {
    if (!contactId) return `Contact #${contactId}`;
    return `Contact #${contactId}`;
  }

  // Delete work order
  async function deleteWorkOrder(id: number) {
    if (!confirm('Are you sure you want to delete this work order?')) return;

    try {
      state.isLoading = true;
      const response = await apiDeleteWorkOrder(id);
      if (response.error && response.error.message && response.error.message.trim() !== '') {
        state.error = response.error.message;
      }
      // Work order will be automatically removed from rfState.workOrders via WebSocket
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to delete work order';
      console.error('Error deleting work order:', err);
    } finally {
      state.isLoading = false;
    }
  }

  // Sort work orders - now handled by derived state
  function sortWorkOrders(field: string) {
    if (state.sortBy === field) {
      state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortBy = field;
      state.sortOrder = 'asc';
    }
    // The sorting is now handled by the derived state calculation
    // when state.sortBy or state.sortOrder changes
  }

  // Load work orders - now handled by parent component
  function loadWorkOrders() {
    // This function is kept for compatibility but work orders are now passed as props
    console.log('Work orders are now loaded by parent component and passed as props');
  }

  // Check if work order is a return work order
  function isReturnWorkOrder(workOrder: any): boolean {
    return workOrder.parent_id !== null && workOrder.parent_id !== undefined;
  }
</script>



  {#if state.error}
    <div class="alert alert-danger" role="alert">
      {state.error}
      <button type="button" class="btn-close" onclick={() => state.error = null} title="Close"></button>
    </div>
  {/if}

  <!-- Work Orders Table -->
  <div class="card bg-dark text-light">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Work Orders ({filteredWorkOrders.length})</h5>
      <div>
        <button class="btn btn-sm btn-outline-light me-2" onclick={loadWorkOrders} title="Refresh Work Orders">
          <i class="bi bi-arrow-repeat"></i>
        </button>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table  table-hover mb-0">
        <thead>
          <tr>
            <th>
              <button class="btn text-light p-0" onclick={() => sortWorkOrders('wo_text')} title="Sort by Description">
                Description {#if state.sortBy === 'wo_text'}{state.sortOrder === 'asc' ? '↑' : '↓'}{/if}
              </button>
            </th>
            <th>Contact</th>
            <th>Asset</th>
            <th>
              <button class="btn text-light p-0" onclick={() => sortWorkOrders('status')} title="Sort by Status">
                Status {#if state.sortBy === 'status'}{state.sortOrder === 'asc' ? '↑' : '↓'}{/if}
              </button>
            </th>
            <th>
              <button class="btn text-light p-0" onclick={() => sortWorkOrders('priority')} title="Sort by Priority">
                Priority {#if state.sortBy === 'priority'}{state.sortOrder === 'asc' ? '↑' : '↓'}{/if}
              </button>
            </th>
            <th>
              <button class="btn text-light p-0" onclick={() => sortWorkOrders('begin_dt')} title="Sort by Start Date">
                Start Date {#if state.sortBy === 'begin_dt'}{state.sortOrder === 'asc' ? '↑' : '↓'}{/if}
              </button>
            </th>
            <th>Return</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#if filteredWorkOrders && filteredWorkOrders.length > 0}
            {#each filteredWorkOrders as workOrder}
              <tr oncontextmenu={(e) => {
                e.preventDefault();
                if (onShowContextMenu) {
                  // Position the context menu at the right-click location
                  const menuData = {
                    x: e.clientX,
                    y: e.clientY,
                    wo: workOrder
                  };
                  onShowContextMenu(menuData);
                }
              }}>
                <td>
                  <button class="btn btn-link p-0 border-0 align-baseline priority-{workOrder.workorder_priority || 'normal'}"
                    onclick={() => { if (onWorkOrderSelect) onWorkOrderSelect(workOrder); }}
                    title="View Work Order Details"
                  >
                    {workOrder.wo_text}
                    {#if isReturnWorkOrder(workOrder)}
                      <i class="bi bi-arrow-return-left ms-1 text-warning" title="Return Work Order"></i>
                    {/if}
                  </button>
                </td>
                <td>{workOrder.contact_name || getContactName(workOrder.contact_id)}</td>
                <td>
                  {#if workOrder.brand_name || workOrder.model_name}
                    {workOrder.brand_name || 'Unknown Brand'} {workOrder.model_name || 'Unknown Model'}
                    {#if workOrder.model_serial} ({workOrder.model_serial}){/if}
                  {:else}
                    Asset #{workOrder.asset_id || 'N/A'}
                  {/if}
                </td>
                <td>
                  <i
                    class="bi status-icon status-{workOrder.status || 'bi-circle status-1'}"
                    title={getStatusString(workOrder.status)}
                  ></i>
                </td>
                <td>
                  <span class="badge priority-{workOrder.workorder_priority || 'normal'}">
                    {workOrder.workorder_priority === 'low' ? 'Low' :
                     workOrder.workorder_priority === 'normal' ? 'Normal' :
                     workOrder.workorder_priority === 'high' ? 'High' :
                     workOrder.workorder_priority === 'urgent' ? 'Urgent' :
                     'Normal'}
                  </span>
                </td>
                <td>{workOrder.begin_dt ? new Date(workOrder.begin_dt).toLocaleDateString() : '-'}</td>
                <td>
                  {#if isReturnWorkOrder(workOrder)}
                    <span class="badge bg-warning">Return</span>
                  {:else}
                    <span class="text-muted">-</span>
                  {/if}
                </td>
                <td>
                  <ActionBtn
                    icon="pencil"
                    title="Edit Work Order"
                    variant="outline-primary"
                    size="sm"
                    onClick={() => { if (onWorkOrderSelect) onWorkOrderSelect(workOrder); }}
                  />
                  <ActionBtn
                    icon="trash"
                    title="Delete Work Order"
                    variant="outline-danger"
                    size="sm"
                    onClick={() => deleteWorkOrder(workOrder.workorder_id)}
                  />
                </td>
              </tr>
            {/each}
          {:else}
            <tr>
              <td colspan="9" class="text-center text-muted py-4">
                No work orders found
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  {#if state.showAddForm}
    <!-- New Work Order Modal -->
    <div class="modal-backdrop fade show" style="z-index: 1050;"></div>
    <div class="modal fade show d-block" style="z-index: 1051;" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-clipboard-plus me-2"></i>
              New Work Order
            </h5>
            <button type="button" class="btn-close" onclick={() => state.showAddForm = false} title="Close"></button>
          </div>
          <div class="modal-body">
            <NewWorkOrder  />
          </div>
        </div>
      </div>
    </div>
  {/if}
