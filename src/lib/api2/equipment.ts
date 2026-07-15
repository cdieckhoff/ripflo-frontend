// Equipment Module - Brands, Manufacturers, Model Categories, Models, Assets, Asset Transfers
import { apiFetch } from './client';

// Enums
export enum AssetPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Interfaces
export interface Brand {
  brand_id?: number;
  name: string;
}

export interface Manufacturer {
  mfg_id?: number;
  name: string;
}

export interface ModelCat {
  model_cat_id?: number;
  parent_cat_id?: number;
  labor_rate_id: number;
  cat_name: string;
}

export interface Model {
  model_id?: number;
  brand_id: number;
  model_cat_id?: number;
  model_name: string;
  serial?: string;
  mfg_month?: number;
  mfg_year?: number;
}

export interface ModelWithBrand extends Model {
  brand_name: string;
}

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

export interface AssetXfer {
  asset_xfer_id?: number;
  asset_id: number;
  fac_from: number;
  fac_to: number;
  loc_from: string;
  loc_to: string;
}

export interface CreateBrandRequest {
  name: string;
}

export interface UpdateBrandRequest {
  name?: string;
}

export interface CreateManufacturerRequest {
  name: string;
}

export interface UpdateManufacturerRequest {
  name?: string;
}

export interface CreateModelCatRequest {
  parent_cat_id?: number;
  labor_rate_id: number;
  cat_name: string;
}

export interface UpdateModelCatRequest {
  parent_cat_id?: number | null;
  labor_rate_id?: number;
  cat_name?: string;
}

export interface CreateModelRequest {
  brand_id?: number;
  brand_name?: string;
  model_cat_id?: number;
  model_name: string;
  serial?: string;
  mfg_month?: number;
  mfg_year?: number;
}

export interface UpdateModelRequest {
  brand_id?: number;
  model_cat_id?: number;
  model_name?: string;
  serial?: string;
  mfg_month?: number;
  mfg_year?: number;
}

export interface CreateAssetRequest {
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

export interface UpdateAssetRequest {
  contact_id?: number;
  model_id?: number | null;
  serial?: string;
  mfg_month?: number | null;
  mfg_year?: number | null;
  custom_serial?: string;
  hours?: number;
  brand_name?: string;
  model_name?: string;
}

export interface CreateAssetXferRequest {
  asset_id: number;
  fac_from: number;
  fac_to: number;
  loc_from: string;
  loc_to: string;
}

export interface UpdateAssetXferRequest {
  asset_id?: number;
  fac_from?: number;
  fac_to?: number;
  loc_from?: string;
  loc_to?: string;
}

export interface BrandResponse {
  data: {
    brands: Brand[];
  };
  error: {
    message: string;
  };
}

export interface ManufacturerResponse {
  data: {
    manufacturers: Manufacturer[];
  };
  error: {
    message: string;
  };
}

export interface ModelCatResponse {
  data: {
    model_cats: ModelCat[];
  };
  error: {
    message: string;
  };
}

export interface ModelResponse {
  data: {
    models: (Model & { brand_name: string })[];
  };
  error: {
    message: string;
  };
}

export interface AssetResponse {
  data: {
    assets: Asset[];
  };
  error: {
    message: string;
  };
}

export interface AssetXferResponse {
  data: {
    asset_xfers: AssetXfer[];
  };
  error: {
    message: string;
  };
}

// API Functions
export async function createBrand(brandRequest: CreateBrandRequest) {
  return apiFetch<Brand[]>(`/brands`, {
    method: 'POST',
    body: JSON.stringify(brandRequest),
  }, 'brands');
}

export async function getBrand(brandId: number) {
  return apiFetch<Brand[]>(`/brands/${brandId}`, {
    method: 'GET',
  }, 'brands');
}

export async function updateBrand(brandId: number, brandRequest: UpdateBrandRequest) {
  return apiFetch<Brand[]>(`/brands/${brandId}`, {
    method: 'PUT',
    body: JSON.stringify(brandRequest),
  }, 'brands');
}

export async function deleteBrand(brandId: number) {
  return apiFetch<Brand[]>(`/brands/${brandId}`, {
    method: 'DELETE',
  }, 'brands');
}

export async function listBrands(params?: { page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<Brand[]>(`/brands?${queryParams}`, {
    method: 'GET',
  }, 'brands');
}

export async function createManufacturer(manufacturerRequest: CreateManufacturerRequest) {
  return apiFetch<Manufacturer[]>(`/manufacturers`, {
    method: 'POST',
    body: JSON.stringify(manufacturerRequest),
  }, 'manufacturers');
}

export async function getManufacturer(mfgId: number) {
  return apiFetch<Manufacturer[]>(`/manufacturers/${mfgId}`, {
    method: 'GET',
  }, 'manufacturers');
}

export async function updateManufacturer(mfgId: number, manufacturerRequest: UpdateManufacturerRequest) {
  return apiFetch<Manufacturer[]>(`/manufacturers/${mfgId}`, {
    method: 'PUT',
    body: JSON.stringify(manufacturerRequest),
  }, 'manufacturers');
}

export async function deleteManufacturer(mfgId: number) {
  return apiFetch<Manufacturer[]>(`/manufacturers/${mfgId}`, {
    method: 'DELETE',
  }, 'manufacturers');
}

export async function listManufacturers(params?: { page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<Manufacturer[]>(`/manufacturers?${queryParams}`, {
    method: 'GET',
  }, 'manufacturers');
}

export async function createModelCat(modelCatRequest: CreateModelCatRequest) {
  return apiFetch<ModelCat[]>(`/model_cats`, {
    method: 'POST',
    body: JSON.stringify(modelCatRequest),
  }, 'model_cats');
}

export async function getModelCat(modelCatId: number) {
  return apiFetch<ModelCat[]>(`/model_cats/${modelCatId}`, {
    method: 'GET',
  }, 'model_cats');
}

export async function updateModelCat(modelCatId: number, modelCatRequest: UpdateModelCatRequest) {
  return apiFetch<ModelCat[]>(`/model_cats/${modelCatId}`, {
    method: 'PUT',
    body: JSON.stringify(modelCatRequest),
  }, 'model_cats');
}

export async function deleteModelCat(modelCatId: number) {
  return apiFetch<ModelCat[]>(`/model_cats/${modelCatId}`, {
    method: 'DELETE',
  }, 'model_cats');
}

export async function listModelCats(params?: { page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<ModelCat[]>(`/model_cats?${queryParams}`, {
    method: 'GET',
  }, 'model_cats');
}

export async function createModel(modelRequest: CreateModelRequest) {
  return apiFetch<Model[]>(`/models`, {
    method: 'POST',
    body: JSON.stringify(modelRequest),
  }, 'models');
}

export async function getModel(modelId: number) {
  return apiFetch<Model[]>(`/models/${modelId}`, {
    method: 'GET',
  }, 'models');
}

export async function updateModel(modelId: number, modelRequest: UpdateModelRequest) {
  return apiFetch<Model[]>(`/models/${modelId}`, {
    method: 'PUT',
    body: JSON.stringify(modelRequest),
  }, 'models');
}

export async function deleteModel(modelId: number) {
  return apiFetch<Model[]>(`/models/${modelId}`, {
    method: 'DELETE',
  }, 'models');
}

export async function listModels(params?: { brand_id?: number; model_cat_id?: number; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<Model[]>(`/models?${queryParams}`, {
    method: 'GET',
  }, 'models');
}

export async function createAsset(assetRequest: CreateAssetRequest) {
  return apiFetch<Asset[]>(`/assets`, {
    method: 'POST',
    body: JSON.stringify(assetRequest),
  }, 'assets');
}

export async function getAsset(assetId: number) {
  return apiFetch<Asset[]>(`/assets/${assetId}`, {
    method: 'GET',
  }, 'assets');
}

export async function updateAsset(assetId: number, assetRequest: UpdateAssetRequest) {
  return apiFetch<Asset[]>(`/assets/${assetId}`, {
    method: 'PUT',
    body: JSON.stringify(assetRequest),
  }, 'assets');
}

export async function deleteAsset(assetId: number) {
  return apiFetch<Asset[]>(`/assets/${assetId}`, {
    method: 'DELETE',
  }, 'assets');
}

export async function listAssets(params?: { contact_id?: number; model_id?: number; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<Asset[]>(`/assets?${queryParams}`, {
    method: 'GET',
  }, 'assets');
}

export async function searchAssets(searchTerm: string) {
  return apiFetch<Asset[]>(`/search/assets?q=${encodeURIComponent(searchTerm)}`, {
    method: 'GET',
  }, 'assets');
}

export async function createAssetXfer(assetXferRequest: CreateAssetXferRequest) {
  return apiFetch<AssetXfer[]>(`/asset_xfers`, {
    method: 'POST',
    body: JSON.stringify(assetXferRequest),
  }, 'asset_xfers');
}

export async function getAssetXfer(assetXferId: number) {
  return apiFetch<AssetXfer[]>(`/asset_xfers/${assetXferId}`, {
    method: 'GET',
  }, 'asset_xfers');
}

export async function updateAssetXfer(assetXferId: number, assetXferRequest: UpdateAssetXferRequest) {
  return apiFetch<AssetXfer[]>(`/asset_xfers/${assetXferId}`, {
    method: 'PUT',
    body: JSON.stringify(assetXferRequest),
  }, 'asset_xfers');
}

export async function deleteAssetXfer(assetXferId: number) {
  return apiFetch<AssetXfer[]>(`/asset_xfers/${assetXferId}`, {
    method: 'DELETE',
  }, 'asset_xfers');
}

export async function listAssetXfers(params?: { asset_id?: number; fac_from?: number; fac_to?: number; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<AssetXfer[]>(`/asset_xfers?${queryParams}`, {
    method: 'GET',
  }, 'asset_xfers');
}