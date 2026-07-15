<script lang="ts">
  import { type Contact } from '../../api/endpoints/contacts';
  import { type WorkOrderSearchResult } from '../../api/endpoints/workorders';
  import { type AssetSearchResult, type Asset } from '../../api/endpoints/assets';
  import { type ModelWithBrandResponse, type BrandResponse, searchModelsByBrandModel, searchModelsGeneral, searchBrandsByName, searchBrandsGeneral } from '../../api/endpoints/models';
  import { searchContacts } from '../../api/endpoints/contacts';
  import { searchWorkOrders } from '../../api/endpoints/workorders';
  import { searchAssets } from '../../api/endpoints/assets';
  import {rfState} from '../../rf.svelte';

  // Define types for our entities
  type EntityType = 'contact' | 'workorder' | 'asset' | 'model' | 'brand';

  // Define a union type for our search results
  type SearchResult = Contact | WorkOrderSearchResult | AssetSearchResult | ModelWithBrandResponse | BrandResponse;

  let {
    onSelect,
    onAdd,
    entityType = 'contact' as EntityType
  } = $props<{
    onSelect: (entity: SearchResult) => void;
    onAdd: () => void;
    entityType?: EntityType;
  }>();

  let searchTerm = $state('');
  let searchResults = $state<SearchResult[]>([]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  // Function to search based on entity type
  async function searchEntities() {
    if (!searchTerm.trim()) {
      searchResults = [];
      error = null;
      return;
    }

    isLoading = true;
    error = null;

    try {
      let result: any;

      switch (entityType) {
        case 'contact':
          result = await searchContacts(searchTerm);
          if (result.error && result.error.message) {
            throw new Error(result.error.message);
          }
          searchResults = result.data || [];
          break;

        case 'workorder':
          result = await searchWorkOrders(searchTerm);
          if (result.error && result.error.message) {
            throw new Error(result.error.message);
          }
          searchResults = result.data || [];
          break;

        case 'asset':
          result = await searchAssets(searchTerm);
          if (result.error && result.error.message) {
            throw new Error(result.error.message);
          }
          searchResults = result.data || [];
          break;

        case 'model':
          // For model search, we can use specific search if both brand and model are provided
          // For now, using general search
          result = await searchModelsGeneral(searchTerm);
          if (result.error && result.error.message) {
            throw new Error(result.error.message);
          }
          searchResults = result.data || [];
          break;

        case 'brand':
          // For brand search
          result = await searchBrandsGeneral(searchTerm);
          if (result.error && result.error.message) {
            throw new Error(result.error.message);
          }
          searchResults = result.data || [];
          break;

        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred during search';
      console.error(`Error searching ${entityType}s:`, err);
      searchResults = [];
    } finally {
      isLoading = false;
    }
  }

  // Helper functions to determine search type
  function isAlpha(str: string) {
    return /^[a-zA-Z\s]+$/.test(str.trim());
  }

  function isPhone(str: string) {
    const cleaned = str.replace(/[\s\-\(\)\.]/g, '');
    return /^\d{7,15}$/.test(cleaned);
  }

  function isEmail(str: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  function clearSearch() {
    searchTerm = '';
    searchResults = [];
    error = null;
  }

  function handleSelect(entity: SearchResult) {
    onSelect(entity);
    searchTerm = '';
    searchResults = [];
    error = null;
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      searchEntities();
    }
  }


  // Get placeholder text based on entity type
  let placeholderText = $derived.by(() => {
    switch (entityType) {
      case 'contact':
        return 'Search contacts by name, phone or email...';
      break
      case 'workorder':
        return 'Search work orders by number, customer, or asset...';
      break;
      case 'asset':
        return 'Search assets by name, brand, model, or serial number...';
      break;
      case 'model':
        return 'Search models by name or brand...';
      break;
      case 'brand':
        return 'Search brands...';
      break;
      default:
        return 'Search...';
      break;
    }
  });
</script>

<div class="input-group">
  <input
    type="text"
    class="form-control"
    id="entity-search"
    placeholder={placeholderText}
    bind:value={searchTerm}
    onkeypress={handleKeyPress}
  >
  <button class="btn btn-outline-secondary" onclick={searchEntities} title="Search">
    <i class="bi bi-search"></i>
  </button>
  <button class="btn btn-outline-secondary" onclick={clearSearch} title="Clear Search">
    <i class="bi bi-x-lg"></i>
  </button>
  <button class="btn btn-outline-success" onclick={onAdd} title="Add New {entityType === 'contact' ? 'Contact' : entityType === 'workorder' ? 'Work Order' : entityType === 'model' ? 'Model' : entityType === 'brand' ? 'Brand' : 'Asset'}">
    <i class="bi bi-plus-circle"></i>
  </button>
</div>

{#if error}
  <div class="alert alert-danger mt-2">{error}</div>
{:else if isLoading}
  <div class="alert alert-info mt-2">Searching {entityType}s...</div>
{:else if searchResults.length > 0}
  <div class="list-group mt-2">
    {#each searchResults as entity, i}
      <button
        class="list-group-item list-group-item-action"
        onclick={(e: MouseEvent) => { e.preventDefault(); handleSelect(entity); }}
        title="Select {entityType === 'contact' ? (entity as Contact).display_name :
                  entityType === 'workorder' ? `WO ${(entity as WorkOrderSearchResult).subject}` :
                  entityType === 'asset' ? `${(entity as Asset).brand_name} ${(entity as Asset).model_name}` :
                  entityType === 'model' ? `${(entity as ModelWithBrandResponse).brand_name} ${(entity as ModelWithBrandResponse).model_name}` :
                  entityType === 'brand' ? (entity as BrandResponse).name : 'Entity'}"
        type="button"
      >
        {#if entityType === 'contact'}
          <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">{(entity as Contact).display_name}</h6>
            {#if (entity as Contact).phones && (entity as Contact).phones.length > 0}
              <small>{(entity as Contact).phones[0].formatted_phone}</small>
            {/if}
          </div>
          {#if (entity as Contact).emails && (entity as Contact).emails.length > 0}
            <p class="mb-1">{(entity as Contact).emails[0].email}</p>
          {/if}
        {:else if entityType === 'workorder'}
          <div class="d-flex w-100 justify-content-between align-items-start">
            <h6 class="mb-1">{(entity as WorkOrderSearchResult).wo_text || `WO ${(entity as WorkOrderSearchResult).subject}`}</h6>
          </div>
          <p class="mb-1">
            <i class="bi bi-person me-1"></i>
            {(entity as WorkOrderSearchResult).contact_name}
          </p>
          {#if (entity as WorkOrderSearchResult).brand_name || (entity as WorkOrderSearchResult).model_name}
            <p class="mb-1">
              {(entity as WorkOrderSearchResult).brand_name} {(entity as WorkOrderSearchResult).model_name}
            </p>
          {/if}
        {:else if entityType === 'asset'}
          <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">{(entity as Asset).brand_name} {(entity as Asset).model_name}</h6>
          </div>
          {#if (entity as Asset).serial_num}
            <p class="mb-1">Serial: {(entity as Asset).serial_num}</p>
          {/if}
          {#if (entity as Asset).custom_serial}
            <p class="mb-1">Custom Serial: {(entity as Asset).custom_serial}</p>
          {/if}
        {:else if entityType === 'model'}
          <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">{(entity as ModelWithBrandResponse).brand_name} {(entity as ModelWithBrandResponse).model_name}</h6>
          </div>
        {:else if entityType === 'brand'}
          <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">{(entity as BrandResponse).name}</h6>
          </div>
        {/if}
      </button>
    {/each}
  </div>
{:else if searchTerm}
  <div class="alert alert-info mt-2">No {entityType}s match your search.</div>
{/if}