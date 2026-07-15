<script lang="ts">
  import { rfState } from '../../rf.svelte';
  import { onMount } from 'svelte';
  import { listWorkOrders, updateWorkOrderStatus, getWorkOrder } from '../../api/endpoints/workorders';
  import WorkOrdersCardView from './WorkOrdersCardView.svelte';
  import WorkOrdersListView from './WorkOrdersListView.svelte';
  import RotaryContextMenu from '../UI/RotaryContextMenu.svelte';
  import EntitySearch from '../UI/EntitySearch.svelte';
  import ActionIcon2 from '../UI/ActionIcon2.svelte';
  import NewWorkOrder from '../Modals/NewWorkOrder.svelte';
  import WorkOrderDetail from '../Modals/WorkOrderDetail.svelte';
  import ViewModeToggle from '../UI/ViewModeToggle.svelte';
  import ActionBtn from '../UI/ActionBtn.svelte';

  let viewMode = $state('card');
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let showContextMenu = $state(false);
  let contextMenuData = $state({ x: 0, y: 0, wo: null });
  let showNewWorkOrder = $state(false);
  let showWorkOrderDetail = $state(false);
  let selectedWorkOrder = $state(null);


  const statusOptions = $derived(
    rfState.cachedEnums.workOrderStatuses.map(status => ({
      id: status.wo_status_id,
      label: status.status
    }))
  );

  async function handleStatusChange(newStatusId: number, workOrderId?: number) {
    const id = workOrderId || contextMenuData.wo?.workorder_id;
    if (id) {
      try {
        await updateWorkOrderStatus(id, newStatusId);
        // The WebSocket should update rfState.workOrders automatically
        showContextMenu = false;
      } catch (err) {
        console.error('Error updating work order status:', err);
        error = 'Failed to update work order status';
      }
    }
  }

  // State to track whether to show all work orders or only open ones
  let showAllWorkOrders = $state(false);

  // Function to toggle showing all work orders
  function toggleWorkOrderVisibility() {
    showAllWorkOrders = !showAllWorkOrders;
    fetchWorkOrders();
  }

  async function fetchWorkOrders() {
    isLoading = true;
    try {
      const response = await listWorkOrders();
      let allWorkOrders = response.data || [];
      
      // Apply the open work orders filter if showAllWorkOrders is false
      if (!showAllWorkOrders) {
        allWorkOrders = allWorkOrders.filter(wo =>
          wo.status &&
          wo.status.toLowerCase() !== 'done' &&
          wo.status.toLowerCase() !== 'cancel' &&
          wo.status.toLowerCase() !== 'paid'
        );
      }
      
      rfState.workOrders = allWorkOrders;
    } catch (err) {
      error = 'Failed to load work orders';
    } finally {
      isLoading = false;
    }
  }

  function handleShowContextMenu(menuData) {
    contextMenuData = menuData;
    if (menuData.wo) {
      rfState.selectedWorkOrder = menuData.wo;
    }
    showContextMenu = true;
  }

  function handleWorkOrderSelect(workOrder) {
    selectedWorkOrder = workOrder;
    viewMode = 'workorder_detail';
    showWorkOrderDetail = true;
  }

  async function handleSearchSelect(result: any) {
    // Handle selected work order from search
    if (result.workorder_id) {
      try {
        const response = await getWorkOrder(result.workorder_id);
        if (!response.error && response.data && response.data.length > 0) {
          selectedWorkOrder = response.data[0];
        } else {
          selectedWorkOrder = result;
        }
      } catch (error) {
        console.error('Error fetching full work order details:', error);
        selectedWorkOrder = result;
      }
    } else {
      selectedWorkOrder = result;
    }
    viewMode = 'workorder_detail';
    showWorkOrderDetail = true;
  }

  function handleAddWorkOrder() {
    showNewWorkOrder = true;
  }


  // Remove the View derived variable since we'll render components conditionally

  onMount(async () => {
    await fetchWorkOrders();
  });
  function switchView(mode:string){
    //viewMode = mode;
    switch(mode){
      case 'list':
        return WorkOrdersListView;
      break;
      case 'card':
        return WorkOrdersCardView;
      break;
    }
  }
  const View = $derived(switchView(viewMode));
</script>

<div class="work-orders-view">
  {#if showWorkOrderDetail && selectedWorkOrder && viewMode === 'workorder_detail'}
    <!-- Work Order Detail View -->
    <WorkOrderDetail
      workOrder={selectedWorkOrder}
      onClose={() => {showWorkOrderDetail = false; selectedWorkOrder = null; viewMode = 'card'}}
    />
  {:else}
    <!-- Main Work Orders View -->
    <!-- Header with search and add button -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="col-8">
        <EntitySearch
          entityType="workorder"
          onSelect={handleSearchSelect}
          onAdd={handleAddWorkOrder}
        />
      </div>
      <div class="d-flex justify-content-end col-4">
        <ActionIcon2
          onClick={() => {showNewWorkOrder = true;}}
          props="bi-clipboard2"
          action="Add Work Order"
          text="Add Work Order"
        />
      </div>
    </div>

    <!-- View toggle buttons -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h6>Work Orders</h6>
      <div class="d-flex align-items-center">
        <ActionBtn
          icon={showAllWorkOrders ? "eye-slash" : "eye"}
          title={showAllWorkOrders ? "Hide Closed Work Orders" : "Show All Work Orders"}
          variant="outline-primary"
          size="sm"
          onClick={toggleWorkOrderVisibility}
        />
        <ViewModeToggle
          currentMode={viewMode}
          onModeChange={(mode) => viewMode = mode}
        />
      </div>
    </div>

    {#if viewMode === 'card' || viewMode === 'list'}
      <View
        workOrders={rfState.workOrders}
        onShowContextMenu={handleShowContextMenu}
        onWorkOrderSelect={handleWorkOrderSelect}
        onStatusChange={handleStatusChange}
        statuses={statusOptions}
      />
    {/if}
    {#if showNewWorkOrder}
      <NewWorkOrder onClose={() => {showNewWorkOrder = false;}}/>
    {/if}
  {/if}
</div>