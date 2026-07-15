<script>
  import { onMount } from "svelte";

  import { rfLogin } from "./rf.svelte";
  import Logo from './Components/UI/RipfloLogo.svelte';
  let username = $state("");
  let password = $state("");
  let { appState } = $props();

  let successMessage = $state("");
  let errorMessage = $state("");
  let showPassword = $state(false);
  let systemConfig = $state({});

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await rfLogin(username, password);

    if (result.success) {
      successMessage = "Login successful!";
      errorMessage = "";
    } else {
      errorMessage = result.error || "Login failed";
      successMessage = "";
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  function clearMessages() {
    errorMessage = "";
    successMessage = "";
  }
</script>

<div class="container d-flex justify-content-center align-items-center vh-100">
  <div class="row">
    <div class="col-md-3 col-4 w-100">
      <div class="card shadow-sm mt-5">
        <Logo />
        <div class="card-body">
          <form onsubmit={handleSubmit}>
            <div class="mb-3">
              <label for="usernameInput" class="form-label">Username</label>
              <div class="input-group">
                <span class="input-group-text"
                  ><i class="bi bi-person"></i></span
                >
                <input
                  type="text"
                  class="form-control"
                  id="usernameInput"
                  placeholder="Enter username"
                  bind:value={username}
                  required
                  disabled={appState.isLoading}
                />
              </div>
            </div>

            <div class="mb-4">
              <label for="passwordInput" class="form-label">Password</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-lock"></i></span>
                <input
                  type={showPassword ? "text" : "password"}
                  class="form-control"
                  id="passwordInput"
                  placeholder="Enter password"
                  bind:value={password}
                  required
                  disabled={appState.isLoading}
                />
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  onclick={togglePasswordVisibility}
                  disabled={appState.isLoading}
                  title="Toggle password visibility"
                >
                  <i class="bi {showPassword ? 'bi-eye-slash' : 'bi-eye'}"></i>
                </button>
              </div>
            </div>

            <div class="d-grid gap-2">
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                disabled={appState.isLoading}
              >
                {#if appState.isLoading}
                  <span
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Signing in...
                {:else}
                  Sign In
                {/if}
              </button>
            </div>

            {#if errorMessage}
              <div class="alert alert-danger mt-3" role="alert">
                {errorMessage}
                <button type="button" class="btn-close" onclick={() => errorMessage = ""}></button>
              </div>
            {/if}

            {#if successMessage}
              <div class="alert alert-success mt-3" role="alert">
                {successMessage}
                <button type="button" class="btn-close" onclick={() => successMessage = ""}></button>
              </div>
            {/if}
          </form>

          <div class="text-center mt-3">
            <a href={null}>Forgot password?</a>
          </div>
        </div>
        <div class="card-footer text-center small text-muted">
          Don't have an account? <a href={null}>Sign up</a>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
</style>
