import { apiFetch } from '../client';
import { rfState } from '../../rf.svelte';

// Master Catalog Item interface
export interface MasterCatalogItem {
  master_id: number;
  brand_id?: number;
  sku: string;
  upc?: string;
  ean?: string;
  barcode_norm?: string;
  mfg_part_num?: string;
  desc: string;
  type_field: 'part' | 'labor' | 'kit' | 'fee';
  unit_cost: number;
  unit_price: number;
  markup_pct: number;
  taxable: number;
  tax_code: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// Create Master Catalog Request interface
export interface CreateMasterCatalogRequest {
  brand_id?: number;
  sku: string;
  upc?: string;
  ean?: string;
  barcode_norm?: string;
  mfg_part_num?: string;
  desc: string;
  type_field?: 'part' | 'labor' | 'kit' | 'fee';
  unit_cost?: number;
  unit_price?: number;
  markup_pct?: number;
  taxable?: number;
  tax_code?: string;
  is_active?: number;
}

// Update Master Catalog Request interface
export interface UpdateMasterCatalogRequest {
  brand_id?: number;
  sku?: string;
  upc?: string;
  ean?: string;
  barcode_norm?: string;
  mfg_part_num?: string;
  desc?: string;
  type_field?: 'part' | 'labor' | 'kit' | 'fee';
  unit_cost?: number;
  unit_price?: number;
  markup_pct?: number;
  taxable?: number;
  tax_code?: string;
  is_active?: number;
}

// List Master Catalog Items
export async function listMasterCatalog(page: number = 1, limit: number = 100) {
  const queryString = `?page=${page}&limit=${limit}`;
  return apiFetch<MasterCatalogItem[]>(`${rfState.apiHost}/master_catalog${queryString}`, {}, 'master_catalog');
}

// Search Master Catalog
export async function searchMasterCatalog(q: string, page: number = 1, limit: number = 100) {
  const queryString = `?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`;
  return apiFetch<MasterCatalogItem[]>(`${rfState.apiHost}/search/master_catalog${queryString}`, {}, 'master_catalog');
}

// Get Single Master Catalog Item
export async function getMasterCatalog(id: number) {
  return apiFetch<MasterCatalogItem[]>(`${rfState.apiHost}/master_catalog/${id}`, {}, 'master_catalog');
}

// Create Master Catalog Item
export async function createMasterCatalog(payload: CreateMasterCatalogRequest) {
  return apiFetch<MasterCatalogItem[]>(`${rfState.apiHost}/master_catalog`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }, 'master_catalog');
}

// Update Master Catalog Item
export async function updateMasterCatalog(id: number, payload: UpdateMasterCatalogRequest) {
  return apiFetch<MasterCatalogItem[]>(`${rfState.apiHost}/master_catalog/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }, 'master_catalog');
}

// Delete Master Catalog Item
export async function deleteMasterCatalog(id: number) {
  return apiFetch<MasterCatalogItem[]>(`${rfState.apiHost}/master_catalog/${id}`, {
    method: 'DELETE'
  }, 'master_catalog');
}
