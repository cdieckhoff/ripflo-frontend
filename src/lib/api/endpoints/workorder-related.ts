import { apiFetch, apiFetchWithNormalization } from '../client';
import { getEpWorkOrderNotes, getEpWorkOrderAssignmentRoles, getEpWorkOrderTechs, getEpWorkOrderItems, getEpSearchMasterCatalog } from '../endpoints';
import {
  WorkOrderAssignmentIsCurrent,
  WorkOrderAssignmentRole,
  WorkOrderNoteIsPrivate,
  WorkOrderNoteType,
  ContactIsActive,
} from "../../types/consolidated-enums.js";
import { type ApiData } from '../types.js';

// Work Order Notes interfaces
export interface WorkOrderNote {
  note_id?: number;
  workorder_id: number;
  author_user_id?: number;
  author_contact_id?: number;
  type: WorkOrderNoteType;
  text: string;
  is_private: WorkOrderNoteIsPrivate;
  created_at?: string;
}

export interface CreateWorkOrderNoteRequest {
  workorder_id: number;
  author_user_id?: number;
  author_contact_id?: number;
  type: WorkOrderNoteType;
  text: string;
  is_private?: WorkOrderNoteIsPrivate;
}

export interface UpdateWorkOrderNoteRequest extends CreateWorkOrderNoteRequest {
  note_id: number;
}

// Work Order Assignment Roles interfaces
export interface WorkOrderAssignmentRoleEntity {
  role_key: WorkOrderAssignmentRole;
  display: string;
  sort?: number;
  is_active: ContactIsActive;
}

export interface CreateWorkOrderAssignmentRoleRequest {
  role_key: WorkOrderAssignmentRole;
  display: string;
  sort?: number;
  is_active?: ContactIsActive;
}

export interface UpdateWorkOrderAssignmentRoleRequest extends CreateWorkOrderAssignmentRoleRequest {
  role_key: WorkOrderAssignmentRole;
}

// Work Order Techs interfaces
export interface WorkOrderTech {
  wo_tech_id: number;
  workorder_id: number;
  user_id: number;
  role: WorkOrderAssignmentRole;
  assigned_at?: string;
  removed_at?: string;
  is_current: WorkOrderAssignmentIsCurrent;
}

export interface CreateWorkOrderTechRequest {
  workorder_id: number;
  user_id: number;
  role: WorkOrderAssignmentRole;
}

export interface UpdateWorkOrderTechRequest {
  removed_at?: string;
  wo_tech_id: number;
}

// Work Order Items interfaces
export interface WorkorderItem {
  wo_items_id?: number;
  wo_id: number;
  code: string;
  desc: string;
  qty: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
}

export interface CreateWorkorderItemRequest {
  wo_id: number;
  code: string;
  desc: string;
  qty: number;
  unit_price: number;
}

export interface UpdateWorkorderItemRequest {
  wo_id?: number;
  code?: string;
  desc?: string;
  qty?: number;
  unit_price?: number;
}

// Work Order Notes API functions
export async function createWorkOrderNote(payload: CreateWorkOrderNoteRequest) {
  return apiFetch<WorkOrderNote[]>(getEpWorkOrderNotes(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'workorder_notes');
}

export async function listWorkOrderNotes() {
  return apiFetch<WorkOrderNote[]>(getEpWorkOrderNotes(), {}, 'workorder_notes');
}

export async function getWorkOrderNote(id: number) {
  return apiFetch<WorkOrderNote[]>(`${getEpWorkOrderNotes()}/${id}`, {}, 'workorder_notes');
}

export async function updateWorkOrderNote(id: number, payload: UpdateWorkOrderNoteRequest) {
  return apiFetch<WorkOrderNote[]>(`${getEpWorkOrderNotes()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'workorder_notes');
}

export async function deleteWorkOrderNote(id: number) {
  return apiFetch<WorkOrderNote[]>(`${getEpWorkOrderNotes()}/${id}`, {
    method: 'DELETE',
  }, 'workorder_notes');
}

// Work Order Assignment Roles API functions
export async function createWorkOrderAssignmentRole(payload: CreateWorkOrderAssignmentRoleRequest) {
  return apiFetch<WorkOrderAssignmentRoleEntity[]>(getEpWorkOrderAssignmentRoles(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'workorder_assignment_roles');
}

export async function listWorkOrderAssignmentRoles() {
  return apiFetch<WorkOrderAssignmentRoleEntity[]>(getEpWorkOrderAssignmentRoles(), {}, 'workorder_assignment_roles');
}

export async function getWorkOrderAssignmentRole(roleKey: string) {
  return apiFetch<WorkOrderAssignmentRoleEntity[]>(`${getEpWorkOrderAssignmentRoles()}/${roleKey}`, {}, 'workorder_assignment_roles');
}

export async function updateWorkOrderAssignmentRole(roleKey: string, payload: UpdateWorkOrderAssignmentRoleRequest) {
  return apiFetch<WorkOrderAssignmentRoleEntity[]>(`${getEpWorkOrderAssignmentRoles()}/${roleKey}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'workorder_assignment_roles');
}

export async function deleteWorkOrderAssignmentRole(roleKey: string) {
  return apiFetch<WorkOrderAssignmentRoleEntity[]>(`${getEpWorkOrderAssignmentRoles()}/${roleKey}`, {
    method: 'DELETE',
  }, 'workorder_assignment_roles');
}

// Work Order Techs API functions
export async function createWorkOrderTech(payload: CreateWorkOrderTechRequest) {
  return apiFetch<WorkOrderTech[]>(getEpWorkOrderTechs(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'workorder_techs');
}

export async function listWorkOrderTechs() {
  return apiFetch<WorkOrderTech[]>(getEpWorkOrderTechs(), {}, 'workorder_techs');
}

export async function getWorkOrderTech(id: number) {
  return apiFetch<WorkOrderTech[]>(`${getEpWorkOrderTechs()}/${id}`, {}, 'workorder_techs');
}

export async function updateWorkOrderTech(id: number, payload: UpdateWorkOrderTechRequest) {
  return apiFetch<WorkOrderTech[]>(`${getEpWorkOrderTechs()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'workorder_techs');
}

export async function deleteWorkOrderTech(id: number) {
  return apiFetch<WorkOrderTech[]>(`${getEpWorkOrderTechs()}/${id}`, {
    method: 'DELETE',
  }, 'workorder_techs');
}

// Search Techs API function
export async function searchTechs(q: string, id: number) {
  const queryString = `?q=${encodeURIComponent(q)}&id=${id}`;
  return apiFetch<WorkOrderTech[]>(`${getEpWorkOrderTechs()}/search${queryString}`, {}, 'workorder_techs');
}

// Work Order Items API functions
export async function createWorkOrderItem(payload: CreateWorkorderItemRequest) {
  return apiFetch<WorkorderItem[]>(getEpWorkOrderItems(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'workorder_items');
}

export async function listWorkOrderItems() {
  return apiFetch<WorkorderItem[]>(getEpWorkOrderItems(), {}, 'workorder_items');
}

export async function getWorkOrderItem(id: number) {
  return apiFetch<WorkorderItem[]>(`${getEpWorkOrderItems()}/${id}`, {}, 'workorder_items');
}

export async function updateWorkOrderItem(id: number, payload: UpdateWorkorderItemRequest) {
  return apiFetch<WorkorderItem[]>(`${getEpWorkOrderItems()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'workorder_items');
}

export async function deleteWorkOrderItem(id: number) {
  return apiFetch<WorkorderItem[]>(`${getEpWorkOrderItems()}/${id}`, {
    method: 'DELETE',
  }, 'workorder_items');
}

// Define the search result type for work order items
export interface WorkOrderItemSearchResult {
  id: number;
  wo_id: number | null;  // Can be null if the item exists in model_components but not in workorder_items
  code: string;
  desc: string;
  unit_price: number;
}

// Master Catalog search result type (matches backend response)
export interface MasterCatalogSearchResult {
  master_id: number;
  brand_id: number | null;
  sku: string;
  desc: string;
  type: string;
  unit_price: number;
  upc?: string;
  ean?: string;
  mfg_part_number?: string;
  [key: string]: any;  // Allow additional fields
}

// Work Order Items Search API function (legacy - kept for backward compatibility)
export async function searchWorkOrderItems(q: string) {
  const queryString = `?q=${encodeURIComponent(q)}`;
  return apiFetch<WorkOrderItemSearchResult[]>(`${getEpWorkOrderItems()}/search${queryString}`, {}, 'workorder_items');
}

// Master Catalog Search API function (uses FTS5 full-text search)
export async function searchMasterCatalog(q: string, page?: number, limit?: number) {
  const params = new URLSearchParams();
  params.append('q', q);
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  
  const queryString = `?${params.toString()}`;
  return apiFetch<MasterCatalogSearchResult[]>(`${getEpSearchMasterCatalog()}${queryString}`, {}, 'master_catalog');
}

export interface WorkorderItemResponse {
  data: {
    workorder_items: WorkorderItem[];
  };
  error: {
    message: string;
  };
}