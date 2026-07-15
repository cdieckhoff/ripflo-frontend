<script lang="ts">
  import { onMount } from "svelte";
  import RipfloLogo from "$ui/RipfloLogo.svelte";
  import ActionIcon2 from "$ui/ActionIcon2.svelte";
  import WorkOrdersView from "$views/WorkOrdersView.svelte";
  import ContactsView from '$views/ContactsView.svelte';
  import MasterCatalog from "$data/MasterCatalog.svelte";
  import ServiceKitsLookup from "$data/ServiceKitsLookup.svelte";
  import SettingsView from "$views/SettingsView.svelte";
  import DashboardsView from "$views/DashboardsView.svelte";
  import PublicStatusPage from "$views/PublicStatusPage.svelte";
  import WebSocketContext from "./lib/Components/Infrastructure/WebSocketContext.svelte";
  import Notifications from "./lib/Components/Infrastructure/Notifications.svelte";
  import OfflineDetection from "./lib/Components/Infrastructure/OfflineDetection.svelte";
  import ApiTimingDisplay from "./lib/Components/UI/ApiTimingDisplay.svelte";
  import Login from "./lib/Login.svelte";

  import { rfState, initializeHosts, loadEnums, restoreSession, clearSession } from "./lib/rf.svelte";
  import Clock from "./lib/Components/UI/Clock.svelte";

  let isLoggedIn = $state(rfState.isLoggedIn); // Initialize based on rfState
  let contactsViewMode = $state("cards"); // 'cards' or 'list'
  let showAllWorkOrders = $state(false); // Toggle for showing all work orders vs open only

  // Update isLoggedIn when rfState changes
  $effect(() => {
    isLoggedIn = rfState.isLoggedIn;
  });

  // Logout function
  function logout() {
    rfState.isLoggedIn = false;
    rfState.currentUser = null;
    rfState.workOrders = [];
    rfState.contacts = [];
    rfState.assets = [];
    rfState.parts = [];
    isLoggedIn = false;
    showAllWorkOrders = false; // Reset the toggle when logging out
    clearSession(); // Clear stored session
  }

  // Set default view if not already set - using $effect to properly handle reactive state
  $effect(() => {
    if (!rfState.currentView) {
      rfState.currentView = "workorders";
    }
  });

  function switchView(view: string) {
    switch (view) {
      case "dashboard":
      case "dashboards":
        return DashboardsView;
      case "workorders":
        return WorkOrdersView; // Now handles both card and list modes internally
      case "contacts":
        return ContactsView;
      case "mastercatalog":
        return MasterCatalog;
      case "servicekits":
        return ServiceKitsLookup;
      case "settings":
        return SettingsView;
      default:
        return WorkOrdersView;
    }
  }

  function toggleContactsViewMode() {
    contactsViewMode = contactsViewMode === "cards" ? "list" : "cards";
  }

  // Derive the current view component based on the current appState
  const CurrentViewComponent = $derived(
    switchView(rfState.currentView || "workorders"),
  );

  onMount(async () => {
    // Initialize hosts from rfjs.js
    initializeHosts();
    
    // Try to restore session from localStorage
    const sessionRestored = restoreSession();
    
    // If session was restored, load enums
    if (sessionRestored) {
      loadEnums();
    }
  });

  // Load enums when user is logged in
  $effect(() => {
    if (rfState.isLoggedIn) {
      loadEnums();
    }
  });

  function handleAction(action) {
    switch (action) {
      case "Dashboard":
      case "Dashboards":
        rfState.currentView = "dashboard";
        break;
      case "Workorders":
        rfState.currentView = "workorders";
        break;
      case "Contacts":
        rfState.currentView = "contacts";
        break;
      case "Master Catalog":
        rfState.currentView = "mastercatalog";
        break;
      case "Service Kits":
        rfState.currentView = "servicekits";
        break;
      case "Settings":
        rfState.currentView = "settings";
        break;
      case "Logout":
        logout();
        break;
    }
  }
</script>
  <div class="sticky-header">
    <div class="app-header">
      <div>
      <WebSocketContext />
      <Notifications />
      <OfflineDetection />
      <ApiTimingDisplay />
    </div>
    <RipfloLogo />
    <Clock />
    </div>
  </div>
<main class="app-container">

  <div class="main-content">
    {#if !isLoggedIn}
      <Login appState={rfState} />
    {:else}
      <CurrentViewComponent />
    {/if}
  </div>

  <div class="footer">
    <div class="d-flex justify-content-between py-2">
      <ActionIcon2
        props="bi-speedometer2"
        text="Dashboard"
        onClick={() => handleAction("Dashboard")}
        action="Dashboard"
        isActive={rfState.currentView === "dashboard"}
        title="Dashboard"
      />
      <ActionIcon2
        props="bi-gear"
        text="Settings"
        onClick={() => handleAction("Settings")}
        action="Settings"
        isActive={rfState.currentView === "settings"}
        title="Settings"
      />
      <ActionIcon2
        props="bi-clipboard2"
        text="Workorders"
        onClick={() => handleAction("Workorders")}
        action="Workorders"
        isActive={rfState.currentView === "workorders"}
        title="Workorders"
      />
      <ActionIcon2
        props="bi-people"
        text="Contacts"
        onClick={() => handleAction("Contacts")}
        action="Contacts"
        isActive={rfState.currentView === "contacts"}
        title="Contacts"
      />
      <ActionIcon2
        props="bi-upc"
        text="Master Catalog"
        onClick={() => handleAction("Master Catalog")}
        action="Master Catalog"
        isActive={rfState.currentView === "mastercatalog"}
        title="Master Catalog"
      />
      <ActionIcon2
        props="bi-tools"
        text="Service Kits"
        onClick={() => handleAction("Service Kits")}
        action="Service Kits"
        isActive={rfState.currentView === "servicekits"}
        title="Service Kits"
      />
    <!--
      <ActionIcon2
        props="bi-box-seam"
        text="Inventory"
        onClick={() => {}}
        action="Inventory"
        isActive={rfState.currentView === "inventory"}
        title="Inventory (Coming Soon)"
        disabled={true}
      />
    -->
      <ActionIcon2
        props="bi-box-arrow-right"
        text="Logout"
        onClick={logout}
        action="Logout"
        isActive={false}
        title="Logout"
      />
    </div>
  </div>
</main>
