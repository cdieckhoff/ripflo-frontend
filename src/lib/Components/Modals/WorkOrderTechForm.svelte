<script>
  import { rfState } from '';

  // Props
  let { tech = null } = $props(); // Can be CreateWorkOrderTechRequest or WorkOrderTech
  let { disabled = false } = $props();
  let { hideLabels = false } = $props();

  // Local state
  let userId = $state(tech?.user_id || null);
  let role = $state(tech?.role || 'Technician');
  let status = $state(tech?.current_status || 'Assigned');
  let users = $state([]);

  // Load users on component initialization
  $effect(() => {
    loadUsers();
  });

  async function loadUsers() {
    try {
      const result = await rfState.api.getUsers();
      if (result?.error?.message && result.error.message.trim() !== '') {
        console.error('Error loading users:', result.error.message);
      } else {
        users = result?.data?.users || [];
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }

  // Expose tech data to parent
  $bindable(userId);
  $bindable(role);
  $bindable(status);

  // Method to get complete tech object
  function getTechObject() {
    return {
      user_id: userId,
      role: role,
      current_status: status
    };
  }

  // Export method for parent components
  export { getTechObject };
</script>

<div class="work-order-tech-form">
  <div class="user-selection">
    {#if !hideLabels}<label for="user-select">Technician</label>{/if}
    <select
      id="user-select"
      value={userId}
      onchange={(e) => userId = parseInt(e.target.value) || null}
      disabled={disabled}
    >
      <option value="">Select Technician</option>
      {#each users as user}
        <option value={user.id}>{user.username || user.first_name + ' ' + user.last_name}</option>
      {/each}
    </select>
  </div>

  <div class="role-selection">
    {#if !hideLabels}<label for="role-select">Role</label>{/if}
    <select
      id="role-select"
      value={role}
      onchange={(e) => role = e.target.value}
      disabled={disabled}
    >
      <option value="Technician">Technician</option>
      <option value="Lead">Lead</option>
      <option value="Supervisor">Supervisor</option>
      <option value="Manager">Manager</option>
    </select>
  </div>

  <div class="status-selection">
    {#if !hideLabels}<label for="status-select">Status</label>{/if}
    <select
      id="status-select"
      value={status}
      onchange={(e) => status = e.target.value}
      disabled={disabled}
    >
      <option value="Assigned">Assigned</option>
      <option value="In Progress">In Progress</option>
      <option value="Completed">Completed</option>
      <option value="On Hold">On Hold</option>
    </select>
  </div>
</div>