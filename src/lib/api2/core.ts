// Core Module - Contacts, Addresses, Phones, Emails, Facilities, Zips
import { apiFetch } from './client';
import { type Asset } from './equipment';
// Enums
export enum ContactPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ContactType {
  PERSON = 'person',
  EMPLOYEE = 'employee',
  COMPANY = 'company',
  SUPPLIER = 'supplier'
}

export enum AddressType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TEMPORARY = 'temporary',
  WORK = 'work',
  DELIVERY = 'delivery',
  PICKUP = 'pickup',
  BILLING = 'billing',
  SHIPPING = 'shipping',
  MAILING = 'mailing',
  BUSINESS = 'business',
  COMMERCIAL = 'commercial',
  WAREHOUSE = 'warehouse',
  DEPOT = 'depot',
  SITE = 'site',
  FACILITY = 'facility'
}

export enum PhoneType {
  MOBILE = 'mobile',
  CELL = 'cell',
  FAX = 'fax',
  HOME = 'home',
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TEMPORARY = 'temporary',
  MAIN = 'main',
  SUPPORT = 'support',
  EMERGENCY = 'emergency'
}

// Interfaces
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
  assets: Asset[];
}

export interface ContactName {
  contact_name_id?: number;
  display_name: string;
  legal_name: string;
  first_name: string;
  last_name: string;
  type_field: string;
  created_at: string;
}

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

export interface Phone {
  phone_id?: number;
  contact_id?: number;
  fac_id?: number;
  formatted_phone: string;
  can_recv_texts: number;
  is_primary: number;
  phone_type: number;
}

export interface Email {
  email_id?: number;
  contact_id: number;
  email: string;
  is_primary: number;
}

export interface Facility {
  fac_id?: number;
  fac_name: string;
  fac_short: string;
  fac_zip: number;
  is_active: number;
}

export interface Zip {
  zip_id: number;
  lat: number;
  lng: number;
  city: string;
  state_id: string;
  state_name: string;
}

export interface CreateAddress {
  fac_id?: number;
  addr1?: string;
  addr2?: string;
  addr_type?: string;
  zip: number;
  is_primary?: number;
}

export interface CreatePhone {
  fac_id?: number;
  formatted_phone?: string;
  can_recv_texts?: number;
  is_primary?: number;
  phone_type?: number;
}

export interface CreateEmail {
  email: string;
  is_primary?: number;
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

export interface ContactResponse {
  data: {
    contacts: Contact[];
  };
  error: {
    message: string;
  };
}

export interface FacilityResponse {
  data: {
    facilities: Facility[];
  };
  error: {
    message: string;
  };
}

export interface ZipResponse {
  data: {
    zips: Zip[];
  };
  error: {
    message: string;
  };
}

// API Functions
export async function createContact(contactRequest: CreateContactWithContactNameRequest) {
  return apiFetch<Contact[]>(`/contacts`, {
    method: 'POST',
    body: JSON.stringify(contactRequest),
  }, 'contacts');
}

export async function getContact(contactId: number) {
  return apiFetch<Contact[]>(`/contacts/${contactId}`, {
    method: 'GET',
  }, 'contacts');
}

export async function updateContact(contactId: number, contactRequest: Partial<Contact>) {
  return apiFetch<Contact[]>(`/contacts/${contactId}`, {
    method: 'PUT',
    body: JSON.stringify(contactRequest),
  }, 'contacts');
}

export async function deleteContact(contactId: number) {
  return apiFetch<Contact[]>(`/contacts/${contactId}`, {
    method: 'DELETE',
  }, 'contacts');
}

export async function listContacts(params?: { is_active?: number; priority?: string; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<Contact[]>(`/contacts?${queryParams}`, {
    method: 'GET',
  }, 'contacts');
}

export async function searchContacts(searchTerm: string) {
  return apiFetch<Contact[]>(`/search/contacts?q=${encodeURIComponent(searchTerm)}`, {
    method: 'GET',
  }, 'contacts');
}

export async function createFacility(facilityRequest: Omit<Facility, 'fac_id'>) {
  return apiFetch<Facility[]>(`/facilities`, {
    method: 'POST',
    body: JSON.stringify(facilityRequest),
  }, 'facilities');
}

export async function getFacility(facId: number) {
  return apiFetch<Facility[]>(`/facilities/${facId}`, {
    method: 'GET',
  }, 'facilities');
}

export async function updateFacility(facId: number, facilityRequest: Partial<Facility>) {
  return apiFetch<Facility[]>(`/facilities/${facId}`, {
    method: 'PUT',
    body: JSON.stringify(facilityRequest),
  }, 'facilities');
}

export async function deleteFacility(facId: number) {
  return apiFetch<Facility[]>(`/facilities/${facId}`, {
    method: 'DELETE',
  }, 'facilities');
}

export async function listFacilities(params?: { is_active?: number; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<Facility[]>(`/facilities?${queryParams}`, {
    method: 'GET',
  }, 'facilities');
}

export async function getZip(zipId: number) {
  return apiFetch<Zip[]>(`/zips/${zipId}`, {
    method: 'GET',
  }, 'zips');
}

