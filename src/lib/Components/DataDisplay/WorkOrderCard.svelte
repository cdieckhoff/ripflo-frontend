<script lang="ts">
  import { rfState } from "$lib/rf.svelte";
  import { type WorkOrder, updateWorkOrderStatus } from "../../api/endpoints/workorders";
  import { getStatusString } from "../Modals/workOrderUtils";
  import RotaryContextMenu from '../UI/RotaryContextMenu.svelte';

  let {
    workOrder: workOrderProp = null,
    disabled = false,
    onClick,
    onShowContextMenu = null,
    onStatusChange = null
  } = $props<{
    workOrder?: WorkOrder;
    disabled?: boolean;
    onClick?: (wo: WorkOrder) => void;
    onShowContextMenu?: (data: any) => void;
    onStatusChange?: (newStatusId: number, workOrderId: number) => void;
  }>();

  // Derive workOrder from rfState for reactivity - fall back to prop if not in rfState
  let workOrder = $derived.by(() => {
    if (!workOrderProp?.workorder_id) return workOrderProp;
    const rfWorkOrder = rfState.workOrders.find(wo => wo.workorder_id === workOrderProp.workorder_id);
    return rfWorkOrder || workOrderProp;
  });

  let showContextMenu = $state(false);
  let contextMenuData = $state({ x: 0, y: 0, wo: null });

  // Use cached work order statuses from rfState
  const statusOptions = $derived(
    rfState.cachedEnums.workOrderStatuses.map(status => ({
      id: status.wo_status_id,
      label: status.status
    }))
  );

  function formatDate(dateString: string) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  function handleClick() {
    if (onClick && !disabled) {
      onClick(workOrder);
    }
  }

  function openContextMenu(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    const menuData = {
      x: e.clientX,
      y: e.clientY,
      wo: workOrder
    };
    contextMenuData = menuData;
    showContextMenu = true;

    //if (onShowContextMenu) {
    //  onShowContextMenu(menuData);
    //} else {
    //  showContextMenu = true;
    //}
  }

  function handleStatusChange(newStatusId: number) {
    showContextMenu = false;
    updateWorkOrderStatus(workOrder.workorder_id, newStatusId);
  }

  // Check if work order is a return work order
  function isReturnWorkOrder(): boolean {
    return workOrder?.parent_id !== null && workOrder?.parent_id !== undefined;
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="work-order-card card bg-dark border-secondary mb-2"
  onclick={handleClick}
  oncontextmenu={openContextMenu}
  role="button"
  tabindex="0"
>
  {#if workOrder}
    <div class="card-header d-flex justify-content-between align-items-center py-1 border-bottom border-secondary">
      <i
        class="bi status-icon status-{workOrder.status}"
        title={workOrder.status}
      ></i>

      <span class="wo-text flex-grow-1 mx-2 text-truncate priority-{workOrder.priority || 'normal'}">
        {workOrder.wo_text}
        {#if isReturnWorkOrder()}
          <i class="bi bi-arrow-return-left ms-1 text-warning" title="Return Work Order"></i>
        {/if}
      </span>

      <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
    </div>

    <div class="card-body p-2 small text-light">
      <div class="customer-info mb-1">
        <span class="text-muted">Customer:</span> {workOrder.contact_name || 'N/A'}
      </div>

      <div class="asset-info mb-2">
        <span class="text-muted">Asset:</span>
        {#if workOrder.asset}
          {workOrder.asset.brand_name} {workOrder.asset.model_name}
        {:else}
          {workOrder.brand_name} {workOrder.model_name}
        {/if}
      </div>

      <div class="meta-info d-flex justify-content-between opacity-75">
        {#if workOrder.created_at}
          <span>Created: {formatDate(workOrder.created_at)}</span>
        {/if}
        {#if workOrder.begin_dt}
          <span class="text-info">Begin: {formatDate(workOrder.begin_dt)}</span>
        {/if}
      </div>

      {#if workOrder.total_price !== null && workOrder.total_price !== undefined}
        <div class="total-price mt-1 text-end">
          <span class="text-muted">Total:</span> 
          <span class="text-success fw-bold">${Number(workOrder.total_price).toFixed(2)}</span>
        </div>
      {/if}
    </div>
  {/if}


</div>
  {#if showContextMenu}
  <!--<div class="modal">-->
    <RotaryContextMenu
      menuData={contextMenuData}
      statuses={statusOptions}
      onSelectStatus={handleStatusChange}
      onClose={() => showContextMenu = false}
    />
    <!--</div>-->
  {/if}