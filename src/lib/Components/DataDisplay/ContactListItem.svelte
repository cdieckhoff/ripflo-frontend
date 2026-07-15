<script>

  // Props
  let { contact, disabled = false, onClick } = $props();

  // Format phone number
  function formatPhoneNumber(phone) {
    if (!phone) return '';
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    // Format as (XXX) XXX-XXXX
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  }

  // Handle click
  function handleClick() {
    if (onClick) {
      onClick(contact);
    }
  }
</script>

<div
  class="contact-list-item"
  onclick={handleClick}
  onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? handleClick() : null}
  role="button"
  tabindex="0"
  title="View Contact Details"
>
  <div class="item-main">
    <h4>{contact.first_name} {contact.last_name}</h4>
    {#if contact.emails && contact.emails.length > 0}
      <div class="contact-email">{contact.emails[0].email}</div>
    {/if}
  </div>
  
  <div class="item-details">
    {#if contact.phones && contact.phones.length > 0}
      <div class="contact-phone">{formatPhoneNumber(contact.phones[0].phone)}</div>
    {/if}
    
    {#if contact.addresses && contact.addresses.length > 0}
      <div class="contact-city-state">
        {contact.addresses[0].city}, {contact.addresses[0].state}
      </div>
    {/if}
  </div>
  
  <div class="item-actions">
    <button 
      type="button" 
      disabled={disabled}
      title="View Contact"
    >
      View
    </button>
  </div>
</div>