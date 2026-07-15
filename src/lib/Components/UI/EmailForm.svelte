<script lang="ts">
  import type { Email, CreateEmail } from '$lib/api/endpoints/contacts';

  // Props
  let { email = null, disabled = false, hideLabels = false, onChange } = $props<{
    email?: Email | CreateEmail | null;
    disabled?: boolean;
    hideLabels?: boolean;
    onChange?: (email: Email | CreateEmail) => void;
  }>();

  // Validate email format
  function validateEmail(email: string) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function handleEmailInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const emailValue = target.value;
    const isValid = emailValue === '' || validateEmail(emailValue);
    const updatedEmail = { ...email, email: emailValue } as Email | CreateEmail;

    // Call callback if provided
    if (onChange) onChange(updatedEmail);
  }

  function handlePrimaryChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const updatedEmail = { ...email, is_primary: target.checked ? 1 : 0 } as Email | CreateEmail;
    if (onChange) onChange(updatedEmail);
  }

  // Determine if current email is valid
  let currentEmail = email?.email || '';
  let isValid = currentEmail === '' || validateEmail(currentEmail);
</script>

<div class="email-form">
  <div class="email-address">
    {#if !hideLabels}<label for="email-address">Email Address</label>{/if}
    <input
      id="email-address"
      type="email"
      placeholder="name@example.com"
      value={email?.email || ''}
      oninput={handleEmailInput}
      disabled={disabled}
      class={!isValid && currentEmail ? 'invalid' : ''}
    />
    {#if !isValid && currentEmail}
      <span class="error-message">Please enter a valid email address</span>
    {/if}
  </div>

  <div class="form-check form-switch">
    <input
      class="form-check-input"
      type="checkbox"
      id="primary-email"
      checked={email?.is_primary === 1}
      onchange={handlePrimaryChange}
      disabled={disabled}
    />
    <label class="form-check-label" for="primary-email">
      Primary Email
    </label>
  </div>
</div>