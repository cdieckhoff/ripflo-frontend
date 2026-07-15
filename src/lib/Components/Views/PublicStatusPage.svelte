<script lang="ts">
  import { WorkOrderNoteIsPrivate, WorkOrderNoteType } from '../../types/consolidated-enums.js';
  import { type WorkOrder } from '../../api/endpoints/workorders';
  import { type WorkOrderNote } from '../../api/endpoints/workorder-related';
  import { listWorkOrders } from '../../api/endpoints/workorders';
  import { listWorkOrderNotes } from '../../api/endpoints/workorder-related';

  // State variables
  let state = $state({
    workOrder: null as WorkOrder | null,
    notes: [] as WorkOrderNote[],
    isLoading: false,
    error: null as string | null,
    wo_text: ''
  });

  // Initialize from URL params
  $effect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/status\/(.+)/);
    if (match) {
      state.wo_text = match[1];
      loadWorkOrderStatus(state.wo_text);
    } else {
      state.error = 'Invalid work order ID';
    }
  });

  // Load work order status
  async function loadWorkOrderStatus(wo_text: string) {
    state.isLoading = true;
    try {
      // Find work order by wo_text (this is a simplified approach)
      const response = await listWorkOrders(); // Changed from getWorkOrders to listWorkOrders
      if (response.error) {
        throw new Error(response.error.message);
      }

      const workOrder = response.data.find(wo => wo.wo_text === wo_text);
      if (!workOrder) {
        throw new Error('Work order not found');
      }

      state.workOrder = workOrder;

      // Load notes
      const notesResponse = await listWorkOrderNotes(); // Changed from getWorkOrderNotes to listWorkOrderNotes
      if (!notesResponse.error) {
        // Filter out private notes
        state.notes = notesResponse.data.filter(note => note.is_private === WorkOrderNoteIsPrivate.NO && note.workorder_id === workOrder.workorder_id);
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to load work order status';
      console.error('Error loading work order status:', err);
    } finally {
      state.isLoading = false;
    }
  }

  // Format date
  function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  }

  // Format time
  function formatTime(dateStr: string | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Format hours
  function formatHours(hours: number | undefined): string {
    if (hours === undefined || hours === null) return '0 hours';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }

  // Refresh data
  function refresh() {
    if (state.wo_text) {
      loadWorkOrderStatus(state.wo_text);
    }
  }
</script>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Work Order Status - RIPFLO</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
  <style>
    body {
      background-color: #121212;
      color: #f8f9fa;
    }
    .status-card {
      background-color: #1e1e1e;
      border: 1px solid #343a40;
      border-radius: 0.5rem;
    }
    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
    }
    .timeline-item {
      position relative;
      padding-left: 1.5rem;
      margin-bottom: 1rem;
    }
    .timeline-item:before {
      content: '';
      position absolute;
      left: 0;
      top: 0.5rem;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background-color: #f77947;
    }
  </style>
</head>
<body class="bg-dark text-light">
  <div class="container py-4">
    <div class="text-center mb-4">
      <h1 class="display-5">RIPFLO Work Order Status</h1>
      <p class="text-muted">Track your repair progress in real-time</p>
    </div>

    {#if state.isLoading}
      <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    {/if}

    {#if state.error}
      <div class="alert alert-danger text-center" role="alert">
        {state.error}
        {#if state.error === 'Invalid work order ID'}
          <p class="mb-0 mt-2">Please check the URL or contact us for assistance.</p>
        {/if}
      </div>
    {/if}

    {#if state.workOrder && !state.isLoading && !state.error}
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="status-card p-4 mb-4">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h2 class="mb-3">Work Order #{state.workOrder.wo_text}</h2>
                <p class="text-muted mb-1">
                  <i class="bi bi-calendar me-2"></i>
                  Created: {formatDate(state.workOrder.created_at)}
                </p>
                <p class="text-muted">
                  <i class="bi bi-person me-2"></i>
                  Customer: {state.workOrder.contact_name || 'N/A'}
                </p>
              </div>
              <div class="text-end">
                <span class="status-badge d-inline-block {
                  state.workOrder.status === 1 ? 'bg-secondary' : // NEW
                  state.workOrder.status === 2 ? 'bg-warning text-dark' : // DIAGNOSING
                  state.workOrder.status === 4 ? 'bg-primary' : // IN_PROGRESS
                  state.workOrder.status === 3 ? 'bg-info' : // AWAITING_PARTS
                  state.workOrder.status === 5 ? 'bg-warning text-dark' : // AWAITING_APPROVAL
                  state.workOrder.status === 6 ? 'bg-info' : // TESTING
                  'bg-success' // FINISHED
                }">
                  {state.workOrder.status === 1 ? 'NEW' :
                   state.workOrder.status === 2 ? 'DIAGNOSING' :
                   state.workOrder.status === 3 ? 'AWAITING PARTS' :
                   state.workOrder.status === 4 ? 'IN PROGRESS' :
                   state.workOrder.status === 5 ? 'AWAITING APPROVAL' :
                   state.workOrder.status === 6 ? 'TESTING' :
                   'FINISHED'}
                </span>
              </div>
            </div>

            <hr class="my-4">

            <div class="row">
              <div class="col-md-4">
                <h6>Priority</h6>
                <p>{state.priority}</p>
              </div>
              <div class="col-md-4">
                <h6>Estimated Hours</h6>
                <p>{formatHours(state.workOrder.estimated_hours)}</p>
              </div>
              <div class="col-md-4">
                <h6>Actual Hours</h6>
                <p>{formatHours(state.workOrder.actual_hours)}</p>
              </div>
            </div>

            <div class="mt-4">
              <h5>Recent Updates</h5>
              <div class="timeline">
                {#each state.notes as note}
                  <div class="timeline-item">
                    <div class="d-flex justify-content-between">
                      <span class="badge {
                        note.type === WorkOrderNoteType.PROBLEM ? 'bg-danger' :
                        note.type === WorkOrderNoteType.SOLUTION ? 'bg-success' :
                        'bg-secondary'
                      }">
                        {note.type}
                      </span>
                      <small class="text-muted">
                        {formatDate(note.created_at)} {formatTime(note.created_at)}
                      </small>
                    </div>
                    <p class="mb-1">{note.text}</p>
                  </div>
                {:else}
                  <p class="text-muted">No updates yet. Check back soon!</p>
                {/each}
              </div>
            </div>
          </div>

          <div class="text-center">
            <button class="btn btn-outline-light me-2" onclick={refresh}>
              <i class="bi bi-arrow-clockwise"></i> Refresh
            </button>
            <a href="/" class="btn btn-primary">
              <i class="bi bi-house"></i> Return to App
            </a>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <script>
    // Auto-refresh every 30 seconds
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        document.querySelector('button[onclick="refresh()"]')?.click();
      }
    }, 30000);
  </script>
</body>
</html>
