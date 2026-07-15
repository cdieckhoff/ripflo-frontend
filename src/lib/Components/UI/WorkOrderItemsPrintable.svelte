<script lang="ts">
  import { onMount } from 'svelte';
  import { type WorkOrderItem, type WorkOrder } from '../../api/endpoints/workorders';
  import { getContact } from '../../api/endpoints/contacts';
  import ActionBtn from './ActionBtn.svelte';
  import RipfloLogo from './RipfloLogo.svelte';
  import bwipjs from 'bwip-js';

  let { items = [], workOrder = null } = $props<{
    items?: WorkOrderItem[];
    workOrder?: WorkOrder;
  }>();

  let showPrintView = $state(false);
  let barcodeCanvasElements: (HTMLCanvasElement | null)[] = [];
  let viewType = $state<'PCL' | 'IVC'>('PCL');
  let contactDetails = $state(null);

  // Barcode size controls (in mm for print accuracy)
  let barcodeScale = $state(2);
  let barcodeWidth = $state(1.5);
  let barcodeHeight = $state(10);

  // Create ivc_text by replacing 'WO' with 'IVC' in workorder.wo_text
  let ivc_text = $derived(workOrder?.wo_text ? workOrder.wo_text.replace('WO', 'IVC') : '');

  // Generate barcodes after component mounts
  onMount(() => {
    if (workOrder?.contact_id) {
      loadContactDetails(workOrder.contact_id);
    }
  });

  // Function to load contact details by ID
  async function loadContactDetails(contactId: number) {
    try {
      const response = await getContact(contactId);
      if (!response.error) {
        contactDetails = response.data;
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
    }
  }

  function generateBarcodes() {
    // Process each barcode canvas element
    barcodeCanvasElements.forEach((canvas, index) => {
      if (canvas && items[index]) {
        try {
          bwipjs.toCanvas(canvas, {
            bcid: 'code128',
            text: items[index].code,
            scale: barcodeScale,
            width: barcodeWidth,
            height: barcodeHeight,
            includetext: true,
            textxalign: 'center',
            textsize: 10,
            textfont: 'monospace',
            backgroundcolor: 'ffffff',
            paddingheight: 1,
          });
        } catch (e) {
          console.error('Barcode generation error:', e);
        }
      }
    });
  }

  function openPrintView() {
    showPrintView = true;
    // Generate barcodes after a short delay to ensure DOM is ready
    setTimeout(() => {
      generateBarcodes();
    }, 200);
  }

  function closePrintView() {
    showPrintView = false;
  }

  function triggerPrint() {
    setTimeout(() => {
      generateBarcodes(); // Ensure barcodes are generated before printing
    }, 100);
    setTimeout(() => {
      window.print();
    }, 300);
  }

  // Function to handle direct print (opens modal and prints)
  function handleDirectPrint() {
    showPrintView = true;
    setTimeout(() => {
      generateBarcodes();
      setTimeout(() => {
        window.print();
        showPrintView = false;
      }, 500);
    }, 200);
  }
</script>

<!-- Print trigger button -->
<div class="no-print">
  <ActionBtn
    icon="printer"
    title="Print Work Order Items with Barcodes"
    variant="outline-primary"
    size="sm"
    onClick={openPrintView}
  />
</div>

<!-- Printable content as a modal view -->
{#if showPrintView}
  <div class="pcl-print">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{viewType === 'PCL' ? workOrder.wo_txt : ivc_text} {viewType === 'PCL' ? 'Items List' : 'Invoice'}</h5>
          {#if viewType === 'PCL'}
            <div class="d-flex gap-2 align-items-center">
              <div class="d-flex flex-column" style="min-width: 80px;">
                <label class="form-label mb-0" style="font-size: 10px;">Scale</label>
                <input type="range" class="form-range" min="1" max="4" step="0.5" bind:value={barcodeScale} onchange={generateBarcodes} title="Scale: {barcodeScale}x">
              </div>
              <div class="d-flex flex-column" style="min-width: 80px;">
                <label class="form-label mb-0" style="font-size: 10px;">Width</label>
                <input type="range" class="form-range" min="1" max="3" step="0.25" bind:value={barcodeWidth} onchange={generateBarcodes} title="Width: {barcodeWidth}">
              </div>
              <div class="d-flex flex-column" style="min-width: 80px;">
                <label class="form-label mb-0" style="font-size: 10px;">Height</label>
                <input type="range" class="form-range" min="5" max="20" step="1" bind:value={barcodeHeight} onchange={generateBarcodes} title="Height: {barcodeHeight}mm">
              </div>
            </div>
          {/if}
          <div class="d-flex gap-2 me-2">
            <div class="btn-group" role="group">
              <input type="radio" class="btn-check" name="viewType" id="pclRadio" value="PCL" checked={viewType === 'PCL'} onchange={() => { viewType = 'PCL'; setTimeout(generateBarcodes, 100); }}>
              <label class="btn btn-outline-primary btn-sm" for="pclRadio">PCL</label>

              <input type="radio" class="btn-check" name="viewType" id="ivcRadio" value="IVC" checked={viewType === 'IVC'} onchange={() => { viewType = 'IVC'; setTimeout(generateBarcodes, 100); }}>
              <label class="btn btn-outline-primary btn-sm" for="ivcRadio">IVC</label>
            </div>
          </div>
          <button type="button" class="btn-close text-dark" onclick={closePrintView} aria-label="Close"></button>
        </div>
        <div class="modal-body" style="flex: 1; overflow-y: auto; background-color: white; color: black; padding: 20px;">
          <div class="printable-items">
            <!-- Logo centered at the top -->
            <div class="row mb-3">
              <div class="col-12 d-flex justify-content-center">
                <RipfloLogo />
              </div>
            </div>

            <!-- Invoice/workorder number right-aligned -->
            <div class="row mb-3">
              <div class="col-12 text-end">
                {#if viewType === 'PCL'}
                  <h2 class="mb-0">Work Order Items - {workOrder.wo_text}</h2>
                {:else}
                  <h2 class="mb-0">Invoice - {ivc_text}</h2>
                {/if}
              </div>
            </div>

            <!-- Contact info left-aligned and date right-aligned on the same row -->
            <div class="row mb-3">
              <div class="col-6">
                <!-- Contact Information Section -->
                {#if contactDetails}
                  <div>
                    <h4 class="mb-1">Customer Information</h4>
                    <p class="mb-1"><strong>Name:</strong> {contactDetails.display_name}</p>
                  </div>
                {:else if workOrder?.contact_name}
                  <div>
                    <h4 class="mb-1">Customer Information</h4>
                    <p class="mb-1"><strong>Name:</strong> {workOrder.contact_name}</p>
                  </div>
                {/if}
              </div>
              <div class="col-6 text-end">
                <p class="mb-0">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {#if viewType === 'PCL'}
              <!-- PCL View with barcodes -->
              <div class="row">
                {#each items as item, index}
                  <div class="col-md-4 col-lg-3 mb-3">
                    <div class="border p-3 text-center break-inside-avoid">
                      <div class="mb-2">
                        <canvas bind:this={barcodeCanvasElements[index]} class="barcode w-100" style="max-width: 200px;"></canvas>
                      </div>
                      <div class="fw-bold mb-1">{item.code}</div>
                      <div class="small mb-2">{item.desc}</div>
                      <div class="d-flex justify-content-between small">
                        <span>Qty: {item.qty}</span>
                        <span>${item.unit_price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <!-- IVC View as Invoice -->
              <div class="table-responsive">
                <table class="table table-borderless" style="background-color: #ffffff; color: black;">
                  <thead class="table-light">
                    <tr>
                      <th class="text-start">Code</th>
                      <th class="text-start">Description</th>
                      <th class="text-center">Quantity</th>
                      <th class="text-end">Price</th>
                      <th class="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody style="background-color: #FFFFFF; color: black;">
                    {#each items as item}
                      <tr>
                        <td class="text-start">{item.code}</td>
                        <td class="text-start">{item.desc}</td>
                        <td class="text-center">{item.qty}</td>
                        <td class="text-end">${item.unit_price.toFixed(2)}</td>
                        <td class="text-end">${(item.qty * item.unit_price).toFixed(2)}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {/if}

            {#if items.length > 0}
              <div class="row mt-3">
                <div class="col-12 text-end">
                  <p class="mb-1">Total Items: {items.length}</p>
                  <p class="mb-0 fw-bold">Grand Total: ${items.reduce((sum, item) => sum + (item.qty * item.unit_price), 0).toFixed(2)}</p>
                </div>
              </div>
            {/if}
          </div>
        </div>
        <div class="modal-footer" style="background: white; color: black; border-top: 1px solid #dee2e6; padding: 1rem;">
          <button type="button" class="btn btn-secondary" onclick={closePrintView}>Close</button>
          <button type="button" class="btn btn-primary" onclick={triggerPrint}>Print</button>
        </div>
      </div>
    </div>
  </div>
{/if}
<style>
  .table, tr, td, table, tbody, th{
    background-color: white;
    color: black;
  }

  @media print {
    .modal-header .d-flex.gap-2,
    .modal-header .form-range,
    .modal-header label {
      display: none !important;
    }
    canvas {
      max-width: 100%;
    }
  }
</style>