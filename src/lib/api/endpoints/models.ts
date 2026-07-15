import { apiFetch, apiFetchWithNormalization } from '../client';
import { getEpModelCats, getEpModels, getEpManufacturers, getEpComponentCats, getEpModelComponents, getEpSearchModels, getEpSearchBrands } from '../endpoints';
import { FacilityIsActive } from "../../types/consolidated-enums.js";
import { type ApiData } from '../types.js';

// Model Categories interfaces
export interface ModelCategory {
  model_cat_id: number;
  parent_cat_id?: number;
  labor_rate_id: number;
  cat_name: string;
}

export interface CreateModelCategoryRequest {
  parent_cat_id?: number;
  labor_rate_id: number;
  cat_name: string;
}

export interface UpdateModelCategoryRequest extends CreateModelCategoryRequest {
  model_cat_id: number;
}

// Manufacturers interfaces
export interface Manufacturer {
  mfg_id: number;
  name: string;
}

export interface CreateManufacturerRequest {
  name: string;
}

export interface UpdateManufacturerRequest extends CreateManufacturerRequest {
  mfg_id: number;
}

// Component Categories interfaces
export interface ComponentCategory {
  cat_id: number;
  cat_name: string;
}

export interface CreateComponentCategoryRequest {
  cat_name: string;
}

export interface UpdateComponentCategoryRequest extends CreateComponentCategoryRequest {
  cat_id: number;
}

// Model Components interfaces
export interface ModelComponent {
  model_component_id: number;
  model_id: number;
  mfg_id: number;
  cat_id: number;
  desc: string;
  oem_part_num?: string;
  int_part_num?: string;
  warranty?: string;
}

export interface CreateModelComponentRequest {
  model_id: number;
  mfg_id: number;
  cat_id: number;
  desc: string;
  oem_part_num?: string;
  int_part_num?: string;
  warranty?: string;
}

export interface UpdateModelComponentRequest extends CreateModelComponentRequest {
  model_component_id: number;
}

// Models interfaces
export interface Model {
  model_id: number;
  brand_id: number;
  model_cat_id?: number;
  model_name: string;
  serial?: string;
  mfg_month?: number;
  mfg_year?: number;
}

export interface CreateModelRequest {
  brand_id: number;
  model_cat_id?: number;
  model_name: string;
  serial?: string;
  mfg_month?: number;
  mfg_year?: number;
}

export interface UpdateModelRequest extends CreateModelRequest {
  model_id: number;
}

// Model Categories API functions
export async function createModelCategory(payload: CreateModelCategoryRequest) {
  return apiFetch<ModelCategory[]>(getEpModelCats(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'model_cats');
}

export async function listModelCategories() {
  return apiFetch<ModelCategory[]>(getEpModelCats(), {}, 'model_cats');
}

export async function getModelCategory(id: number) {
  return apiFetch<ModelCategory[]>(`${getEpModelCats()}/${id}`, {}, 'model_cats');
}

export async function updateModelCategory(id: number, payload: UpdateModelCategoryRequest) {
  return apiFetch<ModelCategory[]>(`${getEpModelCats()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'model_cats');
}

export async function deleteModelCategory(id: number) {
  return apiFetch<ModelCategory[]>(`${getEpModelCats()}/${id}`, {
    method: 'DELETE',
  }, 'model_cats');
}

// Models API functions
export async function createModel(payload: CreateModelRequest) {
  return apiFetch<Model[]>(getEpModels(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'models');
}

export async function listModels() {
  return apiFetch<Model[]>(getEpModels(), {}, 'models');
}

export async function getModel(id: number) {
  return apiFetch<Model[]>(`${getEpModels()}/${id}`, {}, 'models');
}

export async function updateModel(id: number, payload: UpdateModelRequest) {
  return apiFetch<Model[]>(`${getEpModels()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'models');
}

export async function deleteModel(id: number) {
  return apiFetch<Model[]>(`${getEpModels()}/${id}`, {
    method: 'DELETE',
  }, 'models');
}

// Manufacturers API functions
export async function createManufacturer(payload: CreateManufacturerRequest) {
  return apiFetch<Manufacturer[]>(getEpManufacturers(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'manufacturers');
}

export async function listManufacturers() {
  return apiFetch<Manufacturer[]>(getEpManufacturers(), {}, 'manufacturers');
}

export async function getManufacturer(id: number) {
  return apiFetch<Manufacturer[]>(`${getEpManufacturers()}/${id}`, {}, 'manufacturers');
}

export async function updateManufacturer(id: number, payload: UpdateManufacturerRequest) {
  return apiFetch<Manufacturer[]>(`${getEpManufacturers()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'manufacturers');
}

export async function deleteManufacturer(id: number) {
  return apiFetch<Manufacturer[]>(`${getEpManufacturers()}/${id}`, {
    method: 'DELETE',
  }, 'manufacturers');
}

// Component Categories API functions
export async function createComponentCategory(payload: CreateComponentCategoryRequest) {
  return apiFetch<ComponentCategory[]>(getEpComponentCats(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'component_cats');
}

export async function listComponentCategories() {
  return apiFetch<ComponentCategory[]>(getEpComponentCats(), {}, 'component_cats');
}

export async function getComponentCategory(id: number) {
  return apiFetch<ComponentCategory[]>(`${getEpComponentCats()}/${id}`, {}, 'component_cats');
}

export async function updateComponentCategory(id: number, payload: UpdateComponentCategoryRequest) {
  return apiFetch<ComponentCategory[]>(`${getEpComponentCats()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'component_cats');
}

export async function deleteComponentCategory(id: number) {
  return apiFetch<ComponentCategory[]>(`${getEpComponentCats()}/${id}`, {
    method: 'DELETE',
  }, 'component_cats');
}

// Model Components API functions
export async function createModelComponent(payload: CreateModelComponentRequest) {
  return apiFetch<ModelComponent[]>(getEpModelComponents(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'model_components');
}

export async function listModelComponents() {
  return apiFetch<ModelComponent[]>(getEpModelComponents(), {}, 'model_components');
}

export async function getModelComponent(id: number) {
  return apiFetch<ModelComponent[]>(`${getEpModelComponents()}/${id}`, {}, 'model_components');
}

export async function updateModelComponent(id: number, payload: UpdateModelComponentRequest) {
  return apiFetch<ModelComponent[]>(`${getEpModelComponents()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'model_components');
}

export async function deleteModelComponent(id: number) {
  return apiFetch<ModelComponent[]>(`${getEpModelComponents()}/${id}`, {
    method: 'DELETE',
  }, 'model_components');
}

// Search interfaces
export interface ModelWithBrandResponse {
  model_id: number | null;
  brand_id: number;
  brand_name: string;
  model_cat_id: number | null;
  model_name: string;
  serial: string | null;
  mfg_month: number | null;
  mfg_year: number | null;
}

export interface BrandResponse {
  brand_id: number | null;
  name: string;
}

export interface SearchModelsResponse {
  data: {
    models: ModelWithBrandResponse[];
  };
  error: {
    message: string;
  };
}

export interface SearchBrandsResponse {
  data: {
    brands: BrandResponse[];
  };
  error: {
    message: string;
  };
}

// Search API functions
export async function searchModelsByBrandModel(modelName: string, brandName: string, page: number = 1, limit: number = 10) {
  const params = new URLSearchParams({
    model_name: modelName,
    brand_name: brandName,
    page: page.toString(),
    limit: limit.toString()
  });

  return apiFetchWithNormalization<ModelWithBrandResponse[]>(
    `${getEpSearchModels()}?${params}`,
    {},
    'models'
  );
}

export async function searchModelsGeneral(searchTerm: string, page: number = 1, limit: number = 10) {
  const params = new URLSearchParams({
    q: searchTerm,
    page: page.toString(),
    limit: limit.toString()
  });

  return apiFetchWithNormalization<ModelWithBrandResponse[]>(
    `${getEpSearchModels()}?${params}`,
    {},
    'models'
  );
}

export async function searchBrandsByName(brandName: string, page: number = 1, limit: number = 10) {
  const params = new URLSearchParams({
    brands: brandName,
    page: page.toString(),
    limit: limit.toString()
  });

  return apiFetchWithNormalization<BrandResponse[]>(
    `${getEpSearchBrands()}?${params}`,
    {},
    'brands'
  );
}

export async function searchBrandsGeneral(searchTerm: string, page: number = 1, limit: number = 10) {
  const params = new URLSearchParams({
    q: searchTerm,
    page: page.toString(),
    limit: limit.toString()
  });

  return apiFetchWithNormalization<BrandResponse[]>(
    `${getEpSearchBrands()}?${params}`,
    {},
    'brands'
  );
}