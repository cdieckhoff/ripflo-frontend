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
  class="contact-card"
  onclick={handleClick}
  onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? handleClick() : null}
  role="button"
  tabindex="0"
  title="View Contact Details"
>
  <div class="card-header">
    <h3>{contact.first_name} {contact.last_name}</h3>
  </div>
  
  <div class="card-body">
    {#if contact.emails && contact.emails.length > 0}
      <div class="contact-email">
        <strong>Email:</strong> {contact.emails[0].email}
      </div>
    {/if}
    
    {#if contact.phones && contact.phones.length > 0}
      <div class="contact-phone">
        <strong>Phone:</strong> {formatPhoneNumber(contact.phones[0].phone)}
      </div>
    {/if}
    
    {#if contact.addresses && contact.addresses.length > 0}
      <div class="contact-address">
        <strong>Address:</strong> 
        {contact.addresses[0].address_line_1}
        {#if contact.addresses[0].address_line_2}, {contact.addresses[0].address_line_2}{/if}
        <br>
        {contact.addresses[0].city}, {contact.addresses[0].state} {contact.addresses[0].zip_code}
      </div>
    {/if}
  </div>
  
  <div class="card-footer">
    <button 
      type="button" 
      disabled={disabled}
      title="View Contact"
    >
      View Details
    </button>
  </div>
</div>