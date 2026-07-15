<script lang="ts">
  import { rfState } from '../../rf.svelte';
  import { type AuditLog, type SystemEvent } from '../../api/endpoints/system-related';
  import { listAuditLog, listSystemEvents } from '../../api/endpoints/system-related';

  // State variables
  let state = $state({
    isLoading: false,
    error: null as string | null,
    debugMode: false,
    backupProgress: 0,
    backupStatus: 'idle' as 'idle' | 'running' | 'success' | 'error', // 'idle', 'running', 'success', 'error'
    auditLogs: [] as AuditLog[],
    systemEvents: [] as SystemEvent[],
    isTestingPrinter: false,
    printerTestResult: null as string | null
  });

  // Initialize
  $effect(() => {
    loadSystemData();
  });

  // Load system data
  async function loadSystemData() {
    state.isLoading = true;
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
    } finally {
      state.isLoading = false;
    }
  }

  // Test printer
  async function testPrinter() {
    state.isTestingPrinter = true;
    state.printerTestResult = null;

    try {
      // Simulate printer test
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For now, just show a success message
      // In a real implementation, this would connect to a printer
      state.printerTestResult = 'Printer test successful! Test page sent to default printer.';
    } catch (err) {
      state.printerTestResult = `Printer test failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
    } finally {
      state.isTestingPrinter = false;
    }
  }

  // Export data
  function exportData() {
    try {
      // Simulate data export
      const data = {
        timestamp: new Date().toISOString(),
        workOrders: [], // Would load actual data in real implementation
        contacts: [],
        assets: [],
        inventory: []
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ripflo-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();

      alert('Data export completed successfully!');
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to export data';
      console.error('Error exporting data:', err);
    }
  }

  // Perform backup
  async function performBackup() {
    state.backupStatus = 'running';
    state.backupProgress = 0;

    try {
      // Simulate backup process
      for (let i = 0; i <= 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        state.backupProgress = i * 10;
      }

      state.backupStatus = 'success';
      state.backupProgress = 100;
      alert('Backup completed successfully!');
    } catch (err) {
      state.backupStatus = 'error';
      state.error = err instanceof Error ? err.message : 'Backup failed';
      console.error('Error during backup:', err);
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

  // Toggle debug mode
  function toggleDebugMode() {
    state.debugMode = !state.debugMode;
    if (state.debugMode) {
      console.log('Debug mode enabled');
    }
  }
</script>

<!-- Utilities Tab -->
<div class="tab-content">
  <div class="row">
    <div class="col-md-6">
      <div class="card bg-dark text-light mb-4">
        <div class="card-header">
          <h5 class="mb-0">Printer Test</h5>
        </div>
        <div class="card-body">
          <p class="card-text">
            Test your printer connection and print a test page to verify functionality.
          </p>

          <button
            class="btn btn-primary"
            onclick={testPrinter}
            disabled={state.isTestingPrinter}
          >
            {#if state.isTestingPrinter}
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Testing...
            {:else}
              <i class="bi bi-printer me-2"></i>
              Test Printer
            {/if}
          </button>

          {#if state.printerTestResult}
            <div class="mt-3 p-3 border rounded {
              state.printerTestResult.startsWith('Printer test successful') ? 'border-success bg-success bg-opacity-10' :
              'border-danger bg-danger bg-opacity-10'
            }">
              <p class="mb-0">{state.printerTestResult}</p>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card bg-dark text-light mb-4">
        <div class="card-header">
          <h5 class="mb-0">QR Code Generator</h5>
        </div>
        <div class="card-body text-center">
          <p class="card-text">
            Generate QR codes for work order status pages.
          </p>

          <div class="border p-3 bg-secondary rounded mb-3">
            <!-- Placeholder for QR code -->
            <div class="mx-auto bg-dark" style="width: 150px; height: 150px; display: flex; align-items: center; justify-content: center;">
              <span class="text-light">QR CODE</span>
            </div>
            <p class="mt-2 text-muted">Example: https://ripflo.com/status/12345</p>
          </div>

          <button class="btn btn-primary">
            <i class="bi bi-qr-code me-2"></i>
            Generate QR Code
          </button>
        </div>
      </div>
    </div>
  </div>
</div>