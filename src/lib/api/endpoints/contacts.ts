import { apiFetch, apiFetchWithNormalization } from '../client';
import { getEpContacts, getEpSearchContacts } from '../endpoints';
import {
  AddressIsPrimary,
  AddressType,
  EmailIsPrimary,
  PhoneIsPrimary,
  ContactIsActive,
  ContactType,
  Priority,
} from "../../types/consolidated-enums.js";
import { type ApiData } from '../types.js';
import type { Asset } from './assets.js';

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

export interface CreateAddressRequest {
  fac_id?: number;
  addr1?: string;
  addr2?: string;
  addr_type?: string;
  zip: number;
  is_primary?: number;
}

export interface UpdateAddressRequest extends CreateAddressRequest {
  addr_id: number;
}

// Email interfaces
export interface Email {
  email_id?: number;
  email: string;
  is_primary: number;
}

export interface CreateEmail {
  email: string;
  is_primary?: number;
}

export interface UpdateEmailRequest extends CreateEmailRequest {
  email_id: number;
}

// Phone interfaces
export interface Phone {
  phone_id?: number;
  formatted_phone: string;
  is_primary: number;
  phone_type?: string;
  can_recv_texts?: number;
}

export interface CreatePhone {
  fac_id?: number;
  formatted_phone?: string;
  can_recv_texts?: number;
  is_primary?: number;
}

export interface CreatePhoneRequest {
  fac_id?: number;
  formatted_phone?: string;
  can_recv_texts?: number;
  is_primary?: number;
  phone_type?: string;
}

export interface UpdatePhoneRequest extends CreatePhoneRequest {
  phone_id: number;
}

// Contact Names interfaces
export interface ContactName {
  contact_name_id: number;
  display_name: string;
  legal_name?: string;
  first_name?: string;
  last_name?: string;
  type: ContactType;
  created_at?: string;
}

export interface CreateContactNameRequest {
  display_name: string;
  legal_name?: string;
  first_name?: string;
  last_name?: string;
  type: ContactType;
}

export interface UpdateContactNameRequest extends CreateContactNameRequest {
  contact_name_id: number;
}

// Contacts interfaces
export interface Contact {
  contact_id?: number;
  parent_id?: number;
  name_id: number;
  is_active: number;
  priority: string;
  display_name: string;
  type: string;
  addresses: Address[];
  phones: Phone[];
  emails: Email[];
  assets: Asset[];  // Assets are included in the contact response
}

export interface CreateContactWithContactNameRequest {
  parent_id?: number;
  display_name: string;
  type_field: string;
  is_active?: number;
  priority?: string;
  addresses: CreateAddress[];
  phones: CreatePhone[];
  emails?: CreateEmail[];
}

export interface UpdateContactRequest {
  parent_id?: number | null;
  name_id?: number;
  is_active?: ContactIsActive;
  priority?: Priority;
  display_name?: string;
  type?: ContactType;
  addresses?: (CreateAddressRequest | UpdateAddressRequest)[];
  phones?: (CreatePhoneRequest | UpdatePhoneRequest)[];
  emails?: (CreateEmailRequest | UpdateEmailRequest)[];
  assets?: Asset[];
}

// Search interfaces
export interface ContactSearchResult {
  contact_id: number;
  contact_name: string;
  contact_type: ContactType;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface ContactSearchResponse {
  data: {
    contacts: ContactSearchResult[];
  };
  error: {
    message: string;
  } | null;
}

export interface ContactResponse {
  data: {
    contacts: Contact[];
  };
  error: {
    message: string;
  };
}

// Contact API functions
export async function createContact(payload: CreateContactWithContactNameRequest) {
  return apiFetch<Contact[]>(getEpContacts(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'contacts');
}

export async function listContacts(
  queryParams?: { [key: string]: string },
  page?: number,
  pageSize?: number
) {
  // Build query parameters with pagination
  const params = new URLSearchParams(queryParams);

  if (page !== undefined) {
    params.set('page', page.toString());
  }

  if (pageSize !== undefined) {
    params.set('page_size', pageSize.toString());
  }

  const queryString = params.toString();

  return apiFetch<Contact[]>(`${getEpContacts()}${queryString ? '?' + queryString : ''}`, {}, 'contacts');
}

export async function getContact(id: number) {
  return apiFetch<Contact[]>(`${getEpContacts()}/${id}`, {}, 'contacts');
}

export async function updateContact(id: number, payload: UpdateContactRequest) {
  return apiFetch<Contact[]>(`${getEpContacts()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'contacts');
}

export async function deleteContact(id: number) {
  return apiFetch<Contact[]>(`${getEpContacts()}/${id}`, {
    method: 'DELETE',
  }, 'contacts');
}

export async function searchContacts(q: string) {
  const queryString = `?q=${encodeURIComponent(q)}`;
  return apiFetch<ContactSearchResult[]>(`${getEpSearchContacts()}${queryString}`, {}, 'contacts');
}