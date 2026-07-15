<script lang="ts">
  import { rfState } from '../../rf.svelte';
  import { listUsers } from '../../api/endpoints/users';
  import { createWorkOrderTech, deleteWorkOrderTech } from '../../api/endpoints/workorder-related';
  import { toastStore } from '../../stores/toastStore';
  import ActionBtn from '../UI/ActionBtn.svelte';
  import { type WorkOrderTech } from '../../api/endpoints/workorders';
  import { type User } from '../../api/endpoints/users';

  let { workOrder, disabled = false } = $props<{
    workOrder?: any; // WorkOrder object
    disabled?: boolean;
  }>();

  let showAddTechForm = $state(false);
  let selectedTech = $state<number | null>(null);
  let selectedRole = $state<string>("");
  let techs = $state<WorkOrderTech[]>(workOrder?.techs || []);
  let users = $state<User[]>([]);
  
  // Initialize when component mounts
  $effect(async () => {
    // Load available users for tech assignment
    try {
      const response = await listUsers();
      if (!response.error) {
        users = response.data || [];
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  });

  async function handleAddTech() {
    if (!workOrder?.workorder_id || !selectedTech || !selectedRole) return;

    // Check if this user is already assigned to this work order with the same role
    const isAlreadyAssigned = techs.some(
      (tech) =>
        tech.user_id === selectedTech &&
        tech.role === selectedRole &&
        tech.is_current === 1,
    );

    if (isAlreadyAssigned) {
      toastStore.add({
        message:
          "This tech is already assigned to this work order with the same role",
        type: "error",
      });
      return;
    }

    try {
      // Make API call to assign tech to work order
      const response = await createWorkOrderTech({
        workorder_id: workOrder.workorder_id,
        user_id: selectedTech,
        role: selectedRole,
      });

      if (!response.error) {
        // Create the new tech object
        const newTech: WorkOrderTech = {
          wo_tech_id: Date.now(), // temporary ID until we get the real one
          workorder_id: workOrder.workorder_id,
          user_id: selectedTech,
          role: selectedRole,
          assigned_at: new Date().toISOString(),
          is_current: 1,
        };

        // Add the new tech to the local state
        techs = [...techs, newTech];

        // Reset form
        selectedTech = null;
        selectedRole = "";
        showAddTechForm = false;

        toastStore.add({
          message: "Tech assigned successfully",
          type: "success",
        });
      } else {
        toastStore.add({
          message: `Error assigning tech: ${response.error.message}`,
          type: "error",
        });
      }
    } catch (error) {
      toastStore.add({
        message: `Error assigning tech: ${error.message}`,
        type: "error",
      });
    }
  }

  async function handleRemoveTech(techId: number) {
    try {
      // Make API call to remove the tech from the work order
      const response = await deleteWorkOrderTech(techId);

      if (!response.error) {
        // Remove the tech from the local state
        techs = techs.filter(tech => tech.wo_tech_id !== techId);

        toastStore.add({
          message: "Tech removed successfully",
          type: "success",
        });
      } else {
        toastStore.add({
          message: `Error removing tech: ${response.error.message}`,
          type: "error",
        });
      }
    } catch (error) {
      toastStore.add({
        message: `Error removing tech: ${error.message}`,
        type: "error",
      });
    }
  }

  function toggleAddTechForm() {
    showAddTechForm = !showAddTechForm;
  }

  function handleCancel() {
    showAddTechForm = false;
    // Clear the form
    selectedTech = null;
    selectedRole = "";
  }
</script>

<div class="work-order-techs card">
  <div class="card-header d-flex justify-content-between align-items-center">
    <h5 class="card-title mb-0">
      <i class="bi bi-people me-2"></i>
      Assigned Technicians
    </h5>
    <button
      type="button"
      class="btn btn-sm btn-outline-primary"
      onclick={toggleAddTechForm}
      disabled={disabled}
      title="Add Tech"
    >
      <i class="bi bi-plus-circle me-1"></i>
      {showAddTechForm ? 'Cancel' : 'Add Tech'}
    </button>
  </div>
  <div class="card-body">
    {#if techs.length > 0}
      <div class="list-group">
        {#each techs as tech}
          <div
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <h6 class="mb-0">
                {#if users.length > 0}
                  {users.find((u) => u.user_id === tech.user_id)?.username ||
                    "Unknown User"}
                {:else}
                  User ID: {tech.user_id}
                {/if}
              </h6>
              <small class="text-muted">Role: {tech.role}</small>
            </div>
            <ActionBtn
              icon="x-lg"
              title="Remove Tech"
              variant="outline-danger"
              size="sm"
              onClick={() => handleRemoveTech(tech.wo_tech_id)}
              disabled={disabled}
            />
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-muted mb-0">No technicians assigned</p>
    {/if}

    {#if showAddTechForm}
      <div class="add-tech-form mt-3 pt-3 border-top">
        <div class="row mb-3">
          <div class="col-md-5">
            <label for="tech-select" class="form-label">Select Technician</label>
            <select
              id="tech-select"
              class="form-select"
              bind:value={selectedTech}
              disabled={disabled}
            >
              <option value="">Choose a tech</option>
              {#each users as user}
                <option value={user.user_id}>
                  {user.username}
                </option>
              {/each}
            </select>
          </div>
          <div class="col-md-5">
            <label for="role-select" class="form-label">Select Role</label>
            <select
              id="role-select"
              class="form-select"
              bind:value={selectedRole}
              disabled={disabled}
            >
              <option value="">Choose a role</option>
              {#each rfState.cachedEnums.workOrderAssignmentRoles as role}
                <option value={role.role_key}>
                  {role.display}
                </option>
              {/each}
            </select>
          </div>
          <div class="col-md-2">
            <div class="d-flex align-items-end h-100">
              <ActionBtn
                icon="person-plus"
                title="Assign Tech"
                variant="primary"
                size=""
                onClick={handleAddTech}
                disabled={disabled || !selectedTech || !selectedRole}
              />
            </div>
          </div>
        </div>
        
        <div class="d-flex justify-content-end gap-2">
          <button
            type="button"
            class="btn btn-secondary"
            onclick={handleCancel}
            disabled={disabled}
            title="Cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>