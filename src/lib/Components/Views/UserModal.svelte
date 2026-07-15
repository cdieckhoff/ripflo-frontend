<script lang="ts">
  import { UserRoles, ContactIsActive } from '../../types/consolidated-enums.js';

  let { state, saveUser } = $props<{
    state: any;
    saveUser: () => Promise<void>;
  }>();
</script>

<!-- Add/Edit User Modal -->
{#if state.showAddUser}
  <div class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h6 class="modal-title">
            <i class="bi bi-person-plus me-2"></i>
            {#if state.editingUser} Edit User {:else} Add New User {/if}
          </h6>
          <button type="button" class="btn-close" onclick={() => state.showAddUser = false} title="Close"></button>
        </div>

        <div class="modal-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                type="email"
                class="form-control"
                bind:value={state.newUser.email}
                placeholder="user@example.com"
              />
            </div>

            <div class="col-md-6 mb-3">
              <label for="username" class="form-label">Username</label>
              <input
                id="username"
                type="text"
                class="form-control"
                bind:value={state.newUser.username}
                placeholder="Enter username"
              />
            </div>
          </div>

          {#if !state.editingUser}
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input
                id="password"
                type="password"
                class="form-control"
                bind:value={state.newUser.password}
                placeholder="Enter password (min 6 characters)"
              />
            </div>
          {:else}
            <!-- Password change fields for editing user -->
            <div class="mb-3">
              <label for="newPassword" class="form-label">New Password (leave blank to keep current)</label>
              <input
                id="newPassword"
                type="password"
                class="form-control"
                bind:value={state.newUser.password}
                placeholder="Enter new password (min 6 characters) or leave blank"
              />
            </div>
            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                class="form-control"
                bind:value={state.newUser.confirmPassword}
                placeholder="Confirm new password"
              />
            </div>
          {/if}

          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="role" class="form-label">Role</label>
              <select
                id="role"
                class="form-control"
                bind:value={state.newUser.role}
              >
                {#each Object.values(UserRoles) as role}
                  <option value={role}>{role.replace('_', ' ')}</option>
                {/each}
              </select>
            </div>

            <div class="col-md-6 mb-3">
              <label for="facility" class="form-label">Assigned Facility (Optional)</label>
              <select
                id="facility"
                class="form-control"
                bind:value={state.newUser.fac_id}
              >
                <option value={null}>All Facilities</option>
                {#each state.facilities as facility}
                  <option value={facility.fac_id}>{facility.fac_name}</option>
                {/each}
              </select>
            </div>
          </div>

          <div class="form-check form-switch mb-3">
            <input
              class="form-check-input"
              type="checkbox"
              id="status"
              checked={state.newUser.is_active === ContactIsActive.YES}
              onchange={() => state.newUser.is_active = state.newUser.is_active ? ContactIsActive.NO : ContactIsActive.YES}
            />
            <label class="form-check-label" for="status">
              Active Status
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            onclick={() => state.showAddUser = false}
            title="Cancel"
          >
            <i class="bi bi-x-circle me-1"></i>
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            onclick={saveUser}
            title={state.editingUser ? 'Update User' : 'Create User'}
          >
            <i class="bi bi-check-circle me-1"></i>
            {#if state.editingUser} Update {:else} Create {/if} User
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}