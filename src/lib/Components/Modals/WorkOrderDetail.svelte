<script lang="ts">
  import { onMount } from 'svelte';
  import { rfState } from '$lib/rf.svelte';
  import WorkOrderDetailHeader from './WorkOrderDetailHeader.svelte';
  import ContactDisplay from './Contacts/ContactDisplay.svelte';
  import AssetInformation from './AssetInformation.svelte';
  import WorkOrderCard from '../DataDisplay/WorkOrderCard.svelte';
  import WorkOrderNotesView from '../Views/WorkOrderNotesView.svelte';
  import WorkOrderTechsView from '../Views/WorkOrderTechsView.svelte';
  import { type WorkOrder, updateWorkOrder } from '../../api/endpoints/workorders';
  import { toastStore } from '../../stores/toastStore';
  import Selector from '$ui/Selector.svelte';
  import WorkOrderItemsView from '../Views/WorkOrderItemsView.svelte';

  // Props
  let { workOrder: workOrderProp = null, disabled = false, onClose = null } = $props<{
    workOrder?: WorkOrder | null;
    disabled?: boolean;
    onClose?: () => void;
  }>();

  // Derive workOrder from rfState for reactivity - fall back to prop if not in rfState
  let workOrder = $derived.by(() => {
    if (!workOrderProp?.workorder_id) return workOrderProp;
    const rfWorkOrder = rfState.workOrders.find(wo => wo.workorder_id === workOrderProp.workorder_id);
    return rfWorkOrder || workOrderProp;
  });

  // Date state for editing
  let creationDateValue = $state('');
  let beginDateValue = $state('');
  let endDateValue = $state('');

  // Initialize date values from work order
  onMount(() => {
    if (workOrder) {
      creationDateValue = workOrder.created_at || '';
      beginDateValue = workOrder.begin_dt || '';
      endDateValue = workOrder.end_dt || '';
    }
  });

  // Keep date values in sync when workOrder changes (e.g., from WebSocket updates)
  $effect(() => {
    if (workOrder) {
      creationDateValue = workOrder.created_at || '';
      beginDateValue = workOrder.begin_dt || '';
      endDateValue = workOrder.end_dt || '';
    }
  });

  // Handle status change - mutate workOrder directly (linked to rfState)
  function handleStatusChange(newStatus: string) {
    if (workOrder) {
      workOrder.status = newStatus;
    }
  }

  // Handle priority change - mutate workOrder directly (linked to rfState)
  function handlePriorityChange(newPriority: string) {
    if (workOrder) {
      workOrder.priority = newPriority;
    }
  }

  // Update dates and send to backend
  async function handleUpdateDates() {
    if (!workOrder?.workorder_id) return;

    try {
      // Send the updated date fields to the update endpoint
      const response = await updateWorkOrder(workOrder.workorder_id, {
        created_at: creationDateValue,
        begin_dt: beginDateValue,
        end_dt: endDateValue
      });

      if (!response.error) {
        toastStore.add({ message: 'Dates updated successfully', type: 'success' });
      } else {
        toastStore.add({ message: `Error updating dates: ${response.error.message}`, type: 'error' });
      }
    } catch (error) {
      toastStore.add({ message: `Error updating dates: ${error.message}`, type: 'error' });
    }
  }
</script>

<div class="work-order-detail">
  {#if workOrder}
    <div class="d-flex justify-content-between align-items-center mb-3">
      <WorkOrderDetailHeader workOrder={workOrder} {disabled} />
    </div>

    <div class="detail-sections">
      <!-- Work Order Info Card -->
      <div class="row mb-3">
        <div class="col-12">
          <h6>Work Order Info</h6>
          <WorkOrderCard workOrder={workOrder} />
        </div>
      </div>

      <!-- Date Inputs -->
      <div class="row mb-3">
        <div class="col-12">
          <h6>Dates</h6>
          <div class="row">
            <div class="col-md-4 mb-3">
              <label for="creation-date" class="form-label">Creation Date</label>
              <input
                id="creation-date"
                type="datetime-local"
                class="form-control"
                bind:value={creationDateValue}
              />
            </div>
            <div class="col-md-4 mb-3">
              <label for="begin-date" class="form-label">Begin Date</label>
              <input
                id="begin-date"
                type="datetime-local"
                class="form-control"
                bind:value={beginDateValue}
              />
            </div>
            <div class="col-md-4 mb-3">
              <label for="end-date" class="form-label">End Date</label>
              <input
                id="end-date"
                type="datetime-local"
                class="form-control"
                bind:value={endDateValue}
              />
            </div>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-primary"
            onclick={handleUpdateDates}
          >
            <i class="bi bi-check-circle me-1"></i>
            Update Dates
          </button>
        </div>
      </div>

      <!-- Status and Priority -->
      <div class="row mt-3">
        <div class="col-md-6">
          <Selector
            options={rfState.cachedEnums.workOrderStatuses.map(s => ({ 
              id: s.status, 
              name: s.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
            }))}
            preselectedValue={workOrder?.status || 'new'}
            placeholder="Select Status"
            disabled={disabled}
            onSelectionChange={handleStatusChange}
          />
        </div>
        <div class="col-md-6">
          <Selector
            options={[
              { id: 'low', name: 'Low' },
              { id: 'normal', name: 'Normal' },
              { id: 'high', name: 'High' },
              { id: 'urgent', name: 'Urgent' }
            ]}
            preselectedValue={workOrder?.priority || 'normal'}
            placeholder="Select Priority"
            disabled={disabled}
            onSelectionChange={handlePriorityChange}
          />
        </div>
      </div>

      <!-- Work Order Items -->
      <div class="row mt-3">
        <div class="col-12">
          <h6>Work Order Items</h6>
          <WorkOrderItemsView
            workOrder={workOrder}
            disabled={false}
          />
        </div>
      </div>

      <!-- Work Order Notes -->
      <div class="row mt-3">
        <div class="col-12">
          <WorkOrderNotesView
            workOrder={workOrder}
            disabled={disabled}
          />
        </div>
      </div>

      <!-- Assigned Technicians -->
      <div class="row mt-3">
        <div class="col-12">
          <WorkOrderTechsView
            workOrder={workOrder}
            disabled={disabled}
          />
        </div>
      </div>

      <!-- Back button -->
      <div class="mt-3">
        <button class="btn btn-secondary" onclick={onClose}>
          <i class="bi bi-arrow-left me-1"></i>
          Back to Work Orders
        </button>
      </div>
    </div> <!-- Close detail-sections div -->
  {/if} <!-- Close if workOrder block -->

  {#if !workOrder}
    <div class="alert alert-info">
      <p>No work order selected. Please select a work order from the list.</p>
      <button class="btn btn-primary" onclick={onClose}>
        Back to Work Orders
      </button>
    </div>
  {/if}
</div>