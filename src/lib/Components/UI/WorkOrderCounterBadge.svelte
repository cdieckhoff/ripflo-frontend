<script>
  // Props
  let { count = 0, color = '#007bff', disabled = false } = $props();

  // Local state
  let size = $state('medium'); // small, medium, large
</script>

<span class="work-order-counter-badge" style="background-color: {color};">
  {count}
</span>