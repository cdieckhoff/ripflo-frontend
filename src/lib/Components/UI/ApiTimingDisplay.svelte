<script lang="ts">
  import { apiTimingLog, type ApiTiming } from '../../api/client';

  // Props
  let { showDetails = false } = $props<{
    showDetails?: boolean;
  }>();

  // State
  let isVisible = $state(false);
  let timings = $state<ApiTiming[]>([]);

  // Get recent timings
  function updateTimings() {
    timings = [...apiTimingLog].reverse().slice(0, 20);
  }

  // Format duration for display
  function formatDuration(ms: number): string {
    if (ms < 1) return `${ms.toFixed(0)}ms`;
    if (ms < 100) return `${ms.toFixed(1)}ms`;
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  // Get color class based on duration
  function getDurationClass(ms: number): string {
    if (ms < 100) return 'text-success';
    if (ms < 500) return 'text-warning';
    return 'text-danger';
  }

  // Get icon based on status
  function getStatusIcon(status: 'success' | 'error'): string {
    return status === 'success' ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger';
  }

  // Extract endpoint name from URL
  function getEndpointName(url: string): string {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.split('/').filter(Boolean);
      return path.join('/');
    } catch {
      return url;
    }
  }

  // Format timestamp
  function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }

  // Clear timing log
  function clearLog() {
    apiTimingLog.length = 0;
    updateTimings();
  }
</script>

<div class="api-timing-display">
  <button
    type="button"
    class="btn btn-sm btn-outline-info position-fixed"
    style="bottom: 60px; right: 10px; z-index: 1040;"
    title="Toggle API Timing"
    onclick={() => { isVisible = !isVisible; if (isVisible) updateTimings(); }}
  >
    <i class="bi bi-speedometer2"></i>
    {timings.length > 0 && formatDuration(timings[0]?.duration || 0)}
  </button>

  {#if isVisible}
    <div class="modal-backdrop fade show" style="z-index: 1040;" onclick={() => isVisible = false}></div>
    <div class="modal fade show d-block" tabindex="-1" style="z-index: 1041;">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-speedometer2 me-2"></i>
              API Performance Monitor
            </h5>
            <button
              type="button"
              class="btn-close"
              onclick={() => isVisible = false}
              title="Close"
            ></button>
          </div>
          <div class="modal-body">
            <!-- Summary Stats -->
            <div class="row mb-3">
              <div class="col-md-4">
                <div class="card bg-secondary">
                  <div class="card-body text-center">
                    <h6 class="card-title">Total Calls</h6>
                    <h3 class="text-white">{apiTimingLog.length}</h3>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card bg-secondary">
                  <div class="card-body text-center">
                    <h6 class="card-title">Avg Response</h6>
                    <h3 class="text-white">
                      {apiTimingLog.length > 0 
                        ? formatDuration(apiTimingLog.reduce((sum, t) => sum + t.duration, 0) / apiTimingLog.length)
                        : '0ms'}
                    </h3>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card bg-secondary">
                  <div class="card-body text-center">
                    <h6 class="card-title">Slowest</h6>
                    <h3 class="text-white">
                      {apiTimingLog.length > 0 
                        ? formatDuration(Math.max(...apiTimingLog.map(t => t.duration)))
                        : '0ms'}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Calls Table -->
            <h6 class="mb-2">Recent API Calls (Last 20)</h6>
            {#if timings.length > 0}
              <div class="table-responsive">
                <table class="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Endpoint</th>
                      <th>Method</th>
                      <th>Duration</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each timings as timing}
                      <tr>
                        <td>
                          <i class="bi {getStatusIcon(timing.status)}"></i>
                        </td>
                        <td class="font-monospace small">
                          {getEndpointName(timing.endpoint)}
                        </td>
                        <td>
                          <span class="badge bg-info">{timing.method}</span>
                        </td>
                        <td>
                          <span class="fw-bold {getDurationClass(timing.duration)}">
                            {formatDuration(timing.duration)}
                          </span>
                        </td>
                        <td class="text-muted small">
                          {formatTime(timing.timestamp)}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {:else}
              <p class="text-muted text-center py-4">No API calls recorded yet</p>
            {/if}
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline-danger"
              onclick={clearLog}
              title="Clear timing log"
            >
              <i class="bi bi-trash me-1"></i> Clear Log
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              onclick={() => isVisible = false}
              title="Close"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .api-timing-display {
    position: fixed;
    bottom: 60px;
    right: 10px;
    z-index: 1040;
  }
</style>
