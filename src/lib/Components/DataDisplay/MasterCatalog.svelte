<script lang="ts">
  import { onMount } from 'svelte';
  import { rfState } from '../../rf.svelte';
  import { listMasterCatalog, searchMasterCatalog, updateMasterCatalog, type MasterCatalogItem } from '../../api/endpoints/master-catalog';
  import { toastStore } from '../../stores/toastStore';
  import ActionBtn from '../UI/ActionBtn.svelte';
  import Selector from '../UI/Selector.svelte';
  import bwipjs from 'bwip-js';

  // Props
  let { onSelect = null } = $props<{
    onSelect?: ((item: MasterCatalogItem) => void) | null;
  }>();

  // State
  let searchTerm = $state('');
  let searchResults = $state<MasterCatalogItem[]>([]);
  let isLoading = $state(false);
  let page = $state(1);
  let limit = $state(50);
  let showBarcodeModal = $state(false);
  let selectedBarcodeItem = $state<MasterCatalogItem | null>(null);
  let barcodeCanvasElement = $state<HTMLCanvasElement | null>(null);
  let showQrcodeModal = $state(false);
  let selectedQrcodeItem = $state<MasterCatalogItem | null>(null);
  let qrcodeCanvasElement = $state<HTMLCanvasElement | null>(null);

  // Editing state
  let editingItem = $state<MasterCatalogItem | null>(null);
  let editField = $state('');
  let editValue = $state('');

  // Brand edit modal state
  let showBrandModal = $state(false);
  let brandEditItem = $state<MasterCatalogItem | null>(null);
  let selectedBrandId = $state<number | null>(null);

  // Barcode size controls (in mm for print accuracy)
  let barcodeWidth = $state(2);
  let barcodeHeight = $state(10);
  let barcodeScale = $state(3);

  // Get brand name from brand_id using cached enums
  function getBrandName(brandId: number | undefined): string {
    if (!brandId) return '';
    const brand = rfState.cachedEnums.brands.find(b => b.brand_id === brandId);
    return brand ? brand.name : '';
  }

  // Load items on mount
  onMount(() => {
    loadItems();
  });

  // Debounced search
  let searchTimeout: number;
  function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      page = 1;
      loadItems();
    }, 300) as unknown as number;
  }

  // Clear search
  function clearSearch() {
    searchTerm = '';
    page = 1;
    loadItems();
  }

  // Load items
  async function loadItems() {
    isLoading = true;
    try {
      let response;
      if (searchTerm.trim()) {
        response = await searchMasterCatalog(searchTerm, page, limit);
      } else {
        response = await listMasterCatalog(page, limit);
      }

      if (!response.error) {
        searchResults = response.data || [];
      } else {
        toastStore.add({ message: `Load failed: ${response.error.message}`, type: 'error' });
      }
    } catch (error) {
      toastStore.add({ message: `Load error: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error' });
    } finally {
      isLoading = false;
    }
  }

  // Handle item selection
  function handleSelect(item: MasterCatalogItem) {
    if (onSelect) {
      onSelect(item);
    }
  }

  // Start editing a field
  function startEdit(item: MasterCatalogItem, field: string, currentValue: any) {
    editingItem = item;
    editField = field;
    editValue = currentValue !== null && currentValue !== undefined ? String(currentValue) : '';
  }

  // Save edited field
  async function saveEdit() {
    if (!editingItem) return;

    try {
      const updatePayload: any = {};

      switch (editField) {
        case 'unit_cost':
        case 'unit_price':
        case 'markup_pct':
          updatePayload[editField] = parseFloat(editValue) || 0;
          break;
        case 'is_active':
        case 'taxable':
          updatePayload[editField] = editValue === '1' || editValue.toLowerCase() === 'true' ? 1 : 0;
          break;
        case 'brand_id':
          updatePayload[editField] = parseInt(editValue) || 0;
          break;
        case 'type_field':
        case 'sku':
        case 'desc':
        case 'mfg_part_num':
        case 'upc':
        case 'ean':
        case 'barcode_norm':
        case 'tax_code':
          updatePayload[editField] = editValue;
          break;
        default:
          updatePayload[editField] = editValue;
      }

      const response = await updateMasterCatalog(editingItem.master_id, updatePayload);

      if (!response.error) {
        const index = searchResults.findIndex(i => i.master_id === editingItem.master_id);
        if (index !== -1) {
          searchResults[index] = { ...searchResults[index], ...updatePayload };
        }
        toastStore.add({ message: 'Item updated successfully', type: 'success' });
      } else {
        toastStore.add({ message: `Update failed: ${response.error.message}`, type: 'error' });
      }
    } catch (error: any) {
      toastStore.add({ message: `Update error: ${error.message}`, type: 'error' });
    } finally {
      editingItem = null;
      editField = '';
      editValue = '';
    }
  }

  // Cancel editing
  function cancelEdit() {
    editingItem = null;
    editField = '';
    editValue = '';
  }

  // Open brand edit modal
  function openBrandModal(item: MasterCatalogItem) {
    brandEditItem = item;
    selectedBrandId = item.brand_id;
    showBrandModal = true;
  }

  // Save brand selection
  async function saveBrandEdit() {
    if (!brandEditItem || selectedBrandId === null || selectedBrandId === '') {
      toastStore.add({ message: 'Please select a brand', type: 'warning' });
      return;
    }

    try {
      const response = await updateMasterCatalog(brandEditItem.master_id, {
        brand_id: Number(selectedBrandId)
      });

      if (!response.error) {
        const index = searchResults.findIndex(i => i.master_id === brandEditItem.master_id);
        if (index !== -1) {
          searchResults[index] = { ...searchResults[index], brand_id: Number(selectedBrandId) };
        }
        toastStore.add({ message: 'Brand updated successfully', type: 'success' });
        showBrandModal = false;
        brandEditItem = null;
        selectedBrandId = null;
      } else {
        toastStore.add({ message: `Update failed: ${response.error.message}`, type: 'error' });
      }
    } catch (error: any) {
      toastStore.add({ message: `Update error: ${error.message}`, type: 'error' });
    }
  }

  // Close brand modal
  function closeBrandModal() {
    showBrandModal = false;
    brandEditItem = null;
    selectedBrandId = null;
  }

  // Handle barcode print button click
  function handlePrintBarcode(item: MasterCatalogItem) {
    selectedBarcodeItem = item;
    showBarcodeModal = true;
    setTimeout(() => {
      generateBarcode(item.sku);
    }, 100);
  }

  // Generate barcode using bwip-js
  function generateBarcode(sku: string) {
    if (!barcodeCanvasElement) return;
    try {
      bwipjs.toCanvas(barcodeCanvasElement, {
        bcid: 'code128',
        text: sku,
        scale: barcodeScale,
        width: barcodeWidth,
        height: barcodeHeight,
        includetext: true,
        textxalign: 'center',
        textsize: 12,
        textfont: 'monospace',
        backgroundcolor: 'ffffff',
        paddingheight: 1,
      });
    } catch (e) {
      console.error('Barcode generation error:', e);
      toastStore.add({ message: 'Failed to generate barcode', type: 'error' });
    }
  }

  // Handle QR code button click
  function handlePrintQrcode(item: MasterCatalogItem) {
    selectedQrcodeItem = item;
    showQrcodeModal = true;
    setTimeout(() => {
      generateQrcode(item.sku);
    }, 100);
  }

  // Generate QR code using bwip-js
  function generateQrcode(sku: string) {
    if (!qrcodeCanvasElement) return;
    try {
      bwipjs.toCanvas(qrcodeCanvasElement, {
        bcid: 'qrcode',
        text: sku,
        scale: barcodeScale,
        width: 2,
        height: 2,
        includetext: false,
        backgroundcolor: 'ffffff',
        paddingheight: 1,
      });
    } catch (e) {
      console.error('QR code generation error:', e);
      toastStore.add({ message: 'Failed to generate QR code', type: 'error' });
    }
  }

  // Close barcode modal
  function closeBarcodeModal() {
    showBarcodeModal = false;
    selectedBarcodeItem = null;
  }

  // Close QR code modal
  function closeQrcodeModal() {
    showQrcodeModal = false;
    selectedQrcodeItem = null;
  }

  // Print barcode
  function printBarcode() {
    window.print();
  }

  // Print QR code
  function printQrcode() {
    window.print();
  }

  // Pagination
  function nextPage() {
    page++;
    loadItems();
  }

  function prevPage() {
    if (page > 1) {
      page--;
      loadItems();
    }
  }

  // Handle size change for barcode
  function handleSizeChange() {
    if (selectedBarcodeItem) {
      setTimeout(() => {
        generateBarcode(selectedBarcodeItem.sku);
      }, 50);
    }
    if (selectedQrcodeItem) {
      setTimeout(() => {
        generateQrcode(selectedQrcodeItem.sku);
      }, 50);
    }
  }
</script>

<div class="master-catalog-component">
  <!-- Search input -->
  <div class="input-group mb-3">
    <input
      type="text"
      class="form-control"
      placeholder="Filter by SKU, description, manufacturer part number, UPC, or EAN..."
      bind:value={searchTerm}
      oninput={handleSearchInput}
    />
    <button class="btn btn-outline-secondary" onclick={loadItems} title="Refresh">
      <i class="bi bi-arrow-clockwise"></i>
    </button>
    <button class="btn btn-outline-secondary" onclick={clearSearch} title="Clear">
      <i class="bi bi-x-lg"></i>
    </button>
  </div>

  <!-- Results table -->
  {#if isLoading}
    <div class="alert alert-info">Loading master catalog...</div>
  {:else if searchResults.length > 0}
    <div class="table-responsive" style="overflow-x: auto;">
      <table class="table table-hover table-bordered" style="min-width: 1800px;">
        <thead class="table-light">
          <tr>
            <th style="position: sticky; left: 0; z-index: 10; background: #f8f9fa; min-width: 120px;">SKU</th>
            <th style="min-width: 250px;">Description</th>
            <th style="min-width: 120px;">Brand</th>
            <th style="min-width: 130px;">Mfg Part #</th>
            <th style="min-width: 80px;">Type</th>
            <th class="text-end" style="min-width: 100px;">Unit Cost</th>
            <th class="text-end" style="min-width: 100px;">Unit Price</th>
            <th class="text-end" style="min-width: 100px;">Markup %</th>
            <th class="text-center" style="min-width: 80px;">Active</th>
            <th class="text-center" style="min-width: 80px;">Taxable</th>
            <th style="min-width: 100px;">Tax Code</th>
            <th style="min-width: 130px;">UPC</th>
            <th style="min-width: 130px;">EAN</th>
            <th style="min-width: 130px;">Barcode Norm</th>
            <th class="text-center" style="width: 150px;">Barcodes</th>
          </tr>
        </thead>
        <tbody>
          {#each searchResults as item}
            <tr style="cursor: pointer;" onclick={() => handleSelect(item)}>
              <td style="position: sticky; left: 0; z-index: 10; background: inherit; min-width: 120px;">
                {#if editingItem === item && editField === 'sku'}
                  <input type="text" class="form-control form-control-sm" bind:value={editValue} onkeydown={(e) => e.key === 'Enter' && saveEdit()} onblur={saveEdit} autofocus />
                {:else}
                  <span class="fw-bold" onclick={(e) => { e.stopPropagation(); startEdit(item, 'sku', item.sku); }}>{item.sku}</span>
                {/if}
              </td>
              <td>
                {#if editingItem === item && editField === 'desc'}
                  <input type="text" class="form-control form-control-sm" bind:value={editValue} onkeydown={(e) => e.key === 'Enter' && saveEdit()} onblur={saveEdit} autofocus />
                {:else}
                  <span onclick={(e) => { e.stopPropagation(); startEdit(item, 'desc', item.desc); }}>{item.desc}</span>
                {/if}
              </td>
              <td>
                <span 
                  onclick={(e) => { e.stopPropagation(); openBrandModal(item); }}
                  style="cursor: pointer; text-decoration: underline; color: var(--bs-link-color);"
                  title="Click to edit brand"
                >
                  {getBrandName(item.brand_id) || '(No Brand)'}
                </span>
              </td>
              <td>
                {#if editingItem === item && editField === 'mfg_part_num'}
                  <input type="text" class="form-control form-control-sm" bind:value={editValue} onkeydown={(e) => e.key === 'Enter' && saveEdit()} onblur={saveEdit} autofocus />
                {:else}
                  <span onclick={(e) => { e.stopPropagation(); startEdit(item, 'mfg_part_num', item.mfg_part_num); }}>{item.mfg_part_num || '-'}</span>
                {/if}
              </td>
              <td>
                {#if editingItem === item && editField === 'type_field'}
                  <select class="form-select form-select-sm" bind:value={editValue} onchange={saveEdit} autofocus>
                    <option value="part">part</option>
                    <option value="labor">labor</option>
                    <option value="kit">kit</option>
                    <option value="fee">fee</option>
                  </select>
                {:else}
                  <span class="badge"
                        class:bg-primary={item.type_field === 'part'}
                        class:bg-success={item.type_field === 'labor'}
                        class:bg-warning={item.type_field === 'kit'}
                        class:bg-secondary={item.type_field === 'fee'}
                        onclick={(e) => { e.stopPropagation(); startEdit(item, 'type_field', item.type_field); }}
                        style="cursor: pointer;">
                    {item.type_field}
                  </span>
                {/if}
              </td>
              <td class="text-end">
                {#if editingItem === item && editField === 'unit_cost'}
                  <input type="number" step="0.01" class="form-control form-control-sm text-end" bind:value={editValue} onkeydown={(e) => e.key === 'Enter' && saveEdit()} onblur={saveEdit} autofocus />
                {:else}
                  <span onclick={(e) => { e.stopPropagation(); startEdit(item, 'unit_cost', item.unit_cost); }} style="cursor: pointer;">${item.unit_cost?.toFixed(2) ?? '0.00'}</span>
                {/if}
              </td>
              <td class="text-end">
                {#if editingItem === item && editField === 'unit_price'}
                  <input type="number" step="0.01" class="form-control form-control-sm text-end" bind:value={editValue} onkeydown={(e) => e.key === 'Enter' && saveEdit()} onblur={saveEdit} autofocus />
                {:else}
                  <span onclick={(e) => { e.stopPropagation(); startEdit(item, 'unit_price', item.unit_price); }} style="cursor: pointer;">${item.unit_price?.toFixed(2) ?? '0.00'}</span>
                {/if}
              </td>
              <td class="text-end">
                {#if editingItem === item && editField === 'markup_pct'}
                  <input type="number" step="0.01" class="form-control form-control-sm text-end" bind:value={editValue} onkeydown={(e) => e.key === 'Enter' && saveEdit()} onblur={saveEdit} autofocus />
                {:else}
                  <span onclick={(e) => { e.stopPropagation(); startEdit(item, 'markup_pct', item.markup_pct); }} style="cursor: pointer;">{item.markup_pct?.toFixed(2) ?? '0.00'}%</span>
                {/if}
              </td>
              <td class="text-center">
                {#if editingItem === item && editField === 'is_active'}
                  <select class="form-select form-select-sm" bind:value={editValue} onchange={saveEdit} autofocus>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                {:else}
                  <span class="badge" class:bg-success={item.is_active === 1} class:bg-secondary={item.is_active === 0}
                        onclick={(e) => { e.stopPropagation(); startEdit(item, 'is_active', item.is_active); }}
                        style="cursor: pointer;">
                    {item.is_active === 1 ? 'Yes' : 'No'}
                  </span>
                {/if}
              </td>
              <td class="text-center">
                {#if editingItem === item && editField === 'taxable'}
                  <select class="form-select form-select-sm" bind:value={editValue} onchange={saveEdit} autofocus>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                {:else}
                  <span class="badge" class:bg-success={item.taxable === 1} class:bg-secondary={item.taxable === 0}
                        onclick={(e) => { e.stopPropagation(); startEdit(item, 'taxable', item.taxable); }}
                        style="cursor: pointer;">
                    {item.taxable === 1 ? 'Yes' : 'No'}
                  </span>
                {/if}
              </td>
              <td>
                {#if editingItem === item && editField === 'upc'}
                  <input type="text" class="form-control form-control-sm" bind:value={editValue} onkeydown={(e) => e.key === 'Enter' && saveEdit()} onblur={saveEdit} autofocus />
                {:else}
                  <span onclick={(e) => { e.stopPropagation(); startEdit(item, 'upc', item.upc); }}>{item.upc || '-'}</span>
                {/if}
              </td>
              <td>
                {#if editingItem === item && editField === 'ean'}
                  <input type="text" class="form-control form-control-sm" bind:value={editValue} onkeydown={(e) => e.key === 'Enter' && saveEdit()} onblur={saveEdit} autofocus />
                {:else}
                  <span onclick={(e) => { e.stopPropagation(); startEdit(item, 'ean', item.ean); }}>{item.ean || '-'}</span>
                {/if}
              </td>
              <td>
                {#if editingItem === item && editField === 'barcode_norm'}
                  <input type="text" class="form-control form-control-sm" bind:value={editValue} onkeydown={(e) => e.key === 'Enter' && saveEdit()} onblur={saveEdit} autofocus />
                {:else}
                  <span onclick={(e) => { e.stopPropagation(); startEdit(item, 'barcode_norm', item.barcode_norm); }}>{item.barcode_norm || '-'}</span>
                {/if}
              </td>
              <td>
                {#if editingItem === item && editField === 'tax_code'}
                  <input type="text" class="form-control form-control-sm" bind:value={editValue} onkeydown={(e) => e.key === 'Enter' && saveEdit()} onblur={saveEdit} autofocus />
                {:else}
                  <span onclick={(e) => { e.stopPropagation(); startEdit(item, 'tax_code', item.tax_code); }}>{item.tax_code || '-'}</span>
                {/if}
              </td>
              <td class="text-center">
                <div class="d-flex justify-content-center gap-1">
                  <ActionBtn
                    icon="upc"
                    title="Print Barcode"
                    variant="outline-primary"
                    size="sm"
                    onClick={(e: Event) => { e.stopPropagation(); handlePrintBarcode(item); }}
                  />
                  <ActionBtn
                    icon="qr-code"
                    title="Print QR Code"
                    variant="outline-primary"
                    size="sm"
                    onClick={(e: Event) => { e.stopPropagation(); handlePrintQrcode(item); }}
                  />
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center mt-3">
      <button class="btn btn-outline-primary" onclick={prevPage} disabled={page <= 1}>
        <i class="bi bi-chevron-left"></i> Previous
      </button>
      <span>Page {page}</span>
      <button class="btn btn-outline-primary" onclick={nextPage}>
        Next <i class="bi bi-chevron-right"></i>
      </button>
    </div>
  {:else if searchTerm}
    <div class="alert alert-info">No items found matching "{searchTerm}"</div>
  {:else}
    <div class="alert alert-info">No items found in the master catalog</div>
  {/if}
</div>

<!-- Barcode Print Preview Modal -->
{#if showBarcodeModal && selectedBarcodeItem}
  <div class="modal-backdrop fade show" style="z-index: 1050;"></div>
  <div class="modal fade show d-block" style="z-index: 1051;" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Print Barcode: {selectedBarcodeItem.sku}</h5>
          <button type="button" class="btn-close" onclick={closeBarcodeModal} title="Close"></button>
        </div>
        <div class="modal-body" style="background: white;">
          <div class="row mb-3">
            <div class="col-md-4">
              <label for="scale-slider" class="form-label">Scale</label>
              <input type="range" id="scale-slider" class="form-range" min="1" max="6" step="0.5" bind:value={barcodeScale} oninput={handleSizeChange}>
              <div class="form-text">Current: {barcodeScale}x</div>
            </div>
            <div class="col-md-4">
              <label for="width-slider" class="form-label">Bar Width</label>
              <input type="range" id="width-slider" class="form-range" min="1" max="4" step="0.5" bind:value={barcodeWidth} oninput={handleSizeChange}>
              <div class="form-text">Current: {barcodeWidth}</div>
            </div>
            <div class="col-md-4">
              <label for="height-slider" class="form-label">Height (mm)</label>
              <input type="range" id="height-slider" class="form-range" min="5" max="25" step="1" bind:value={barcodeHeight} oninput={handleSizeChange}>
              <div class="form-text">Current: {barcodeHeight}mm</div>
            </div>
          </div>
          <div class="text-center p-4" style="background: white;">
            <canvas bind:this={barcodeCanvasElement}></canvas>
          </div>
          <p class="text-muted text-center mb-0 mt-3">{selectedBarcodeItem.desc}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={closeBarcodeModal}>Close</button>
          <button type="button" class="btn btn-primary" onclick={printBarcode}>
            <i class="bi bi-printer me-1"></i> Print
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- QR Code Print Preview Modal -->
{#if showQrcodeModal && selectedQrcodeItem}
  <div class="modal-backdrop fade show" style="z-index: 1050;"></div>
  <div class="modal fade show d-block" style="z-index: 1051;" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Print QR Code: {selectedQrcodeItem.sku}</h5>
          <button type="button" class="btn-close" onclick={closeQrcodeModal} title="Close"></button>
        </div>
        <div class="modal-body" style="background: white;">
          <div class="row mb-3">
            <div class="col-12">
              <label for="qr-scale-slider" class="form-label">Scale</label>
              <input type="range" id="qr-scale-slider" class="form-range" min="1" max="10" step="0.5" bind:value={barcodeScale} oninput={handleSizeChange}>
              <div class="form-text">Current: {barcodeScale}x</div>
            </div>
          </div>
          <div class="text-center p-4" style="background: white;">
            <canvas bind:this={qrcodeCanvasElement}></canvas>
          </div>
          <p class="text-muted text-center mb-0 mt-3">{selectedQrcodeItem.desc}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={closeQrcodeModal}>Close</button>
          <button type="button" class="btn btn-primary" onclick={printQrcode}>
            <i class="bi bi-printer me-1"></i> Print
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Brand Edit Modal -->
{#if showBrandModal && brandEditItem}
  <div class="modal-backdrop fade show" style="z-index: 1050;"></div>
  <div class="modal fade show d-block" style="z-index: 1051;" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-tags me-2"></i>
            Edit Brand
          </h5>
          <button type="button" class="btn-close" onclick={closeBrandModal} title="Close"></button>
        </div>
        <div class="modal-body">
          <p class="mb-2">
            <strong>SKU:</strong> {brandEditItem.sku}
          </p>
          <p class="mb-3">
            <strong>Current Brand:</strong> {getBrandName(brandEditItem.brand_id)}
          </p>
          <label for="brand-selector" class="form-label">Select Brand:</label>
          <Selector
            id="brand-selector"
            options={rfState.cachedEnums.brands.map(b => ({ id: b.brand_id, name: b.name }))}
            preselectedValue={selectedBrandId || ''}
            placeholder="Select a brand..."
            onSelectionChange={(value) => {
              console.log(value);
              selectedBrandId = Number(value);
            }}
          />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={closeBrandModal}>Cancel</button>
          <button type="button" class="btn btn-primary" onclick={saveBrandEdit}>
            <i class="bi bi-check-circle me-1"></i>
            Save Brand
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .master-catalog-component {
    background: var(--bs-body-bg);
    padding: 1rem;
  }

  @media print {
    body * {
      visibility: hidden;
    }
    .modal-content, .modal-content * {
      visibility: visible;
    }
    .modal-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      box-shadow: none;
      border: none;
    }
    .modal-header, .modal-footer, .modal-body .row {
      display: none !important;
    }
    .modal-body {
      padding: 0 !important;
    }
    canvas {
      max-width: 100%;
    }
  }
</style>
