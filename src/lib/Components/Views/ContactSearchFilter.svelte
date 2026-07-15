<script>

  // Props
  let { disabled = false } = $props();

  // Local state
  let searchTerm = $state('');
  let filterType = $state('all'); // 'all', 'customer', 'vendor', 'both'
  let sortBy = $state('name'); // 'name', 'date', 'type'
  let showFilters = $state(false);

  // Filter types
  let filterTypes = $state([
    { id: 'all', label: 'All Contacts' },
    { id: 'customer', label: 'Customers Only' },
    { id: 'vendor', label: 'Vendors Only' }
  ]);

  // Sort options
  let sortOptions = $state([
    { id: 'name', label: 'Name (A-Z)' },
    { id: 'name-reverse', label: 'Name (Z-A)' },
    { id: 'date', label: 'Date Added' },
    { id: 'type', label: 'Contact Type' }
  ]);

  // Handle search term change
  function handleSearchChange(e) {
    searchTerm = e.target.value;
    
    // Dispatch event to parent
    const event = new CustomEvent('search', { detail: { term: searchTerm } });
    dispatchEvent(event);
  }

  // Handle filter type change
  function handleFilterChange(e) {
    filterType = e.target.value;
    
    // Dispatch event to parent
    const event = new CustomEvent('filter', { detail: { type: filterType } });
    dispatchEvent(event);
  }

  // Handle sort change
  function handleSortChange(e) {
    sortBy = e.target.value;
    
    // Dispatch event to parent
    const event = new CustomEvent('sort', { detail: { by: sortBy } });
    dispatchEvent(event);
  }

  // Toggle filters visibility
  function toggleFilters() {
    showFilters = !showFilters;
  }
</script>

<div class="contact-search-filter">
  <div class="search-bar">
    <input
      type="text"
      placeholder="Search contacts..."
      bind:value={searchTerm}
      oninput={handleSearchChange}
      disabled={disabled}
    />
    <button 
      type="button" 
      onclick={toggleFilters}
      disabled={disabled}
      title="Toggle Filters"
    >
      {showFilters ? 'Hide Filters' : 'Show Filters'}
    </button>
  </div>

  {#if showFilters}
    <div class="filter-options">
      <div class="filter-group">
        <label for="filter-type">Contact Type:</label>
        <select
          id="filter-type"
          value={filterType}
          onchange={handleFilterChange}
          disabled={disabled}
        >
          {#each filterTypes as type}
            <option value={type.id}>{type.label}</option>
          {/each}
        </select>
      </div>

      <div class="filter-group">
        <label for="sort-by">Sort By:</label>
        <select
          id="sort-by"
          value={sortBy}
          onchange={handleSortChange}
          disabled={disabled}
        >
          {#each sortOptions as option}
            <option value={option.id}>{option.label}</option>
          {/each}
        </select>
      </div>
    </div>
  {/if}
</div>