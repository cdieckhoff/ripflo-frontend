<script lang="ts">
  let { onClick, props, action, text } = $props<{
    onClick: () => void;
    props: string;
    action: string;
    text: string;
  }>();

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    onClick();
  }
</script>

<div>
  <div class="d-flex justify-content-center align-items-center">
    <!-- svelte-ignore a11y_invalid_attribute -->
    <div class="">
      <a
        class="a24"
        href="#"
        target="_parent"
        title={action}
        onclick={(e: MouseEvent) => {
          handleClick(e);
        }}
      >
        <i class="bi {props}"></i>
      </a>
    </div>
  </div>
  <div class="divcontainer"><span>{text}</span></div>
</div>
