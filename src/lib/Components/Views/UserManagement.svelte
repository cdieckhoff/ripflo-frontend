<script lang="ts">
  import { ContactIsActive, UserRoles } from '../../types/consolidated-enums.js';
  import ActionBtn from '../UI/ActionBtn.svelte';

  let { state, showAddUser, showEditUser, toggleUserStatus } = $props<{
    state: any;
    showAddUser: () => void;
    showEditUser: (user: any) => void;
    toggleUserStatus: (userId: number) => Promise<void>;
  }>();
</script>

<!-- Users Tab -->
<div class="tab-content">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h5>Users</h5>
    <button class="btn btn-primary" onclick={showAddUser}>
      <i class="bi bi-plus-circle"></i> Add User
    </button>
  </div>

  <div class="table-responsive">
    <table class="table  table-striped">
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Role</th>
          <th>Facility</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each state.users as user}
          <tr>
            <td><strong>{user.username}</strong></td>
            <td>{user.email}</td>
            <td>
              <span class="badge bg-info">
                {user.role.replace('_', ' ')}
              </span>
            </td>
            <td>
              {#if user.fac_id}
                {#if state.facilities.find(f => f.fac_id === user.fac_id)}
                  {state.facilities.find(f => f.fac_id === user.fac_id)!.fac_name}
                {/if}
              {:else}
                <em>All Facilities</em>
              {/if}
            </td>
            <td>
              <span class="badge {user.is_active === ContactIsActive.YES ? 'bg-success' : 'bg-secondary'}">
                {user.is_active === ContactIsActive.YES ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td>
              <div class="btn-group" role="group">
                <ActionBtn
                  icon="pencil"
                  title="Edit"
                  variant="outline-light"
                  size="sm"
                  onClick={() => showEditUser(user)}
                />
                <ActionBtn
                  icon="power"
                  title="Toggle Status"
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => toggleUserStatus(user.user_id)}
                />
              </div>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="6" class="text-center text-muted py-5">
              No users configured.
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>