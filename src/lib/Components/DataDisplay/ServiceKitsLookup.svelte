<script lang="ts">
  import { onMount } from 'svelte';
  import { getServiceKits, type ServiceKitItem } from '../../api/endpoints/service-kits';
  import { toastStore } from '../../stores/toastStore';
  import ActionBtn from '../UI/ActionBtn.svelte';

  // Props
  let { onSelect = null } = $props<{
    onSelect?: ((item: ServiceKitItem) => void) | null;
  }>();

  // State
  let selectedEngine = $state('');
  let selectedHydro = $state('');
  let allServiceKits = $state<ServiceKitItem[]>([]); // All loaded data
  let searchResults = $state<ServiceKitItem[]>([]); // Filtered results
  let isLoading = $state(false);
  let page = $state(1);
  let limit = $state(50);
  let totalResults = $state(0);
  let totalPages = $state(0);

  // Available engine and hydro models
  let availableEngines = $state<string[]>([]);
  let availableHydros = $state<string[]>([]);
  let availableServiceTypes = $state<string[]>([]);

  // Common engine models
  const engineModels = [
    'KS590', 'FR730', 'FR651', 'FR691', 'FX751', 'FX850',
    'CV730', 'CV740', 'CV750', 'CH730', 'CH740', 'CH750',
    '7000', '7000PRO', '9000', '9000PRO'
  ];

  // Common hydro models
  const hydroModels = [
    'ZT2800', 'ZT3400', 'ZT-5400', 'ZT-3450', 'EZT-2200',
    'TJ260', 'TJ280', 'ZT3100', 'ZT5400'
  ];

  // Initialize available engines and hydros
  function loadFilters() {
    availableEngines = [...engineModels].sort();
    availableHydros = [...hydroModels].sort();
    console.log('Loaded filters - Engines:', availableEngines, 'Hydros:', availableHydros);
  }
  
  onMount(() => {
    loadFilters();
    loadServiceKits();
  });

  // Extract unique service types from results
  function extractServiceTypes(items: ServiceKitItem[]) {
    const types = [...new Set(items.map(item => item.service_type))].sort();
    if (types.length > 0) {
      availableServiceTypes = types;
    }
  }

  // Load service kits on mount
  async function loadServiceKits() {
    isLoading = true;
    try {
      const response = await getServiceKits({ page: 1, limit: 500 });
      console.log('Service kits response:', response);
      if (!response.error && response.data) {
        // Flatten the kits object into a single array
        const kits = response.data.kits || {};
        allServiceKits = Object.values(kits).flat();
        totalResults = response.data.total_results || allServiceKits.length;
        console.log('Loaded service kits:', allServiceKits.length);
        applyFilters();
      } else if (response.error) {
        toastStore.error(`Failed to load service kits: ${response.error.message}`);
      }
    } catch (error) {
      console.error('Error loading service kits:', error);
      toastStore.error('Failed to load service kits');
    } finally {
      isLoading = false;
    }
  }

  // Apply filters to allServiceKits
  function applyFilters() {
    let filtered = allServiceKits;

    console.log('Applying filters:', { selectedEngine, selectedHydro });
    console.log('Total items in allServiceKits:', allServiceKits.length);

    if (selectedEngine) {
      console.log('Filtering by engine:', selectedEngine);
      filtered = filtered.filter(item => {
        const model = item.component_model || item.model_name || '';
        return model.includes(selectedEngine);
      });
      console.log('After engine filter:', filtered.length);
    }
    if (selectedHydro) {
      console.log('Filtering by hydro:', selectedHydro);
      filtered = filtered.filter(item => {
        const model = item.component_model || item.model_name || '';
        return model.includes(selectedHydro);
      });
      console.log('After hydro filter:', filtered.length);
    }

    totalResults = filtered.length;
    totalPages = Math.ceil(totalResults / limit);

    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    searchResults = filtered.slice(start, end);

    extractServiceTypes(searchResults);
    console.log('Final filtered results:', searchResults.length, 'of', totalResults);
  }

  // Get model name from item
  function getModelName(item: ServiceKitItem): string {
    return item.component_model || item.model_name || 'Unknown';
  }

  // Get brand name from item
  function getBrandName(item: ServiceKitItem): string {
    return item.component_brand || item.mower_brand || item.part_brand || 'Unknown';
  }

  // Search service kits (applies filters)
  function searchServiceKits() {
    page = 1;
    applyFilters();
  }

  // Clear all filters
  function clearFilters() {
    selectedEngine = '';
    selectedHydro = '';
    page = 1;
    applyFilters();
  }

  // Pagination
  function goToPage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    page = newPage;
    applyFilters();
  }

  // Handle item selection
  function handleSelect(item: ServiceKitItem) {
    if (onSelect) {
      onSelect(item);
    }
  }

  // Get badge color for service type
  function getServiceTypeBadgeClass(serviceType: string): string {
    const typeLower = serviceType.toLowerCase();
    if (typeLower.includes('oil')) return 'bg-warning text-dark';
    if (typeLower.includes('tune')) return 'bg-primary';
    if (typeLower.includes('air')) return 'bg-info text-dark';
    if (typeLower.includes('filter')) return 'bg-success';
    return 'bg-secondary';
  }
</script>

<div class="card shadow-sm">
  <div class="card-header bg-primary text-white">
    <div class="d-flex justify-content-between align-items-center">
      <h5 class="mb-0">
        <i class="bi bi-gear-wide-connected me-2"></i>
        Service Kits Lookup
      </h5>
      <button 
        type="button" 
        class="btn btn-sm btn-outline-light" 
        title="Clear Filters"
        onclick={clearFilters}
      >
        <i class="bi bi-x-circle"></i> Clear
      </button>
    </div>
  </div>

  <div class="card-body">
    <!-- Search Filters -->
    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <label for="engineFilter" class="form-label">Engine Model</label>
        <select
          class="form-select"
          id="engineFilter"
          bind:value={selectedEngine}
          onchange={searchServiceKits}
        >
          <option value="">All Engines</option>
          {#each availableEngines as engine}
            <option value={engine}>{engine}</option>
          {/each}
        </select>
      </div>

      <div class="col-md-6">
        <label for="hydroFilter" class="form-label">Hydro Model</label>
        <select
          class="form-select"
          id="hydroFilter"
          bind:value={selectedHydro}
          onchange={searchServiceKits}
        >
          <option value="">All Hydros</option>
          {#each availableHydros as hydro}
            <option value={hydro}>{hydro}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="d-flex gap-2 mb-4">
      <ActionBtn
        color="primary"
        icon="bi-search"
        label="Search"
        onclick={searchServiceKits}
        disabled={isLoading}
      />
      {#if searchResults.length > 0}
        <span class="align-self-center text-muted">
          {totalResults} result{totalResults !== 1 ? 's' : ''} found
        </span>
      {/if}
    </div>

    <!-- Loading Indicator -->
    {#if isLoading}
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">Searching service kits...</p>
      </div>
    {:else}
      <!-- Results Table -->
      {#if searchResults.length > 0}
        <div class="table-responsive">
          <table class="table table-hover table-sm align-middle">
            <thead class="table-light">
              <tr>
                <th>Model</th>
                <th>Brand</th>
                <th>Service Type</th>
                <th>Category</th>
                <th>Part SKU</th>
                <th>Description</th>
                <th>Part Brand</th>
                <th>Qty</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {#each searchResults as item}
                <tr>
                  <td>
                    <strong>{getModelName(item)}</strong>
                  </td>
                  <td>{getBrandName(item)}</td>
                  <td>
                    <span class="badge {getServiceTypeBadgeClass(item.service_type)}">
                      {item.service_type}
                    </span>
                  </td>
                  <td>{item.category}</td>
                  <td>
                    <code class="text-primary">{item.part_sku}</code>
                  </td>
                  <td>{item.part_description}</td>
                  <td>{item.part_brand}</td>
                  <td class="text-center">
                    <span class="badge bg-secondary rounded-pill">
                      {item.qty_needed}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary"
                      title="Select this part"
                      onclick={() => handleSelect(item)}
                    >
                      <i class="bi bi-check-lg"></i> Select
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <nav aria-label="Service kits pagination">
          <ul class="pagination justify-content-center">
            <li class="page-item {page <= 1 ? 'disabled' : ''}">
              <button class="page-link" title="Previous page" onclick={() => goToPage(page - 1)}>
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            {#each Array.from({ length: totalPages }, (_, i) => i + 1) as pageNum}
              {#if pageNum === 1 || pageNum === totalPages || (pageNum >= page - 2 && pageNum <= page + 2)}
                <li class="page-item {pageNum === page ? 'active' : ''}">
                  <button class="page-link" onclick={() => goToPage(pageNum)}>{pageNum}</button>
                </li>
              {:else}
                {#if pageNum === page - 3 || pageNum === page + 3}
                  <li class="page-item disabled">
                    <span class="page-link">...</span>
                  </li>
                {/if}
              {/if}
            {/each}
            <li class="page-item {page >= totalPages ? 'disabled' : ''}">
              <button class="page-link" title="Next page" onclick={() => goToPage(page + 1)}>
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>

        <div class="text-center text-muted small">
          Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, totalResults)} of {totalResults} results
        </div>
      {:else}
        <!-- Empty State -->
        <div class="text-center py-5 text-muted">
          <i class="bi bi-search display-4"></i>
          <p class="mt-3 mb-0">
            {#if selectedEngine || selectedHydro}
              No service kits found. Try adjusting your filters.
            {:else}
              Select an engine or hydro model to find service kits.
            {/if}
          </p>
        </div>
      {/if}
    {/if}
  </div>
</div>
