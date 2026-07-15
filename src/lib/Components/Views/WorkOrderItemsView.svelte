<script lang="ts">
  import { rfState } from '../../rf.svelte';
  import { type WorkOrderItem, type WorkOrder } from '../../api/endpoints/workorders';
  import { searchMasterCatalog, createWorkOrderItem, listWorkOrderItems, updateWorkOrderItem, deleteWorkOrderItem, type MasterCatalogSearchResult} from '../../api/endpoints/workorder-related';
  import { getWorkOrder } from '../../api/endpoints/workorders';
  import { toastStore } from '../../stores/toastStore';
  import ActionBtn from '../UI/ActionBtn.svelte';
  import WorkOrderItemsPrintable from '../UI/WorkOrderItemsPrintable.svelte';
  import WorkOrderItemForm from '../UI/WorkOrderItemForm.svelte';
  import WorkOrderItemList from '../UI/WorkOrderItemList.svelte';
  import QRScanner from '../UI/QRScanner.svelte';

  // Props
  let { workOrder: workOrderProp, disabled = false } = $props<{
    workOrder?: WorkOrder | null;
    disabled?: boolean;
  }>();

  // Derive workOrder from rfState for reactivity - fall back to prop if not in rfState
  let workOrder = $derived.by(() => {
    if (!workOrderProp?.workorder_id) return workOrderProp;
    const rfWorkOrder = rfState.workOrders.find(wo => wo.workorder_id === workOrderProp.workorder_id);
    return rfWorkOrder || workOrderProp;
  });

  // Scanner state
  let showScanner = $state(false);

  // Local state
  let scanCode = $state('');
  let scanResults = $state<MasterCatalogSearchResult[]>([]);
  let newItem = $state({
    code: '',
    desc: '',
    unit_price: 0,
    qty: 1
  });

  // Get items from rfState.workOrders (automatically updated by WebSocket)
  let items = $derived.by(() => {
    if (!workOrder?.workorder_id) return [];
    return workOrder.items || [];
  });

  // Handle adding an item
  async function handleAddItem() {
    if (!workOrder?.workorder_id) return;

    // Validate required fields
    if (!newItem.code || !newItem.desc) {
      toastStore.add({ message: 'Please enter item code and description', type: 'warning' });
      return;
    }

    try {
      const payload = {
        wo_id: workOrder.workorder_id,
        code: newItem.code,
        desc: newItem.desc,
        qty: newItem.qty || 1,
        unit_price: newItem.unit_price || 0
        // Note: total_price is calculated by backend, not sent in request
      };

      const response = await createWorkOrderItem(payload);
      if (!response.error) {
        toastStore.add({ message: 'Item added successfully', type: 'success' });
        // Reset form
        newItem = {
          code: '',
          desc: '',
          unit_price: 0,
          qty: 1
        };
        scanResults = [];
        // workOrder will automatically update via rfState reactivity
      } else {
        console.error('Add item error - response:', response);
        toastStore.add({ message: `Error adding item: ${response.error.message}`, type: 'error' });
        // Preserve the code in the input field for manual retry
      }
    } catch (error) {
      console.error('Add item error:', error);
      toastStore.add({ message: `Error adding item: ${error.message}`, type: 'error' });
      // Preserve the code in the input field for manual retry
    }
  }

  // Handle scanning via input (for testing without camera) - uses master_catalog search
  async function handleScanCode() {
    const searchTerm = newItem.code.trim();
    if (!searchTerm) return;

    try {
      const response = await searchMasterCatalog(searchTerm);
      if (!response.error) {
        scanResults = response.data || [];

        // If we have exactly one result, auto-create the item
        if (scanResults.length === 1) {
          const firstResult = scanResults[0];
          newItem = {
            code: firstResult.sku,
            desc: firstResult.desc,
            unit_price: firstResult.unit_price,
            qty: 1
          };
          // Auto-add the item
          handleAddItem();
        } else if (scanResults.length > 1) {
          // Multiple results - show selection table, auto-fill form with first result
          const firstResult = scanResults[0];
          newItem = {
            code: firstResult.sku,
            desc: firstResult.desc,
            unit_price: firstResult.unit_price,
            qty: 1
          };
        } else {
          // No results - show error
          toastStore.add({ message: 'No items found matching that code', type: 'warning' });
        }
      } else {
        toastStore.add({ message: `Error searching items: ${response.error.message}`, type: 'error' });
      }
    } catch (error) {
      toastStore.add({ message: `Error searching items: ${error.message}`, type: 'error' });
    }
  }

  // Handle selecting a scanned item from master_catalog (when multiple results)
  function handleSelectScannedItem(item: MasterCatalogSearchResult) {
    // Populate the form with the selected item
    newItem = {
      code: item.sku,
      desc: item.desc,
      unit_price: item.unit_price,
      qty: 1
    };

    // Clear scan results and auto-add
    scanResults = [];
    handleAddItem();
  }

  // Handle updating item quantity
  async function updateItemQty(itemId: number, newQty: number) {
    // Find the item to update from rfState
    const rfWorkOrder = rfState.workOrders.find(wo => wo.workorder_id === workOrder?.workorder_id);
    const itemToUpdate = rfWorkOrder?.items?.find(item => item.wo_items_id === itemId);
    if (!itemToUpdate) return;

    try {
      // Prepare the update payload - only update the quantity and recalculate total_price
      const updatedItem = {
        ...itemToUpdate,
        qty: newQty,
        total_price: newQty * itemToUpdate.unit_price
      };

      // Make API call to update the item
      const response = await updateWorkOrderItem(itemId, {
        wo_id: updatedItem.wo_id,
        code: updatedItem.code,
        desc: updatedItem.desc,
        qty: updatedItem.qty,
        unit_price: updatedItem.unit_price,
        total_price: updatedItem.total_price
      });

      if (!response.error) {
        // Update rfState directly - backend should recalculate workOrder.total_price
        // but since WebSocket doesn't fire for item updates, we need to fetch the updated work order
        const updatedWoResponse = await getWorkOrder(workOrder.workorder_id);
        if (!updatedWoResponse.error && updatedWoResponse.data && updatedWoResponse.data.length > 0) {
          const woIndex = rfState.workOrders.findIndex(wo => wo.workorder_id === workOrder.workorder_id);
          if (woIndex !== -1) {
            rfState.workOrders[woIndex] = updatedWoResponse.data[0];
          }
        }
        toastStore.add({ message: 'Item quantity updated successfully', type: 'success' });
      } else {
        toastStore.add({ message: `Error updating item: ${response.error.message}`, type: 'error' });
      }
    } catch (error) {
      toastStore.add({ message: `Error updating item: ${error.message}`, type: 'error' });
    }
  }

  // Handle removing an item from the work order (use delete endpoint)
  async function handleDeleteItem(itemId: number) {
    try {
      // Make API call to delete the item
      const response = await deleteWorkOrderItem(itemId);

      if (!response.error) {
        toastStore.add({ message: 'Item removed from work order successfully', type: 'success' });
        // WebSocket will update rfState automatically with the full work order including updated total_price
      } else {
        toastStore.add({ message: `Error removing item from work order: ${response.error.message}`, type: 'error' });
      }
    } catch (error) {
      toastStore.add({ message: `Error removing item from work order: ${error.message}`, type: 'error' });
    }
  }
</script>

<div class="work-order-items-view">
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Work Order Items</h5>
      <div class="d-flex gap-2">
        <ActionBtn
          icon="qr-code-scan"
          title="Scan Barcode"
          variant="outline-primary"
          size="sm"
          onClick={() => showScanner = true}
        />
        <WorkOrderItemsPrintable {items} workOrder={workOrder} />
      </div>
    </div>
    <div class="card-body">
      {#key showScanner}
        {#if showScanner}
          <QRScanner
            onScan={(code) => {
              newItem.code = code;
              showScanner = false;
              handleScanCode();
            }}
            onCancel={() => showScanner = false}
          />
        {/if}
      {/key}

      <!-- Manual scan input -->
      <div class="input-group mb-3">
        <input
          type="text"
          class="form-control"
          placeholder="Scan or enter item code (e.g., CD-LABOR-2C)..."
          bind:value={newItem.code}
          onkeypress={(e) => e.key === 'Enter' && handleScanCode()}
        />
        <button class="btn btn-outline-secondary" onclick={handleScanCode} title="Search Item">
          <i class="bi bi-search"></i>
        </button>
      </div>

      <!-- Search Results (only show if multiple results) -->
      {#if scanResults && scanResults.length > 1}
        <div class="card mb-3">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">
              <i class="bi bi-search me-2"></i>
              Select Item ({scanResults.length} found)
            </h6>
            <button
              type="button"
              class="btn-close btn-close-white"
              onclick={() => scanResults = []}
              title="Close"
            ></button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>SKU</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {#each scanResults as result}
                    <tr
                      style="cursor: pointer;"
                      onclick={() => handleSelectScannedItem(result)}
                    >
                      <td>{result.sku}</td>
                      <td>{result.desc}</td>
                      <td>
                        <span class="badge" class:bg-info={result.type === 'labor'} class:bg-secondary={result.type !== 'labor'}>
                          {result.type}
                        </span>
                      </td>
                      <td>${result.unit_price?.toFixed(2) ?? '0.00'}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      {/if}


      <!-- Add new item form -->
      <WorkOrderItemForm
        newItem={newItem}
        onAddItem={handleAddItem}
      />

      <!-- Items list -->
      <WorkOrderItemList
        {items}
        {workOrder}
        {disabled}
        onUpdateQty={updateItemQty}
        onDeleteItem={handleDeleteItem}
      />
    </div>
  </div>
</div>