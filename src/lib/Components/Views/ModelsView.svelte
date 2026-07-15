<script lang="ts">
  import { listModels, createModel, updateModel as apiUpdateModel, deleteModel as apiDeleteModel } from '../../api2/equipment';
  import type { Model, ModelWithBrand, CreateModelRequest, UpdateModelRequest } from '../../api2/equipment';
  import { onMount } from 'svelte';
  import ActionBtn from '../UI/ActionBtn.svelte';
  import { rfState } from '../../rf.svelte';

  // State variables
  let state = $state({
    models: [] as ModelWithBrand[],
    isLoading: false,
    error: null as string | null,
    newModel: {
      brand_name: '',
      model_cat_id: null as number | null,
      model_name: '',
    },
    editingId: null as number | null,
    editingModel: null as ModelWithBrand | null,
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    uploadProgress: 0,
    uploadStatus: '' as 'idle' | 'uploading' | 'success' | 'error',
    uploadedData: null as any[] | null,
    showUploadForm: false
  });

  // Fetch models
  async function loadModels() {
    state.isLoading = true;
    try {
      const response = await listModels();
      if (response.error && response.error.message && response.error.message.trim() !== '') {
        state.error = response.error.message;
      } else {
        state.models = response.data || [];
        state.totalItems = response.data?.length || 0;
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to load models';
      console.error('Error loading models:', err);
    } finally {
      state.isLoading = false;
    }
  }


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
          const createRequest: CreateModelRequest = {
            brand_name: item.brand_name || '',
            model_cat_id: item.model_cat_id || null,
            model_name: item.model_name || '',
          };
          await createModel(createRequest);
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
          const createRequest: CreateModelRequest = {
            brand_name: item.brand_name || '',
            model_cat_id: item.model_cat_id ? parseInt(item.model_cat_id) : null,
            model_name: item.model_name || '',
          };
          await createModel(createRequest);
        }
      }

      state.uploadStatus = 'success';
      await loadModels(); // Refresh the list
    } catch (err) {
      state.uploadStatus = 'error';
      state.error = err instanceof Error ? err.message : 'Failed to process file';
    }
  }

  // Add new model
  async function addModel() {
    try {
      const createRequest: CreateModelRequest = {
        brand_name: state.newModel.brand_name,
        model_cat_id: state.newModel.model_cat_id,
        model_name: state.newModel.model_name,
      };

      const response = await createModel(createRequest);
      if (response.error && response.error.message !== null) {
        state.error = response.error.message;
      } else {
        loadModels();
        state.newModel = {
          brand_name: '',
          model_cat_id: null,
          model_name: '',
        };
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to add model';
      console.error('Error adding model:', err);
    }
  }

  // Update model
  async function updateModel() {
    if (!state.editingModel || !state.editingId) return;

    try {
      const updateRequest: UpdateModelRequest = {
        brand_name: state.editingModel.brand_name,
        model_cat_id: state.editingModel.model_cat_id,
        model_name: state.editingModel.model_name,
      };

      const response = await apiUpdateModel(
        state.editingId,
        updateRequest
      );
      if (response.error && response.error.message !== null) {
        state.error = response.error.message;
      } else {
        loadModels();
        state.editingId = null;
        state.editingModel = null;
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to update model';
      console.error('Error updating model:', err);
    }
  }

  // Delete model
  async function deleteModel(id: number) {
    if (!confirm('Are you sure you want to delete this model?')) return;

    try {
      const response = await apiDeleteModel(id);
      if (response.error && response.error.message !== null) {
        state.error = response.error.message;
      } else {
        loadModels();
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to delete model';
      console.error('Error deleting model:', err);
    }
  }

  // Set model for editing
  function startEditing(model: ModelWithBrand) {
    state.editingId = model.model_id;
    state.editingModel = { ...model };
  }

  // Cancel editing
  function cancelEditing() {
    state.editingId = null;
    state.editingModel = null;
  }

  // Navigation functions for pagination
  function goToPage(page: number) {
    const totalPages = Math.ceil(state.totalItems / state.itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      state.currentPage = page;
    }
  }

  function nextPage() {
    const totalPages = Math.ceil(state.totalItems / state.itemsPerPage);
    if (state.currentPage < totalPages) {
      state.currentPage++;
    }
  }

  function prevPage() {
    if (state.currentPage > 1) {
      state.currentPage--;
    }
  }

  // Initialize data
  onMount(loadModels);
</script>

<div class="models-view">
  <h4 class="mb-4">Models</h4>

  {#if state.error}
    <div class="alert alert-danger" role="alert">
      {state.error}
      <button type="button" class="btn-close" onclick={() => state.error = null}></button>
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
          <label for="modelFile" class="form-label">Upload Dealer JSON, TSV, or CSV</label>
          <input
            type="file"
            class="form-control bg-secondary text-light"
            id="modelFile"
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
            Models imported successfully!
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

  <!-- Add Model Form -->
  <div class="card bg-dark text-light mb-4">
    <div class="card-header">
      <h5 class="mb-0">Add New Model</h5>
    </div>
    <div class="card-body">
      {#if !rfState.cachedEnums?.brands || !rfState.cachedEnums?.modelCategories}
        <div class="alert alert-warning" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Loading reference data... Please wait while brands and categories are loaded.
        </div>
      {:else}
        <div class="row g-3">
          <div class="col-md-6">
            <label for="modelName" class="form-label">Model Name</label>
            <input
              type="text"
              class="form-control bg-secondary text-light"
              id="modelName"
              bind:value={state.newModel.model_name}
              placeholder="Enter model name"
            />
          </div>
          <div class="col-md-3">
            <label for="brandName" class="form-label">Brand Name</label>
            <select
              class="form-control bg-secondary text-light"
              id="brandName"
              bind:value={state.newModel.brand_name}
            >
              <option value="">Select Brand</option>
              {#if rfState.cachedEnums?.brands}
                {#each rfState.cachedEnums.brands as brand}
                  <option value={brand.brand_name}>
                    {brand.brand_name}
                  </option>
                {/each}
              {/if}
            </select>
          </div>
          <div class="col-md-3">
            <label for="modelCatId" class="form-label">Category</label>
            <select
              class="form-control bg-secondary text-light"
              id="modelCatId"
              bind:value={state.newModel.model_cat_id}
            >
              <option value="">Select Category</option>
              {#if rfState.cachedEnums?.modelCategories}
                {#each rfState.cachedEnums.modelCategories as category}
                  <option value={category.model_cat_id}>
                    {category.cat_name}
                  </option>
                {/each}
              {/if}
            </select>
          </div>
        </div>
        <div class="mt-3">
          <button
            class="btn btn-primary"
            onclick={addModel}
            disabled={!state.newModel.model_name}
          >
            <i class="bi bi-plus-lg me-2"></i>
            Add Model
          </button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Models Table -->
  <div class="card bg-dark text-light">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Models ({state.totalItems})</h5>
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
                <th>Model Name</th>
                <th>Brand Name</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each state.models as model, i}
                {#if i >= (state.currentPage - 1) * state.itemsPerPage && i < Math.min((state.currentPage - 1) * state.itemsPerPage + state.itemsPerPage, state.totalItems)}
                  {#if state.editingId === model.model_id}
                    <tr>
                      <td>{model.model_id}</td>
                      <td>
                        <input
                          type="text"
                          class="form-control bg-secondary text-light"
                          bind:value={state.editingModel!.model_name}
                          placeholder="Model name"
                        />
                      </td>
                      <td>
                        <select
                          class="form-control bg-secondary text-light"
                          bind:value={state.editingModel!.brand_name}
                        >
                          <option value="">Select Brand</option>
                          {#if rfState.cachedEnums?.brands}
                            {#each rfState.cachedEnums.brands as brand}
                              <option value={brand.brand_name}>
                                {brand.brand_name}
                              </option>
                            {/each}
                          {/if}
                        </select>
                      </td>
                      <td>
                        <select
                          class="form-control bg-secondary text-light"
                          bind:value={state.editingModel!.model_cat_id}
                        >
                          <option value="">Select Category</option>
                          {#if rfState.cachedEnums?.modelCategories}
                            {#each rfState.cachedEnums.modelCategories as category}
                              <option value={category.model_cat_id}>
                                {category.cat_name}
                              </option>
                            {/each}
                          {/if}
                        </select>
                      </td>
                      <td>
                        <ActionBtn
                          icon="check-lg"
                          title="Update"
                          variant="success"
                          size="sm"
                          onClick={updateModel}
                        />
                        <ActionBtn
                          icon="x-lg"
                          title="Cancel"
                          variant="secondary"
                          size="sm"
                          onClick={cancelEditing}
                        />
                      </td>
                    </tr>
                  {:else}
                    <tr>
                      <td>{model.model_id}</td>
                      <td>{model.model_name}</td>
                      <td>{model.brand_name}</td>
                      <td>
                        {#if model.model_cat_id && rfState.cachedEnums?.modelCategories}
                          {rfState.cachedEnums.modelCategories.find(cat => cat.model_cat_id === model.model_cat_id)?.cat_name || 'Unknown Category'}
                        {:else if model.model_cat_id}
                          Unknown Category
                        {:else}
                          -
                        {/if}
                      </td>
                      <td>
                        <ActionBtn
                          icon="pencil"
                          title="Edit"
                          variant="outline-primary"
                          size="sm"
                          onClick={() => startEditing(model)}
                        />
                        <ActionBtn
                          icon="trash"
                          title="Delete"
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteModel(model.model_id)}
                        />
                      </td>
                    </tr>
                  {/if}
                {/if}
              {/each}
              {#if state.models.length > 0 && state.models.slice((state.currentPage - 1) * state.itemsPerPage, Math.min((state.currentPage - 1) * state.itemsPerPage + state.itemsPerPage, state.totalItems)).length === 0}
                <tr>
                  <td colspan="5" class="text-center text-muted py-4">
                    No models found on this page
                  </td>
                </tr>
              {/if}
              {#if state.models.length === 0}
                <tr>
                  <td colspan="5" class="text-center text-muted py-4">
                    No models found
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
              Showing {(state.currentPage - 1) * state.itemsPerPage + 1} to {Math.min(state.currentPage * state.itemsPerPage, state.totalItems)} of {state.totalItems} entries
            </div>
            <div>
              <nav aria-label="Models pagination">
                <ul class="pagination mb-0">
                  <li class="page-item {state.currentPage === 1 ? 'disabled' : ''}">
                    <button class="page-link" onclick={() => prevPage()} type="button">
                      Previous
                    </button>
                  </li>
                  {#each Array.from({ length: Math.ceil(state.totalItems / state.itemsPerPage) }, (_, i) => i + 1) as pageNum}
                    <li class="page-item {state.currentPage === pageNum ? 'active' : ''}">
                      <button class="page-link" onclick={() => goToPage(pageNum)} type="button">
                        {pageNum}
                      </button>
                    </li>
                  {/each}
                  <li class="page-item {state.currentPage === Math.ceil(state.totalItems / state.itemsPerPage) ? 'disabled' : ''}">
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