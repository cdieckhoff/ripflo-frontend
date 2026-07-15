<script lang="ts">
  import { onMount } from 'svelte';

  let currentTime = $state(new Date());

  onMount(() => {
    const interval = setInterval(() => {
      currentTime = new Date();
    }, 60000); // Update every minute instead of every second

    // Clear interval on component destruction
    return () => clearInterval(interval);
  });

  // Derived properties for formatting
  const formattedDate = $derived(
    currentTime.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  );

  const formattedTime = $derived(
    currentTime.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // Set to true/false as preferred
    })
  );
</script>

<div class="clock-container">
  <div class="time">{formattedTime}</div>
  <div class="date">{formattedDate}</div>
</div>

