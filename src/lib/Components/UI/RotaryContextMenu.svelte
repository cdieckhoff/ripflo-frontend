<script>
    // Component props
    let { menuData, statuses, onSelectStatus, onClose } = $props();

    // Filter statuses to only include those that are NOT the current status
    const availableStatuses = $derived(statuses.filter(s => (s.status || s.id) !== menuData.wo.status));

    // Calculate angle increment and offset based on the actual number of visible items
    const availableStatusCount = $derived(availableStatuses.length);

    // Base angle for rotation (360 degrees divided by the number of visible items)
    const angleIncrement = $derived(availableStatusCount > 0 ? 360 / availableStatusCount : 0); 
    
    // Offset to start at the top (e.g., -90 degrees)
    const initialOffset = -90; 

    // --- GEOMETRY CALCULATION FOR PERFECT ALIGNMENT (Your requested method) ---
    // 1. Define component sizes from CSS:
    const CENTER_DIAMETER = 60; // From .rotary-center width/height
    const ITEM_DIAMETER = 48;   // From .rotary-item width/height
    const GAP_SIZE = 10;        // Desired visible gap between center and items

    // 2. Calculate the required RADIUS (distance from center point to center of item):
    // Radius = (Center Diameter / 2) + GAP_SIZE + (Item Diameter / 2)
    const RADIUS = CENTER_DIAMETER / 2 + GAP_SIZE + ITEM_DIAMETER / 2; // 35 + 10 + 30 = 75

    // Helper to calculate the position of each button
    function calculatePosition(index) {
        // Calculate the angle for the current item
        const angle = initialOffset + index * angleIncrement;
        const radians = (angle * Math.PI) / 180;

        // Calculate x and y displacement
        const x = RADIUS * Math.cos(radians);
        const y = RADIUS * Math.sin(radians);

        return { x, y };
    }

    // Handle button click (status change)
    function handleButtonClick(statusId) {
        // Call the prop function provided by the parent
        onSelectStatus(statusId);
    }
</script>

<!-- The main overlay: fixed and full screen to catch clicks outside the menu -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore event_directive_deprecated -->
<div class="rotary-overlay" onclick={onClose}>
    <!-- The central anchor point for the menu, positioned at the click location -->
    <div 
        class="rotary-center shadow-lg" 
        style="
            transform: translate(calc({menuData.x}px), calc({menuData.y}px));
        "
        onclick={(e) => e.stopPropagation()} 
    >
        <i class="bi bi-gear-fill display-5 text-primary"></i>

        {#each availableStatuses as status, index (status.id)}
            {@const { x, y } = calculatePosition(index)}
            <!-- Individual menu item -->
            <button
                class="rotary-item btn btn-sm shadow"
                style="
                    --x: {x}px;
                    --y: {y}px;
                    background-color: #f0f0f0;
                    transform: translate(calc(var(--x)), calc(var(--y)));
                "
                onclick={() => handleButtonClick(status.id)}
                title={status.label}
            >
                <i class="status-icon status-{status.status || status.label || status.id}"></i>
            </button>
        {/each}
    </div>
</div>

<style>
    /* Overlay for the entire screen */
    .rotary-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1050; /* Above Bootstrap modals (1040) */
        background: rgba(0, 0, 0, 0.05); /* Subtle dimming */
        cursor: pointer;
    }

    /* Center point of the menu (positioned at click location) */
    .rotary-center {
        /* Set top/left to 0 (default for absolute, but explicit here for clarity) */
        top: 0;
        left: 0;
        position: absolute; 
        width: 60px; /* Center Diameter */
        height: 60px;
        box-sizing: border-box; 
        
        /* NOTE: The 'transform' in the inline style handles the positioning/centering */
        
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: white;
        z-index: 1051;
        cursor: default;
        border: 2px solid var(--bs-primary);
    }
    
    /* Individual menu items */
    .rotary-item {
        position: absolute;
        width: 48px; /* Status Item Diameter */
        height: 48px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 20px;
        transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
        text-align: center;
        padding: 0;
        line-height: 1;
        
        box-sizing: border-box; 
        /* Ensure the icon is centered and visible */
    }

    /* Fix: Ensure the full 'bi-icon-name' class is used on the <i> element */
    .rotary-item .item-icon {
        font-size: 20px; /* Increased size for visibility */
    }

    /* Hidden element for hover text */
    .rotary-item::after {
        content: attr(title); /* Get content from the 'title' attribute */
        position: absolute;
        top: -10px; /* Position above the button */
        background-color: #333;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s, visibility 0.2s, top 0.2s;
        z-index: 1053;
        font-size: 0.6rem;
        /* Center horizontally relative to the button */
        transform: translateX(-50%); 
        left: 50%;
    }

    /* Hover effect */
    .rotary-item:hover {
        /* Kept original position for cleaner look */
        transform: translate(calc(var(--x) - 50%), calc(var(--y) - 50%)); 
        filter: brightness(1.2);
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.5);
        z-index: 1052;
    }
    
    /* Show status text on hover */
    .rotary-item:hover::after {
        opacity: 1;
        visibility: visible;
        top: -30px; /* Move up slightly on hover */
    }

</style>