import { apiFetch, apiFetchWithNormalization } from '../client';
import { getEpAssets, getEpAssetXfers, getEpSearchAssets } from '../endpoints';
import { type ApiData } from '../types.js';

// Assets interfaces
export interface Asset {
  asset_id?: number;
  contact_id: number;
  model_id?: number;
  serial?: string;
  mfg_month?: number;
  mfg_year?: number;
  custom_serial?: string;
  hours?: number;
  brand_name?: string;
  model_name?: string;
}

// Asset search result interface
export interface AssetSearchResult {
  asset_id: number;
  contact_id: number;
  model_id: number;
  serial: string;
  asset_tag: string;
  purchase_date: string;
  warranty_expire: string;
  notes: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}
// Create Asset Request
export interface CreateAssetRequest {
  contact_id: number;
  model_id?: number;
  serial?: string;
  mfg_month?: number;
  mfg_year?: number;
  custom_serial?: string;
  hours?: number;
}

export interface UpdateAssetRequest {
  contact_id?: number;
  model_id?: number | null;
  serial?: string;
  mfg_month?: number | null;
  mfg_year?: number | null;
  custom_serial?: string;
  hours?: number;
}


// Asset Transfers interfaces
export interface AssetTransfer {
  asset_xfer_id: number;
  asset_id: number;
  fac_from: number;
  fac_to: number;
  loc_from: string;
  loc_to: string;
}

export interface CreateAssetTransferRequest {
  asset_id: number;
  fac_from: number;
  fac_to: number;
  loc_from: string;
  loc_to: string;
}

export interface UpdateAssetTransferRequest extends CreateAssetTransferRequest {
  asset_xfer_id: number;
}

// Assets API functions
export async function createAsset(payload: CreateAssetRequest) {
  return apiFetch<Asset[]>(getEpAssets(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'assets');
}

export async function listAssets() {
  return apiFetch<Asset[]>(getEpAssets(), {}, 'assets');
}

export async function getAsset(id: number) {
  return apiFetch<Asset[]>(`${getEpAssets()}/${id}`, {}, 'assets');
}

export async function updateAsset(id: number, payload: UpdateAssetRequest) {
  return apiFetch<Asset[]>(`${getEpAssets()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'assets');
}

export async function deleteAsset(id: number) {
  return apiFetch<Asset[]>(`${getEpAssets()}/${id}`, {
    method: 'DELETE',
  }, 'assets');
}

export async function searchAssets(q: string) {
  const queryString = `?q=${encodeURIComponent(q)}`;
  return apiFetch<AssetSearchResult[]>(`${getEpSearchAssets()}${queryString}`, {}, 'assets');
}

// Asset Transfers API functions
export async function createAssetTransfer(payload: CreateAssetTransferRequest) {
  return apiFetch<AssetTransfer[]>(getEpAssetXfers(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'asset_xfers');
}

export async function listAssetTransfers() {
  return apiFetch<AssetTransfer[]>(getEpAssetXfers(), {}, 'asset_xfers');
}

export async function getAssetTransfer(id: number) {
  return apiFetch<AssetTransfer[]>(`${getEpAssetXfers()}/${id}`, {}, 'asset_xfers');
}

export async function updateAssetTransfer(id: number, payload: UpdateAssetTransferRequest) {
  return apiFetch<AssetTransfer[]>(`${getEpAssetXfers()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'asset_xfers');
}

export async function deleteAssetTransfer(id: number) {
  return apiFetch<AssetTransfer[]>(`${getEpAssetXfers()}/${id}`, {
    method: 'DELETE',
  }, 'asset_xfers');
}