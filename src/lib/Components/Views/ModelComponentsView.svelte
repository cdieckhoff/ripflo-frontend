<script lang="ts">
  import { type ModelComponent } from '../../api/endpoints/models';
  import { listModelComponents, createModelComponent, updateModelComponent, deleteModelComponent as apiDeleteModelComponent } from '../../api/endpoints/models';
  import { onMount } from 'svelte';
  import ActionBtn from '../UI/ActionBtn.svelte';

  // State variables
  let state = $state({
    components: [] as ModelComponent[],
    isLoading: false,
    error: null as string | null,
    newComponent: {
      model_id: 0,
      mfg_id: 0,
      cat_id: 0,
      desc: '',
      oem_part_num: '',
      int_part_num: '',
      warranty: '',
    },
    editingId: null as number | null,
    editingComponent: null as ModelComponent | null,
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    uploadProgress: 0,
    uploadStatus: '' as 'idle' | 'uploading' | 'success' | 'error',
    uploadedData: null as any[] | null,
    showUploadForm: false
  });

  // Fetch components
  async function loadComponents() {
    state.isLoading = true;
    try {
      const response = await listModelComponents();
      // Proper error checking following the pattern from instructions
      if (response.error && response.error.message && response.error.message.trim() !== '') {
        state.error = response.error.message;
      } else {
        state.components = response.data || [];
        state.totalItems = response.data?.length || 0;
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to load components';
      console.error('Error loading components:', err);
    } finally {
      state.isLoading = false;
    }
  }

  // Calculate pagination
  const paginatedData = $derived(() => {
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = Math.min(startIndex + state.itemsPerPage, state.totalItems);
    return {
      startIndex,
      endIndex,
      totalPages: Math.ceil(state.totalItems / state.itemsPerPage),
      paginatedComponents: state.components.slice(startIndex, endIndex)
    };
  });

  // Handle file upload
  async function handleFileUpload(file: File) {
    state.uploadProgress = 0;
    state.uploadStatus = 'uploading';
    state.uploadedData = null;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate file processing - in real implementation, this would call the API
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        state.uploadedData = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        // Process the uploaded data
        for (const item of state.uploadedData) {
          await createModelComponent({
            model_id: item.model_id || 0,
            mfg_id: item.mfg_id || 0,
            cat_id: item.cat_id || 0,
            desc: item.desc || '',
            oem_part_num: item.oem_part_num || '',
            int_part_num: item.int_part_num || '',
            warranty: item.warranty || '',
          });
        }
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.tsv')) {
        // Simulate CSV/TSV parsing
        const text = await file.text();
        const rows = text.split('\n').filter(row => row.trim());
        const headers = rows[0].split(/[,;\t]/); // Support both CSV and TSV
        
        const csvData = rows.slice(1).map(row => {
          const values = row.split(/[,;\t]/);
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim();
          });
          return obj;
        });
        
        state.uploadedData = csvData;
        
        // Process the uploaded data
        for (const item of csvData) {
          await createModelComponent({
            model_id: item.model_id ? parseInt(item.model_id) : 0,
            mfg_id: item.mfg_id ? parseInt(item.mfg_id) : 0,
            cat_id: item.cat_id ? parseInt(item.cat_id) : 0,
            desc: item.desc || '',
            oem_part_num: item.oem_part_num || '',
            int_part_num: item.int_part_num || '',
            warranty: item.warranty || '',
          });
        }
      }
      
      state.uploadStatus = 'success';
      await loadComponents(); // Refresh the list
    } catch (err) {
      state.uploadStatus = 'error';
      state.error = err instanceof Error ? err.message : 'Failed to process file';
    }
  }

  // Add new component
  async function addComponent() {
    try {
      const response = await createModelComponent(state.newComponent);
      // Proper error checking following the pattern from instructions
      if (response.error && response.error.message && response.error.message.trim() !== '') {
        state.error = response.error.message;
      } else {
        loadComponents();
        state.newComponent = {
          model_id: 0,
          mfg_id: 0,
          cat_id: 0,
          desc: '',
          oem_part_num: '',
          int_part_num: '',
          warranty: '',
        };
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to add component';
      console.error('Error adding component:', err);
    }
  }

  // Update component
  async function updateComponent() {
    if (!state.editingComponent || !state.editingId) return;

    try {
      const response = await updateModelComponent(
        state.editingId,
        state.editingComponent
      );
      // Proper error checking following the pattern from instructions
      if (response.error && response.error.message && response.error.message.trim() !== '') {
        state.error = response.error.message;
      } else {
        loadComponents();
        state.editingId = null;
        state.editingComponent = null;
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to update component';
      console.error('Error updating component:', err);
    }
  }

  // Delete component
  async function deleteComponent(id: number) {
    if (!confirm('Are you sure you want to delete this component?')) return;

    try {
      const response = await apiDeleteModelComponent(id);
      // Proper error checking following the pattern from instructions
      if (response.error && response.error.message && response.error.message.trim() !== '') {
        state.error = response.error.message;
      } else {
        loadComponents();
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to delete component';
      console.error('Error deleting component:', err);
    }
  }

  // Set component for editing
  function startEditing(component: ModelComponent) {
    state.editingId = component.model_component_id;
    state.editingComponent = { ...component };
  }

  // Cancel editing
  function cancelEditing() {
    state.editingId = null;
    state.editingComponent = null;
  }

  // Navigation functions for pagination
  function goToPage(page: number) {
    if (page >= 1 && page <= Math.ceil(state.totalItems / state.itemsPerPage)) {
      state.currentPage = page;
    }
  }

  function nextPage() {
    if (state.currentPage < Math.ceil(state.totalItems / state.itemsPerPage)) {
      state.currentPage++;
    }
  }

  function prevPage() {
    if (state.currentPage > 1) {
      state.currentPage--;
    }
  }

  // Initialize data
  onMount(loadComponents);
</script>

<div class="model-components-view">
  <h4 class="mb-4">Model Components</h4>

  {#if state.error}
    <div class="alert alert-danger" role="alert">
      {state.error}
      <button type="button" class="btn-close" onclick={() => state.error = null} title="Close alert"></button>
    </div>
  {/if}

  <!-- Upload Section -->
  <div class="card bg-dark text-light mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Batch Import</h5>
      <button 
        class="btn btn-sm btn-outline-primary" 
        onclick={() => state.showUploadForm = !state.showUploadForm}
      >
        {state.showUploadForm ? 'Hide Import' : 'Show Import'}
      </button>
    </div>
    {#if state.showUploadForm}
      <div class="card-body">
        <div class="mb-3">
          <label for="componentFile" class="form-label">Upload Dealer JSON, TSV, or CSV</label>
          <input
            type="file"
            class="form-control bg-secondary text-light"
            id="componentFile"
            accept=".json,.csv,.tsv"
            onchange={(e) => {
              const files = (e.target as HTMLInputElement).files;
              if (files && files.length > 0) {
                handleFileUpload(files[0]);
              }
            }}
          />
        </div>

        {#if state.uploadStatus === 'uploading'}
          <div class="progress mb-2">
            <div 
              class="progress-bar progress-bar-striped progress-bar-animated" 
              role="progressbar" 
              style="width: 100%"
            ></div>
          </div>
          <small class="text-muted">Processing file...</small>
        {/if}

        {#if state.uploadStatus === 'success'}
          <div class="alert alert-success mt-2">
            <i class="bi bi-check-circle me-2"></i>
            Components imported successfully!
          </div>
        {/if}

        {#if state.uploadStatus === 'error'}
          <div class="alert alert-danger mt-2">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Failed to process file. Please check the format and try again.
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Add Component Form -->
  <div class="card bg-dark text-light mb-4">
    <div class="card-header">
      <h5 class="mb-0">Add New Component</h5>
    </div>
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-6">
          <label for="componentDesc" class="form-label">Description</label>
          <input
            type="text"
            class="form-control bg-secondary text-light"
            id="componentDesc"
            bind:value={state.newComponent.desc}
            placeholder="Enter component description"
          />
        </div>
        <div class="col-md-3">
          <label for="modelId" class="form-label">Model ID</label>
          <input
            type="number"
            class="form-control bg-secondary text-light"
            id="modelId"
            bind:value={state.newComponent.model_id}
            placeholder="Model ID"
          />
        </div>
        <div class="col-md-3">
          <label for="mfgId" class="form-label">Manufacturer ID</label>
          <input
            type="number"
            class="form-control bg-secondary text-light"
            id="mfgId"
            bind:value={state.newComponent.mfg_id}
            placeholder="Manufacturer ID"
          />
        </div>
        <div class="col-md-6">
          <label for="oemPartNum" class="form-label">OEM Part Number</label>
          <input
            type="text"
            class="form-control bg-secondary text-light"
            id="oemPartNum"
            bind:value={state.newComponent.oem_part_num}
            placeholder="Enter OEM part number"
          />
        </div>
        <div class="col-md-6">
          <label for="intPartNum" class="form-label">Internal Part Number</label>
          <input
            type="text"
            class="form-control bg-secondary text-light"
            id="intPartNum"
            bind:value={state.newComponent.int_part_num}
            placeholder="Enter internal part number"
          />
        </div>
        <div class="col-md-12">
          <label for="warranty" class="form-label">Warranty</label>
          <input
            type="text"
            class="form-control bg-secondary text-light"
            id="warranty"
            bind:value={state.newComponent.warranty}
            placeholder="Enter warranty information"
          />
        </div>
      </div>
      <div class="mt-3">
        <button 
          class="btn btn-primary" 
          onclick={addComponent}
          disabled={!state.newComponent.desc}
        >
          <i class="bi bi-plus-lg me-2"></i>
          Add Component
        </button>
      </div>
    </div>
  </div>

  <!-- Components Table -->
  <div class="card bg-dark text-light">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Components ({state.totalItems})</h5>
    </div>
    <div class="card-body p-0">
      {#if state.isLoading}
        <div class="p-5 text-center">
          <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      {:else}
        <div class="table-responsive">
          <table class="table  table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Model ID</th>
                <th>Manufacturer ID</th>
                <th>Category ID</th>
                <th>Description</th>
                <th>OEM Part #</th>
                <th>Int. Part #</th>
                <th>Warranty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#if paginatedData && paginatedData.paginatedComponents}
                {#each paginatedData.paginatedComponents as component}
                  {#if state.editingId === component.model_component_id}
                    <tr>
                      <td>{component.model_component_id}</td>
                      <td>
                        <input
                          type="number"
                          class="form-control bg-secondary text-light"
                          bind:value={state.editingComponent!.model_id}
                          placeholder="Model ID"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          class="form-control bg-secondary text-light"
                          bind:value={state.editingComponent!.mfg_id}
                          placeholder="Mfg ID"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          class="form-control bg-secondary text-light"
                          bind:value={state.editingComponent!.cat_id}
                          placeholder="Cat ID"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          class="form-control bg-secondary text-light"
                          bind:value={state.editingComponent!.desc}
                          placeholder="Description"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          class="form-control bg-secondary text-light"
                          bind:value={state.editingComponent!.oem_part_num}
                          placeholder="OEM Part #"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          class="form-control bg-secondary text-light"
                          bind:value={state.editingComponent!.int_part_num}
                          placeholder="Int. Part #"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          class="form-control bg-secondary text-light"
                          bind:value={state.editingComponent!.warranty}
                          placeholder="Warranty"
                        />
                      </td>
                      <td>
                        <ActionBtn
                          icon="check-lg"
                          title="Save changes"
                          variant="success"
                          size="sm"
                          onClick={updateComponent}
                        />
                        <ActionBtn
                          icon="x-lg"
                          title="Cancel editing"
                          variant="secondary"
                          size="sm"
                          onClick={cancelEditing}
                        />
                      </td>
                    </tr>
                  {:else}
                    <tr>
                      <td>{component.model_component_id}</td>
                      <td>{component.model_id}</td>
                      <td>{component.mfg_id}</td>
                      <td>{component.cat_id}</td>
                      <td>{component.desc}</td>
                      <td>{component.oem_part_num || '-'}</td>
                      <td>{component.int_part_num || '-'}</td>
                      <td>{component.warranty || '-'}</td>
                      <td>
                        <ActionBtn
                          icon="pencil"
                          title="Edit component"
                          variant="outline-primary"
                          size="sm"
                          onClick={() => startEditing(component)}
                        />
                        <ActionBtn
                          icon="trash"
                          title="Delete component"
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteComponent(component.model_component_id)}
                        />
                      </td>
                    </tr>
                  {/if}
                {/each}
              {/if}
              {#if paginatedData && paginatedData.paginatedComponents && paginatedData.paginatedComponents.length === 0}
                <tr>
                  <td colspan="9" class="text-center text-muted py-4">
                    No components found
                  </td>
                </tr>
              {/if}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        {#if state.totalItems > state.itemsPerPage}
          <div class="card-footer bg-transparent border-top-secondary d-flex justify-content-between align-items-center">
            <div>
              {#if paginatedData}
                Showing {paginatedData.startIndex + 1} to {Math.min(paginatedData.endIndex, state.totalItems)} of {state.totalItems} entries
              {/if}
            </div>
            <div>
              <nav aria-label="Components pagination">
                <ul class="pagination mb-0">
                  <li class="page-item {state.currentPage === 1 ? 'disabled' : ''}">
                    <button class="page-link" onclick={() => prevPage()} type="button">
                      Previous
                    </button>
                  </li>
                  {#if paginatedData && paginatedData.totalPages > 0}
                    {#each Array.from({ length: paginatedData.totalPages }, (_, i) => i + 1) as pageNum}
                      <li class="page-item {state.currentPage === pageNum ? 'active' : ''}">
                        <button class="page-link" onclick={() => goToPage(pageNum)} type="button">
                          {pageNum}
                        </button>
                      </li>
                    {/each}
                  {/if}
                  <li class="page-item {paginatedData && state.currentPage === paginatedData.totalPages ? 'disabled' : ''}">
                    <button class="page-link" onclick={() => nextPage()} type="button">
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>