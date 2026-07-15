<script lang="ts">
  import { type AuditLog, type SystemEvent } from '../../api/endpoints/system-related';
  import { listAuditLog, listSystemEvents } from '../../api/endpoints/system-related';
  import ActionBtn from '../UI/ActionBtn.svelte';

  // State variables
  let state = $state({
    auditLogs: [] as AuditLog[],
    systemEvents: [] as SystemEvent[],
    error: null as string | null
  });

  // Initialize
  $effect(() => {
    loadSystemData();
  });

  // Load system data
  async function loadSystemData() {
    try {
      // Load audit logs
      const auditResponse = await listAuditLog(); // Changed from getAuditLogs to listAuditLog
      if (!auditResponse.error || !auditResponse.error.message) {
        state.auditLogs = auditResponse.data.slice(0, 10); // Get last 10 logs
      }

      // Load system events
      const eventsResponse = await listSystemEvents(); // Changed from getSystemEvents to listSystemEvents
      if (!eventsResponse.error || !eventsResponse.error.message) {
        state.systemEvents = eventsResponse.data.slice(0, 10); // Get last 10 events
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to load system data';
      console.error('Error loading system data:', err);
    }
  }

  // Clear audit logs
  async function clearAuditLogs() {
    if (confirm('Are you sure you want to clear all audit logs? This cannot be undone.')) {
      try {
        // In real implementation, this would call the API to clear logs
        state.auditLogs = [];
        alert('Audit logs cleared successfully!');
      } catch (err) {
        state.error = err instanceof Error ? err.message : 'Failed to clear audit logs';
        console.error('Error clearing audit logs:', err);
      }
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
</script>

<!-- System Logs Tab -->
<div class="tab-content">
  <div class="row">
    <div class="col-md-6">
      <div class="card bg-dark text-light mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Audit Logs</h5>
          <ActionBtn
            icon="trash"
            title="Clear Logs"
            variant="outline-danger"
            size="sm"
            onClick={clearAuditLogs}
          />
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table  table-sm mb-0">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {#each state.auditLogs as log}
                  <tr>
                    <td>{log.user_id ? `User ${log.user_id}` : 'System'}</td>
                    <td>{log.action}</td>
                    <td>{formatDate(log.created_at)} {formatTime(log.created_at)}</td>
                  </tr>
                {:else}
                  <tr>
                    <td colspan="3" class="text-center text-muted py-3">
                      No audit logs available
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card bg-dark text-light mb-4">
        <div class="card-header">
          <h5 class="mb-0">System Events</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table  table-sm mb-0">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {#each state.systemEvents as event}
                  <tr>
                    <td>
                      <span class="badge {
                        event.event_type.includes('success') ? 'bg-success' :
                        event.event_type.includes('failed') ? 'bg-danger' :
                        event.event_type.includes('error') ? 'bg-danger' :
                        'bg-secondary'
                      }">
                        {event.event_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span class="badge {
                        event.severity === apiClient.SysEventSeverity.INFO ? 'bg-info' :
                        event.severity === apiClient.SysEventSeverity.WARNING ? 'bg-warning text-dark' :
                        'bg-danger'
                      }">
                        {event.severity}
                      </span>
                    </td>
                    <td>
                      <span class="badge {
                        event.resolved === apiClient.SysEventResolved.YES ? 'bg-success' :
                        'bg-warning text-dark'
                      }">
                        {event.resolved === apiClient.SysEventResolved.YES ? 'Resolved' : 'Active'}
                      </span>
                    </td>
                    <td>{formatDate(event.occurred_at)} {formatTime(event.occurred_at)}</td>
                  </tr>
                {:else}
                  <tr>
                    <td colspan="4" class="text-center text-muted py-3">
                      No system events available
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>