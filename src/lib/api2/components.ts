// Components Module - Component Categories, Model Components
import { apiFetch } from './client';

// Interfaces
export interface ComponentCat {
  cat_id?: number;
  cat_name: string;
}

export interface ModelComponent {
  model_component_id?: number;
  model_id: number;
  mfg_id: number;
  cat_id: number;
  parent_id?: number;
  desc: string;
  unit_cost: number;
  unit_price: number;
  oem_part_num?: string;
  int_part_num?: string;
  warranty?: string;
}

export interface CreateComponentCatRequest {
  cat_name: string;
}

export interface UpdateComponentCatRequest {
  cat_name?: string;
}

export interface CreateModelComponentRequest {
  model_id: number;
  mfg_id: number;
  cat_id: number;
  parent_id?: number;
  desc: string;
  unit_cost?: number;
  unit_price?: number;
  oem_part_num?: string;
  int_part_num?: string;
  warranty?: string;
}

export interface UpdateModelComponentRequest {
  model_id?: number;
  mfg_id?: number;
  cat_id?: number;
  parent_id?: number | null;
  desc?: string;
  unit_cost?: number;
  unit_price?: number;
  oem_part_num?: string;
  int_part_num?: string;
  warranty?: string;
}

export interface ComponentCatResponse {
  data: {
    component_cats: ComponentCat[];
  };
  error: {
    message: string;
  };
}

export interface ModelComponentResponse {
  data: {
    model_components: ModelComponent[];
  };
  error: {
    message: string;
  };
}

// API Functions
export async function createComponentCat(componentCatRequest: CreateComponentCatRequest) {
  return apiFetch<ComponentCat[]>(`/component_cats`, {
    method: 'POST',
    body: JSON.stringify(componentCatRequest),
  }, 'component_cats');
}

export async function getComponentCat(catId: number) {
  return apiFetch<ComponentCat[]>(`/component_cats/${catId}`, {
    method: 'GET',
  }, 'component_cats');
}

export async function updateComponentCat(catId: number, componentCatRequest: UpdateComponentCatRequest) {
  return apiFetch<ComponentCat[]>(`/component_cats/${catId}`, {
    method: 'PUT',
    body: JSON.stringify(componentCatRequest),
  }, 'component_cats');
}

export async function deleteComponentCat(catId: number) {
  return apiFetch<ComponentCat[]>(`/component_cats/${catId}`, {
    method: 'DELETE',
  }, 'component_cats');
}

export async function listComponentCats(params?: { page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<ComponentCat[]>(`/component_cats?${queryParams}`, {
    method: 'GET',
  }, 'component_cats');
}

export async function createModelComponent(modelComponentRequest: CreateModelComponentRequest) {
  return apiFetch<ModelComponent[]>(`/model_components`, {
    method: 'POST',
    body: JSON.stringify(modelComponentRequest),
  }, 'model_components');
}

export async function getModelComponent(modelComponentId: number) {
  return apiFetch<ModelComponent[]>(`/model_components/${modelComponentId}`, {
    method: 'GET',
  }, 'model_components');
}

export async function updateModelComponent(modelComponentId: number, modelComponentRequest: UpdateModelComponentRequest) {
  return apiFetch<ModelComponent[]>(`/model_components/${modelComponentId}`, {
    method: 'PUT',
    body: JSON.stringify(modelComponentRequest),
  }, 'model_components');
}

export async function deleteModelComponent(modelComponentId: number) {
  return apiFetch<ModelComponent[]>(`/model_components/${modelComponentId}`, {
    method: 'DELETE',
  }, 'model_components');
}

export async function listModelComponents(params?: { model_id?: number; mfg_id?: number; cat_id?: number; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<ModelComponent[]>(`/model_components?${queryParams}`, {
    method: 'GET',
  }, 'model_components');
}

