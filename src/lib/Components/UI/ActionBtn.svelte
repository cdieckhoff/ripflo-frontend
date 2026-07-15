<script lang="ts">
  let {
    onClick = () => {},
    icon,
    title,
    variant = 'outline-primary',
    size = 'sm',
    disabled = false
  } = $props<{
    onClick?: (e: MouseEvent) => void;
    icon: string;
    title: string;
    variant?: string;
    size?: string;
    disabled?: boolean;
  }>();

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    if (!disabled) {
      onClick(e);
    }
  }
</script>

<button
  class="btn btn-{variant} btn-{size}"
  onclick={handleClick}
  title={title}
  disabled={disabled}
>
  <i class="bi bi-{icon}"></i>
</button>
