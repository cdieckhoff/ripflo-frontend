<script lang="ts">
  let { onClick, props, action, text, isActive = false } = $props<{
    onClick?: () => void;
    props: string;
    action: string;
    text: string;
    isActive?: boolean;
  }>();

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    onClick?.();
  }
</script>

<div class={`action-icon ${isActive ? 'active' : ''}`}>
  <div class="icon-container">
    <!-- svelte-ignore a11y_invalid_attribute -->
    <a
      class={`action-link ${isActive ? 'active' : ''}`}
      target="_parent"
      href="#"
      title={action}
      onclick={handleClick}
    >
      <i class={`bi ${props} ${isActive ? 'active' : ''}`}></i>
    </a>
  </div>
  <div class="label-container">
    <span class={isActive ? 'active' : ''}>{text}</span>
  </div>
</div>

