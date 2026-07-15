import { apiFetch, apiFetchWithNormalization } from '../client';
import { getEpAddresses } from '../endpoints';
import { type ApiData } from '../types.js';

// Address interfaces
export interface Address {
  addr_id?: number;
  contact_id?: number;
  fac_id?: number;
  addr1: string;
  addr2: string;
  is_primary: number;
  addr_type: number;
  zip: number;
}

export interface CreateAddress {
  fac_id?: number;
  addr1?: string;
  addr2?: string;
  addr_type?: string;
  zip: number;
  is_primary?: number;
}

export interface UpdateAddressRequest extends CreateAddress {
  addr_id: number;
}

// Address Type interface for the address types list
export interface AddressType {
  id: number;
  name: string;
  display_name: string;
}

// Address API functions
export async function createAddress(payload: CreateAddress) {
  return apiFetch<Address[]>(getEpAddresses(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'addresses');
}

export async function listAddresses() {
  return apiFetch<Address[]>(getEpAddresses(), {}, 'addresses');
}

export async function getAddress(id: number) {
  return apiFetch<Address[]>(`${getEpAddresses()}/${id}`, {}, 'addresses');
}

export async function updateAddress(id: number, payload: UpdateAddressRequest) {
  return apiFetch<Address[]>(`${getEpAddresses()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'addresses');
}

export async function deleteAddress(id: number) {
  return apiFetch<Address[]>(`${getEpAddresses()}/${id}`, {
    method: 'DELETE',
  }, 'addresses');
}

// Function to list address types
export async function listAddressTypes() {
  // This would typically call an endpoint like /address_types
  // For now, returning the enum values as objects
  return {
    data: [
      { id: 1, name: 'primary', display_name: 'Primary' },
      { id: 2, name: 'secondary', display_name: 'Secondary' },
      { id: 3, name: 'temporary', display_name: 'Temporary' },
      { id: 4, name: 'work', display_name: 'Work' },
      { id: 5, name: 'delivery', display_name: 'Delivery' },
      { id: 6, name: 'pickup', display_name: 'Pickup' },
      { id: 7, name: 'billing', display_name: 'Billing' },
      { id: 8, name: 'shipping', display_name: 'Shipping' },
      { id: 9, name: 'mailing', display_name: 'Mailing' },
      { id: 10, name: 'business', display_name: 'Business' },
      { id: 11, name: 'commercial', display_name: 'Commercial' },
      { id: 12, name: 'warehouse', display_name: 'Warehouse' },
      { id: 13, name: 'depot', display_name: 'Depot' },
      { id: 14, name: 'site', display_name: 'Site' },
      { id: 15, name: 'facility', display_name: 'Facility' },
    ],
    error: null
  };
}