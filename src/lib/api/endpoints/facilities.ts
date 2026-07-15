import { apiFetch, apiFetchWithNormalization } from '../client';
import { getEpFacilities } from '../endpoints';
import { FacilityIsActive } from "../../types/consolidated-enums.js";
import { type ApiData } from '../types.js';

// Facilities interfaces
export interface Facility {
  fac_id: number;
  fac_name: string;
  fac_short: string;
  fac_zip: number;
  is_active: FacilityIsActive;
}

export interface CreateFacilityRequest {
  fac_name: string;
  fac_short: string;
  fac_zip: number;
  is_active?: number;
  phones: Array<{
    formatted_phone: string;
    is_primary?: number;
  }>;
  addresses?: Array<{
    addr1?: string;
    addr2?: string;
    addr_type?: string;
    zip: number;
    is_primary?: number;
  }>;
}

export interface UpdateFacilityRequest {
  fac_id: number;
  fac_name?: string;
  fac_short?: string;
  fac_zip?: number;
  is_active?: number;
  phones?: Array<{
    formatted_phone: string;
    is_primary?: number;
  }>;
  addresses?: Array<{
    addr1?: string;
    addr2?: string;
    addr_type?: string;
    zip: number;
    is_primary?: number;
  }>;
}

// Zip interfaces
export interface Zip {
  zip_id: number;
  lat?: number;
  lng?: number;
  city: string;
  state_id: string;
  state_name: string;
}

// Facilities API functions
export async function createFacility(payload: CreateFacilityRequest) {
  return apiFetch<Facility[]>(getEpFacilities(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'facilities');
}

export async function listFacilities() {
  return apiFetch<Facility[]>(getEpFacilities(), {}, 'facilities');
}

export async function getFacility(id: number) {
  return apiFetch<Facility[]>(`${getEpFacilities()}/${id}`, {}, 'facilities');
}

export async function updateFacility(id: number, payload: UpdateFacilityRequest) {
  return apiFetch<Facility[]>(`${getEpFacilities()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'facilities');
}

export async function deleteFacility(id: number) {
  return apiFetch<Facility[]>(`${getEpFacilities()}/${id}`, {
    method: 'DELETE',
  }, 'facilities');
}