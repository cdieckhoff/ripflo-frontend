<script lang="ts">
  import ActionBtn from '../UI/ActionBtn.svelte';

  let state = $state({
    debugMode: false
  });

  // Toggle debug mode
  function toggleDebugMode() {
    state.debugMode = !state.debugMode;
    if (state.debugMode) {
      console.log('Debug mode enabled');
    }
  }
</script>

<!-- Debug Tab -->
<div class="tab-content">
  <div class="card bg-dark text-light mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Debug Tools</h5>
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          role="switch"
          id="debugToggle"
          checked={state.debugMode}
          onclick={toggleDebugMode}
        />
        <label class="form-check-label" for="debugToggle">
          Debug Mode
        </label>
      </div>
    </div>
    <div class="card-body">
      <div class="alert { state.debugMode ? 'alert-warning' : 'alert-secondary' }">
        <h6 class="alert-heading">{ state.debugMode ? 'Debug Mode Active' : 'Debug Mode Inactive' }</h6>
        <p>
          { state.debugMode
            ? 'Additional logging and development tools are enabled.'
            : 'Debug features are disabled.' }
        </p>
      </div>

      <div class="row">
        <div class="col-md-6">
          <h6>System Information</h6>
          <ul class="list-unstyled">
            <li><strong>Frontend Version</strong> 1.0.0</li>
            <li><strong>Backend Version</strong> 1.0.0</li>
            <li><strong>WebSocket Status:</strong>
              <span class="badge bg-info">Connected</span>
            </li>
            <li><strong>Database Status:</strong>
              <span class="badge bg-success">Healthy</span>
            </li>
          </ul>
        </div>

        <div class="col-md-6">
          <h6>Debug Actions</h6>
          <ActionBtn
            icon="trash"
            title="Clear Cache"
            variant="outline-warning"
            size="sm"
            onClick={() => {}}
          />
          <ActionBtn
            icon="arrow-repeat"
            title="Reset App State"
            variant="outline-warning"
            size="sm"
            onClick={() => {}}
          />
          <ActionBtn
            icon="exclamation-triangle"
            title="Trigger Error"
            variant="outline-warning"
            size="sm"
            onClick={() => {}}
          />
          <ActionBtn
            icon="wifi"
            title="Simulate Network"
            variant="outline-info"
            size="sm"
            onClick={() => {}}
          />
        </div>
      </div>

      <hr>

      <h6>API Test</h6>
      <div class="row g-2">
        <div class="col-md-8">
          <input
            type="text"
            class="form-control bg-secondary text-light"
            placeholder="/api/endpoint"
          />
        </div>
        <div class="col-md-4">
          <ActionBtn
            icon="plug"
            title="Test API"
            variant="outline-primary"
            size="sm"
            class="w-100"
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  </div>
</div>