<script lang="ts">
  import type { WorkOrder } from '../../api/endpoints/workorders';
  import ActionBtn from '../UI/ActionBtn.svelte';

  let {
    workOrder,
    newItem,
    disabled = false,
    onAddItem = null
  } = $props<{
    workOrder?: WorkOrder;
    newItem: {
      code: string;
      desc: string;
      unit_price: number;
      qty: number;
    };
    disabled?: boolean;
    onAddItem?: (() => void) | null;
  }>();

  // Format currency
  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  // Get total price
  function getTotalPrice() {
    return (newItem.qty || 0) * (newItem.unit_price || 0);
  }
</script>

<div class="item-form">
  <div class="row mb-3">
    <div class="col-md-3">
      <label for="item-code" class="form-label">Code</label>
      <input
        type="text"
        id="item-code"
        class="form-control"
        bind:value={newItem.code}
        placeholder="Item code"
        disabled={disabled}
      />
    </div>
    <div class="col-md-4">
      <label for="item-desc" class="form-label">Description</label>
      <input
        type="text"
        id="item-desc"
        class="form-control"
        bind:value={newItem.desc}
        placeholder="Item description"
        disabled={disabled}
      />
    </div>
    <div class="col-md-2">
      <label for="item-qty" class="form-label">Qty</label>
      <input
        type="number"
        id="item-qty"
        class="form-control"
        bind:value={newItem.qty}
        min="1"
        disabled={disabled}
      />
    </div>
    <div class="col-md-2">
      <label for="item-price" class="form-label">Price</label>
      <input
        type="text"
        id="item-price"
        class="form-control"
        value={formatCurrency(newItem.unit_price)}
        oninput={(e) => {
          const val = parseFloat((e.target as HTMLInputElement).value.replace(/[^0-9.]/g, ''));
          newItem.unit_price = isNaN(val) ? 0 : val;
        }}
        disabled={disabled}
      />
    </div>
    <div class="col-md-1 d-flex align-items-end">
      <ActionBtn
        icon="plus-circle"
        title="Add Item"
        variant="outline-success"
        size="sm"
        onClick={onAddItem}
        disabled={disabled || !newItem.code || !newItem.desc}
      />
    </div>
  </div>
</div>
