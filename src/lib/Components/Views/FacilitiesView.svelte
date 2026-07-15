<script lang="ts">
  import { type Facility } from '../../api/endpoints/facilities';
  import { listFacilities, createFacility, updateFacility as apiUpdateFacility, deleteFacility as apiDeleteFacility } from '../../api/endpoints/facilities';
  import { onMount } from 'svelte';
  import AddFacility from '../Modals/Facilities/AddFacility.svelte';
  import ActionIcon2 from '../UI/ActionIcon2.svelte';
  import ActionBtn from '../UI/ActionBtn.svelte';

  // Props - optional to allow this component to work standalone or with parent state
  let props = $props<{ state?: any }>();

  // State variables - use props.state if available, otherwise local state
  let state = $state({
    facilities: props.state?.facilities || [] as Facility[],
    isLoading: false,
    error: null as string | null,
    newFacility: {
      fac_name: '',
      fac_short: '',
      fac_zip: 0,
      is_active: 1 as 0 | 1,
    },
    editingId: null as number | null,
    editingFacility: null as Facility | null,
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: props.state?.facilities?.length || 0,
    showAddFacilityModal: false,
  });

  // Effect to update state when parent state changes
  $effect(() => {
    if (props.state?.facilities) {
      state.facilities = props.state.facilities || [];
      state.totalItems = props.state.facilities.length || 0;
      // Ensure current page is valid
      const totalPages = Math.ceil(state.totalItems / state.itemsPerPage);
      if (state.currentPage > totalPages && totalPages > 0) {
        state.currentPage = totalPages;
      } else if (totalPages === 0) {
        state.currentPage = 1;
      }
    }
  });


  // Fetch facilities
  async function loadFacilities() {
    state.isLoading = true;
    try {
      const response = await listFacilities();
      if (response.error && response.error.message !== null) {
        state.error = response.error.message;
      } else {
        state.facilities = response.data || [];
        state.totalItems = response.data?.length || 0;
        // Set current page to 1 if we're beyond the available pages after load
        const totalPages = Math.ceil(state.totalItems / state.itemsPerPage);
        if (state.currentPage > totalPages && totalPages > 0) {
          state.currentPage = totalPages;
        } else if (totalPages === 0) {
          state.currentPage = 1;
        }
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to load facilities';
      console.error('Error loading facilities:', err);
    } finally {
      state.isLoading = false;
    }
  }

  // Initialize data only if not using parent state
  if (!props.state) {
    onMount(loadFacilities);
  }

  // Add new facility
  function openAddFacilityModal() {
    state.showAddFacilityModal = true;
  }

  function handleFacilityAdded() {
    loadFacilities();
    state.showAddFacilityModal = false;
  }

  // Update facility
  async function updateFacility() {
    if (!state.editingFacility || !state.editingId) return;

    try {
      const response = await apiUpdateFacility(
        state.editingId,
        state.editingFacility
      );
      if (response.error && response.error.message !== null) {
        state.error = response.error.message;
      } else {
        loadFacilities();
        state.editingId = null;
        state.editingFacility = null;
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to update facility';
      console.error('Error updating facility:', err);
    }
  }

  // Delete facility
  async function deleteFacility(id: number) {
    if (!confirm('Are you sure you want to delete this facility?')) return;

    try {
      const response = await apiDeleteFacility(id);
      if (response.error && response.error.message !== null) {
        state.error = response.error.message;
      } else {
        loadFacilities();
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to delete facility';
      console.error('Error deleting facility:', err);
    }
  }

  // Set facility for editing
  function startEditing(facility: Facility) {
    state.editingId = facility.fac_id;
    state.editingFacility = { ...facility };
  }

  // Cancel editing
  function cancelEditing() {
    state.editingId = null;
    state.editingFacility = null;
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
  onMount(loadFacilities);
</script>

<div class="facilities-view">
  <h4 class="mb-4">Facilities</h4>

  {#if state.error}
    <div class="alert alert-danger" role="alert">
      {state.error}
      <button title="Close" type="button" class="btn-close" onclick={() => state.error = null}></button>
    </div>
  {/if}

  <!-- Add Facility Button -->
  <div class="d-flex justify-content-end mb-3">
    <ActionIcon2
      props="bi-building"
      action="Add Facility"
      text="Add"
      onClick={openAddFacilityModal}
    />
  </div>

  <!-- Facilities Table -->
  <div class="card bg-dark text-light">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Facilities ({state.totalItems})</h5>
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
                <th>Short Name</th>
                <th>ZIP</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each state.facilities as facility, i}
                {#if i >= (state.currentPage - 1) * state.itemsPerPage && i < Math.min((state.currentPage - 1) * state.itemsPerPage + state.itemsPerPage, state.totalItems)}
                  {#if state.editingId === facility.fac_id}
                    <tr>
                      <td>{facility.fac_id}</td>
                      <td>
                        <input
                          type="text"
                          class="form-control bg-secondary text-light"
                          bind:value={state.editingFacility!.fac_name}
                          placeholder="Facility name"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          class="form-control bg-secondary text-light"
                          bind:value={state.editingFacility!.fac_short}
                          placeholder="Short name"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          class="form-control bg-secondary text-light"
                          bind:value={state.editingFacility!.fac_zip}
                          placeholder="ZIP"
                        />
                      </td>
                      <td>
                        <div class="form-check form-switch">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            checked={state.editingFacility!.is_active === 1}
                            onchange={() => state.editingFacility!.is_active = state.editingFacility!.is_active ? 0 : 1}
                          />
                        </div>
                      </td>
                      <td>
                        <ActionBtn
                          icon="check-lg"
                          title="Create"
                          variant="success"
                          size="sm"
                          onClick={updateFacility}
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
                      <td>{facility.fac_id}</td>
                      <td>{facility.fac_name}</td>
                      <td>{facility.fac_short}</td>
                      <td>{facility.fac_zip}</td>
                      <td>
                        {#if facility.is_active === 1}
                          <span class="badge bg-success">Active</span>
                        {:else}
                          <span class="badge bg-secondary">Inactive</span>
                        {/if}
                      </td>
                      <td>
                        <ActionBtn
                          icon="pencil"
                          title="Edit"
                          variant="outline-primary"
                          size="sm"
                          onClick={() => startEditing(facility)}
                        />
                        <ActionBtn
                          icon="trash"
                          title="Delete"
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteFacility(facility.fac_id)}
                        />
                      </td>
                    </tr>
                  {/if}
                {/if}
              {/each}
              {#if state.facilities.length > 0 && state.facilities.slice((state.currentPage - 1) * state.itemsPerPage, Math.min((state.currentPage - 1) * state.itemsPerPage + state.itemsPerPage, state.totalItems)).length === 0}
                <tr>
                  <td colspan="6" class="text-center text-muted py-4">
                    No facilities found on this page
                  </td>
                </tr>
              {/if}
              {#if state.facilities.length === 0}
                <tr>
                  <td colspan="6" class="text-center text-muted py-4">
                    No facilities found
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
              {#if state.facilities.length > 0}
                Showing {(state.currentPage - 1) * state.itemsPerPage + 1} to {Math.min(state.currentPage * state.itemsPerPage, state.totalItems)} of {state.totalItems} entries
              {/if}
            </div>
            <div>
              <nav aria-label="Facilities pagination">
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

  {#if state.showAddFacilityModal}
    <AddFacility
      onClose={() => state.showAddFacilityModal = false}
      onFacilityAdded={handleFacilityAdded}
    />
  {/if}
</div>