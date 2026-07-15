import { apiFetch, apiFetchWithNormalization } from '../client';
import { getEpBrands } from '../endpoints';
import { type ApiData } from '../types.js';

// Brands interfaces
export interface Brand {
  brand_id: number;
  name: string;
}

export interface CreateBrandRequest {
  name: string;
}

export interface UpdateBrandRequest extends CreateBrandRequest {
  brand_id: number;
}

// Brands API functions
export async function createBrand(payload: CreateBrandRequest) {
  return apiFetch<Brand[]>(getEpBrands(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'brands');
}

export async function listBrands() {
  return apiFetch<Brand[]>(getEpBrands(), {}, 'brands');
}

export async function getBrand(id: number) {
  return apiFetch<Brand[]>(`${getEpBrands()}/${id}`, {}, 'brands');
}

export async function updateBrand(id: number, payload: UpdateBrandRequest) {
  return apiFetch<Brand[]>(`${getEpBrands()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'brands');
}

export async function deleteBrand(id: number) {
  return apiFetch<Brand[]>(`${getEpBrands()}/${id}`, {
    method: 'DELETE',
  }, 'brands');
}