<script lang="ts">
  import { type Brand } from '../../api/endpoints/brands';
  import { listBrands, createBrand, updateBrand as apiUpdateBrand, deleteBrand as apiDeleteBrand } from '../../api/endpoints/brands';
  import { onMount } from 'svelte';
  import ActionBtn from '../UI/ActionBtn.svelte';

  // State variables
  let state = $state({
    brands: [] as Brand[],
    isLoading: false,
    error: null as string | null,
    newBrand: {
      name: '',
    },
    editingId: null as number | null,
    editingBrand: null as Brand | null,
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    uploadProgress: 0,
    uploadStatus: '' as 'idle' | 'uploading' | 'success' | 'error',
    uploadedData: null as any[] | null,
    showUploadForm: false
  });

  // Fetch brands
  async function loadBrands() {
    state.isLoading = true;
    try {
      const response = await listBrands();
      // Proper error checking following the pattern from instructions
      if (response.error && response.error.message && response.error.message.trim() !== '') {
        state.error = response.error.message;
      } else {
        state.brands = response.data || [];
        state.totalItems = response.data?.length || 0;
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to load brands';
      console.error('Error loading brands:', err);
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
          await createBrand({
            name: item.name || ''
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
          await createBrand({
            name: item.name || ''
          });
        }
      }
      
      state.uploadStatus = 'success';
      await loadBrands(); // Refresh the list
    } catch (err) {
      state.uploadStatus = 'error';
      state.error = err instanceof Error ? err.message : 'Failed to process file';
    }
  }

  // Add new brand
  async function addBrand() {
    try {
      const response = await createBrand(state.newBrand);
      // Proper error checking following the pattern from instructions
      if (response.error && response.error.message && response.error.message.trim() !== '') {
        state.error = response.error.message;
      } else {
        loadBrands();
        state.newBrand = {
          name: '',
        };
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to add brand';
      console.error('Error adding brand:', err);
    }
  }

  // Update brand
  async function updateBrand() {
    if (!state.editingBrand || !state.editingId) return;

    try {
      const response = await apiUpdateBrand(
        state.editingId,
        state.editingBrand
      );
      // Proper error checking following the pattern from instructions
      if (response.error && response.error.message && response.error.message.trim() !== '') {
        state.error = response.error.message;
      } else {
        loadBrands();
        state.editingId = null;
        state.editingBrand = null;
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to update brand';
      console.error('Error updating brand:', err);
    }
  }

  // Delete brand
  async function deleteBrand(id: number) {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    try {
      const response = await apiDeleteBrand(id);
      // Proper error checking following the pattern from instructions
      if (response.error && response.error.message && response.error.message.trim() !== '') {
        state.error = response.error.message;
      } else {
        loadBrands();
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to delete brand';
      console.error('Error deleting brand:', err);
    }
  }

  // Set brand for editing
  function startEditing(brand: Brand) {
    state.editingId = brand.brand_id;
    state.editingBrand = { ...brand };
  }

  // Cancel editing
  function cancelEditing() {
    state.editingId = null;
    state.editingBrand = null;
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
  onMount(loadBrands);
</script>

<div class="brands-view">
  <h4 class="mb-4">Brands</h4>

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
          <label for="brandFile" class="form-label">Upload Dealer JSON, TSV, or CSV</label>
          <input
            type="file"
            class="form-control bg-secondary text-light"
            id="brandFile"
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
            Brands imported successfully!
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

  <!-- Add Brand Form -->
  <div class="card bg-dark text-light mb-4">
    <div class="card-header">
      <h5 class="mb-0">Add New Brand</h5>
    </div>
    <div class="card-body">
      <div class="mb-3">
        <label for="brandName" class="form-label">Brand Name</label>
        <input
          type="text"
          class="form-control bg-secondary text-light"
          id="brandName"
          bind:value={state.newBrand.name}
          placeholder="Enter brand name"
        />
      </div>
      <div>
        <button 
          class="btn btn-primary" 
          onclick={addBrand}
          disabled={!state.newBrand.name}
        >
          <i class="bi bi-plus-lg me-2"></i>
          Add Brand
        </button>
      </div>
    </div>
  </div>

  <!-- Brands Table -->
  <div class="card bg-dark text-light">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Brands ({state.totalItems})</h5>
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
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each state.brands as brand, i}
                {#if i >= (state.currentPage - 1) * state.itemsPerPage && i < Math.min((state.currentPage - 1) * state.itemsPerPage + state.itemsPerPage, state.totalItems)}
                  {#if state.editingId === brand.brand_id}
                    <tr>
                      <td>{brand.brand_id}</td>
                      <td>
                        <input
                          type="text"
                          class="form-control bg-secondary text-light"
                          bind:value={state.editingBrand!.name}
                          placeholder="Brand name"
                        />
                      </td>
                      <td>
                        <ActionBtn
                          icon="check-lg"
                          title="Save changes"
                          variant="success"
                          size="sm"
                          onClick={updateBrand}
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
                      <td>{brand.brand_id}</td>
                      <td>{brand.name}</td>
                      <td>
                        <ActionBtn
                          icon="pencil"
                          title="Edit brand"
                          variant="outline-primary"
                          size="sm"
                          onClick={() => startEditing(brand)}
                        />
                        <ActionBtn
                          icon="trash"
                          title="Delete brand"
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteBrand(brand.brand_id)}
                        />
                      </td>
                    </tr>
                  {/if}
                {/if}
              {/each}
              {#if state.brands.length > 0 && state.brands.slice((state.currentPage - 1) * state.itemsPerPage, Math.min((state.currentPage - 1) * state.itemsPerPage + state.itemsPerPage, state.totalItems)).length === 0}
                <tr>
                  <td colspan="3" class="text-center text-muted py-4">
                    No brands found on this page
                  </td>
                </tr>
              {/if}
              {#if state.brands.length === 0}
                <tr>
                  <td colspan="3" class="text-center text-muted py-4">
                    No brands found
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
              <nav aria-label="Brands pagination">
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