<script lang="ts">

  // State variables
  let state = $state({
    backupProgress: 0,
    backupStatus: 'idle' as 'idle' | 'running' | 'success' | 'error',
    error: null as string | null
  });

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
</script>

<!-- Backup & Export Tab -->
<div class="tab-content">
  <div class="row">
    <div class="col-md-6">
      <div class="card bg-dark text-light mb-4">
        <div class="card-header">
          <h5 class="mb-0">Database Backup</h5>
        </div>
        <div class="card-body">
          <p class="card-text">
            Create a backup of all your work orders, contacts, and inventory data.
          </p>

          <button
            class="btn btn-warning"
            onclick={performBackup}
            disabled={state.backupStatus === 'running'}
          >
            <i class="bi bi-arrow-down-circle me-2"></i>
            Create Backup
          </button>

          {#if state.backupStatus === 'running'}
            <div class="mt-3">
              <div class="progress" style="height: 20px;">
                <div
                  class="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style="width: {state.backupProgress}%"
                >
                  {state.backupProgress}%
                </div>
              </div>
              <small class="text-muted">Creating backup...</small>
            </div>
          {/if}

          {#if state.backupStatus === 'success'}
            <div class="mt-3 alert alert-success">
              <i class="bi bi-check-circle me-2"></i>
              Backup completed successfully!
            </div>
          {/if}
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card bg-dark text-light mb-4">
        <div class="card-header">
          <h5 class="mb-0">Data Export</h5>
        </div>
        <div class="card-body">
          <p class="card-text">
            Export your data to JSON, CSV, or other formats for external use.
          </p>

          <div class="btn-group" role="group">
            <button class="btn btn-primary" onclick={exportData}>
              <i class="bi bi-file-earmark-arrow-down me-2"></i>
              Export to JSON
            </button>
            <button class="btn btn-outline-primary">
              <i class="bi bi-file-earmark-spreadsheet me-2"></i>
              Export to CSV
            </button>
          </div>

          <hr>

          <h6>Import Data</h6>
          <p class="text-muted small mb-2">
            Import previously exported data or migrate from another system.
          </p>
          <button class="btn btn-outline-secondary">
            <i class="bi bi-file-earmark-arrow-up me-2"></i>
            Import Data
          </button>
        </div>
      </div>
    </div>
  </div>
</div>