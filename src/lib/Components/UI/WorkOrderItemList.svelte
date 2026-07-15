<script lang="ts">
  import { rfState } from '../../rf.svelte';
  import { type WorkOrderItem, type WorkOrder } from '../../api/endpoints/workorders';
  import ActionBtn from '../UI/ActionBtn.svelte';

  let {
    items,
    workOrder: workOrderProp,
    disabled = false,
    onUpdateQty = null,
    onDeleteItem = null
  } = $props<{
    items: WorkOrderItem[];
    workOrder?: WorkOrder | null;
    disabled?: boolean;
    onUpdateQty?: (itemId: number, newQty: number) => void;
    onDeleteItem?: (itemId: number) => void;
  }>();

  // Derive workOrder from rfState for reactivity - fall back to prop if not in rfState
  let workOrder = $derived.by(() => {
    if (!workOrderProp?.workorder_id) return workOrderProp;
    const rfWorkOrder = rfState.workOrders.find(wo => wo.workorder_id === workOrderProp.workorder_id);
    return rfWorkOrder || workOrderProp;
  });

  // Track input values separately to allow editing
  let qtyInputs = $state<Record<number, number>>({});

  // Initialize qtyInputs when items change
  $effect(() => {
    if (items && items.length > 0) {
      const newInputs: Record<number, number> = {};
      items.forEach(item => {
        newInputs[item.wo_items_id] = item.qty;
      });
      qtyInputs = newInputs;
    }
  });

  // Handle quantity input change
  function handleQtyChange(itemId: number, value: string) {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      qtyInputs[itemId] = numValue;
    }
  }

  // Handle quantity input blur (commit the change)
  function handleQtyBlur(itemId: number) {
    const inputValue = qtyInputs[itemId];
    if (inputValue !== undefined) {
      onUpdateQty?.(itemId, inputValue);
    }
  }

  // Handle Enter key press
  function handleQtyKeydown(itemId: number, event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleQtyBlur(itemId);
    }
  }
</script>

<div class="item-list">
  <div class="table-responsive">
    <table class="table table-hover">
      <thead>
        <tr>
          <th>Code</th>
          <th>Description</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Line Total</th>
          <th>Tax Amount</th>
          <th>Row Total</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#if items && items.length > 0}
          {#each items as item}
            <tr>
              <td>{item.code}</td>
              <td>{item.desc}</td>
              <td>
                <div class="d-flex align-items-center">
                  <button
                    class="btn btn-outline-secondary btn-sm me-1"
                    onclick={() => {
                      const currentQty = qtyInputs[item.wo_items_id] ?? item.qty;
                      onUpdateQty && onUpdateQty(item.wo_items_id, parseFloat((currentQty - 0.25).toFixed(2)));
                    }}
                    disabled={disabled || (qtyInputs[item.wo_items_id] ?? item.qty) <= 0.25}
                    title="Decrease quantity"
                  >
                    <i class="bi bi-dash"></i>
                  </button>
                  <input
                    type="number"
                    class="form-control form-control-sm mx-1"
                    style="width: 70px;"
                    value={qtyInputs[item.wo_items_id] ?? item.qty}
                    disabled={disabled}
                    title="Enter quantity"
                    step="0.01"
                    oninput={(e) => handleQtyChange(item.wo_items_id, e.currentTarget.value)}
                    onblur={() => handleQtyBlur(item.wo_items_id)}
                    onkeydown={(e) => handleQtyKeydown(item.wo_items_id, e)}
                  />
                  <button
                    class="btn btn-outline-secondary btn-sm ms-1"
                    onclick={() => {
                      const currentQty = qtyInputs[item.wo_items_id] ?? item.qty;
                      onUpdateQty && onUpdateQty(item.wo_items_id, parseFloat((currentQty + 0.25).toFixed(2)));
                    }}
                    disabled={disabled}
                    title="Increase quantity"
                  >
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
              </td>
              <td>${item.unit_price.toFixed(2)}</td>
              <td>${(item.qty * item.unit_price).toFixed(2)}</td>
              <td>${(item.tax_amount ?? 0).toFixed(2)}</td>
              <td>${((item.qty * item.unit_price) + (item.tax_amount ?? 0)).toFixed(2)}</td>
              <td>
                <ActionBtn
                  icon="trash"
                  title="Delete Item"
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onDeleteItem && onDeleteItem(item.wo_items_id)}
                  disabled={disabled}
                />
              </td>
            </tr>
          {/each}
          <tr class="table-secondary fw-bold">
            <td colspan="6" class="text-end">Total:</td>
            <td>${workOrder?.total_price?.toFixed(2) ?? '0.00'}</td>
            <td></td>
          </tr>
        {:else}
          <tr>
            <td colspan="8" class="text-center text-muted py-3">No items added yet</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>