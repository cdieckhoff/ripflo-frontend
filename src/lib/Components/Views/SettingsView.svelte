<script lang="ts">
  import { rfState } from '../../rf.svelte';
  import { FacilityIsActive, UserRoles, ContactIsActive } from '../../types/consolidated-enums.js';
  import type { Facility } from '../../api/endpoints/facilities.js';
  import type { User } from '../../api/endpoints/users.js';
  import { formatCurrency, formatPercentage } from './settingsUtils';
  import { listFacilities } from '../../api/endpoints/facilities';
  import { listUsers, createUser, updateUser } from '../../api/endpoints/users';

  import GeneralSettings from './GeneralSettings.svelte';
  import PoliciesSettings from './PoliciesSettings.svelte';
  import UserManagement from './UserManagement.svelte';
  import FacilitiesView from './FacilitiesView.svelte';
  import UserModal from './UserModal.svelte';

  // Get the global app state
  const appState = rfState;

  // Types
  type ShopConfig = {
    shop_name: string;
    default_labor_rate_id: number;
    storage_fee_per_day: number;
    abandonment_days: number;
    default_facility_id: number;
  };


  // Define the complete state type
  type SettingsState = {
    activeTab: string;
    shopConfig: ShopConfig;
    facilities: Facility[];
    users: User[];
    showAddUser: boolean;
    newUser: {
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
      role: UserRoles;
      fac_id: number | null;
      is_active: ContactIsActive;
    };
    editingUser: User | null;
    isLoading: boolean;
    error: string | null;
  };

  // State variables
  let state = $state<SettingsState>({
    activeTab: 'general',
    shopConfig: {
      shop_name: 'RIPFLO Repair Shop',
      default_labor_rate_id: 1,
      storage_fee_per_day: 5.00,
      abandonment_days: 90,
      default_facility_id: 1
    },
    facilities: [],
    users: [],
    showAddUser: false,
    newUser: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRoles.USER,
      fac_id: null,
      is_active: ContactIsActive.YES
    },
    editingUser: null,
    isLoading: false,
    error: null
  });

  // Initialize
  $effect(() => {
    loadSettings();
  });

  // Load settings data
  async function loadSettings() {
    state.isLoading = true;
    try {
      // Load shop configuration
      // For now, using defaults
      // In a real implementation, this would come from system config API

       // Load facilities
      const facilitiesResponse = await listFacilities();
      if (!facilitiesResponse.error || !facilitiesResponse.error.message) {
        state.facilities = facilitiesResponse.data;
      }

      // Load users
      const usersResponse = await listUsers();
      if (!usersResponse.error || !usersResponse.error.message) {
        state.users = usersResponse.data;
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to load settings';
      console.error('Error loading settings:', err);
    } finally {
      state.isLoading = false;
    }
  }

  // Save general settings
  async function saveGeneralSettings() {
    try {
      // In a real implementation, this would update system config via API
      console.log('Saving general settings:', state.shopConfig);
      
      // For now, just show success message
      alert('General settings saved successfully!');
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to save settings';
      console.error('Error saving general settings:', err);
    }
  }

  // Show add user modal
  function showAddUser() {
    resetUserForm();
    state.editingUser = null;
    state.showAddUser = true;
  }

  // Show edit user modal
  function showEditUser(user: User) {
    resetUserForm();
    state.editingUser = { ...user };
    state.newUser = {
      username: user.username,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      fac_id: user.fac_id || null,
      is_active: user.is_active
    };
    state.showAddUser = true;
  }

  // Reset user form
  function resetUserForm() {
    state.newUser = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRoles.USER,
      fac_id: null,
      is_active: ContactIsActive.YES
    };
  }

  // Save user
  async function saveUser() {
    // Validate password requirements
    if (!state.editingUser && state.newUser.password.length < 6) {
      state.error = 'Password must be at least 6 characters';
      return;
    }

    // When editing user, if a new password is provided, validate it
    if (state.editingUser && state.newUser.password && state.newUser.password.length < 6) {
      state.error = 'Password must be at least 6 characters';
      return;
    }

    // If a new password is provided, check if it matches the confirmation
    if (state.newUser.password && state.newUser.password !== state.newUser.confirmPassword) {
      state.error = 'Passwords do not match';
      return;
    }

    try {
      if (state.editingUser) {
        // Update existing user
        // Only include password in update if it's being changed (not empty)
        const updatePayload: any = {
          username: state.newUser.username,
          email: state.newUser.email,
          role: state.newUser.role,
          fac_id: state.newUser.fac_id,
          is_active: state.newUser.is_active,
          last_login: state.editingUser.last_login, // Preserve last_login
          user_id: state.editingUser.user_id // This is needed for the UpdateUserRequest type
        };

        // Only add password to payload if a new password is provided
        if (state.newUser.password) {
          updatePayload.password = state.newUser.password;
        }

        const response = await updateUser(state.editingUser.user_id, updatePayload);
        if (response.error) {
          throw new Error(response.error.message || 'Failed to update user');
        }

        // Update local state
        const index = state.users.findIndex(u => u.user_id === state.editingUser!.user_id);
        if (index !== -1) {
          state.users[index] = {
            ...state.users[index],
            username: state.newUser.username,
            email: state.newUser.email,
            role: state.newUser.role,
            fac_id: state.newUser.fac_id,
            is_active: state.newUser.is_active
          };
        }
      } else {
        // Create new user
        // Send the raw password to the backend - the backend will handle hashing
        const createPayload = {
          username: state.newUser.username,
          email: state.newUser.email,
          password: state.newUser.password, // Send raw password to backend for hashing
          role: state.newUser.role,
          fac_id: state.newUser.fac_id,
          is_active: state.newUser.is_active
        };

        const response = await createUser(createPayload);
        if (response.error) {
          throw new Error(response.error.message || 'Failed to create user');
        }

        if (response.data && response.data.length > 0) {
          // Add the created user to the local state
          state.users = [...state.users, ...response.data];
        }
      }

      state.showAddUser = false;
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to save user';
      console.error('Error saving user:', err);
    }
  }

  // Toggle user status
  async function toggleUserStatus(userId: number) {
    try {
      const user = state.users.find(u => u.user_id === userId);
      if (user) {
        const newStatus = user.is_active === ContactIsActive.YES
          ? ContactIsActive.NO
          : ContactIsActive.YES;

        // Update via API - only update the status, keep other fields the same
        const updatePayload = {
          username: user.username,
          email: user.email,
          role: user.role,
          fac_id: user.fac_id,
          is_active: newStatus,
          user_id: user.user_id
          // Don't update password or last_login unless specifically changing
        };

        const response = await updateUser(userId, updatePayload);
        if (response.error) {
          throw new Error(response.error.message || 'Failed to update user status');
        }

        // Update in local state
        const index = state.users.findIndex(u => u.user_id === userId);
        if (index !== -1) {
          state.users[index] = {
            ...state.users[index],
            is_active: newStatus
          };
        }
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to update user status';
      console.error('Error updating user status:', err);
    }
  }
</script>

<div class="settings-view">
  <h3 class="mb-4">Settings</h3>

  {#if state.error}
    <div class="alert alert-danger" role="alert">
      {state.error}
      <button type="button" class="btn-close" onclick={() => state.error = null} title="Close error message"></button>
    </div>
  {/if}

  <!-- Settings Tabs -->
  <ul class="nav nav-tabs mb-4" role="tablist">
    <li class="nav-item" role="presentation">
      <button
        class="nav-link { state.activeTab === 'general' ? 'active' : '' }"
        onclick={() => state.activeTab = 'general'}
      >
        <i class="bi bi-gear me-2"></i>
        General
      </button>
    </li>
    <li class="nav-item" role="presentation">
      <button
        class="nav-link { state.activeTab === 'policies' ? 'active' : '' }"
        onclick={() => state.activeTab = 'policies'}
      >
        <i class="bi bi-file-text me-2"></i>
        Policies
      </button>
    </li>
    <li class="nav-item" role="presentation">
      <button
        class="nav-link { state.activeTab === 'facilities' ? 'active' : '' }"
        onclick={() => state.activeTab = 'facilities'}
      >
        <i class="bi bi-building me-2"></i>
        Facilities
      </button>
    </li>
    <li class="nav-item" role="presentation">
      <button
        class="nav-link { state.activeTab === 'users' ? 'active' : '' }"
        onclick={() => state.activeTab = 'users'}
      >
        <i class="bi bi-people me-2"></i>
        Users
      </button>
    </li>
  </ul>

  <!-- General Settings Tab -->
  {#if state.activeTab === 'general'}
    <GeneralSettings 
      {state} 
      {saveGeneralSettings}
    />
  {/if}

  <!-- Policies Tab -->
  {#if state.activeTab === 'policies'}
    <PoliciesSettings 
      {state} 
      {saveGeneralSettings}
    />
  {/if}

  <!-- Facilities Tab -->
  {#if state.activeTab === 'facilities'}
    <FacilitiesView {state} />
  {/if}

  <!-- Users Tab -->
  {#if state.activeTab === 'users'}
    <UserManagement
      {state}
      {showAddUser}
      {showEditUser}
      {toggleUserStatus}
    />
  {/if}

  <UserModal {state} {saveUser} />
</div>