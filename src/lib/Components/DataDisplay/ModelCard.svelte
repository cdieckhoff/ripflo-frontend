<script>
  ;

  // Props
  let { model } = $props();
  let { disabled = false } = $props();
  let { onClick } = $props();

  // Local state for expanded view
  let expanded = $state(false);

  // Toggle expanded view
  function toggleExpanded() {
    if (onClick) {
      onClick(model);
    } else {
      expanded = !expanded;
    }
  }
</script>

<div class="model-card" onclick={toggleExpanded}>
  <div class="card-header">
    <h3>{model.model_name}</h3>
    {model.brand && <span class="brand">{model.brand.brand_name}</span>}
  </div>
  
  <div class="card-body">
    <div class="model-info">
      {#if model.model_number}
        <div class="info-item">
          <strong>Model #:</strong> {model.model_number}
        </div>
      {/if}
      
      {#if model.category}
        <div class="info-item">
          <strong>Category:</strong> {model.category.name}
        </div>
      {/if}
      
      {#if model.manufacturing_date}
        <div class="info-item">
          <strong>Manufactured:</strong> {new Date(model.manufacturing_date).toLocaleDateString()}
        </div>
      {/if}
    </div>
    
    {#if expanded}
      <div class="expanded-info">
        {#if model.serial_number}
          <div class="info-item">
            <strong>Serial #:</strong> {model.serial_number}
          </div>
        {/if}
        
        {#if model.created_at}
          <div class="info-item">
            <strong>Created:</strong> {new Date(model.created_at).toLocaleDateString()}
          </div>
        {/if}
      </div>
    {/if}
  </div>
  
  <div class="card-footer">
    <button 
      type="button" 
      onclick={(e) => {e.stopPropagation(); toggleExpanded();}}
      disabled={disabled}
      title={expanded ? "Show Less" : "Show More"}
    >
      {expanded ? 'Show Less' : 'Show More'}
    </button>
  </div>
</div>