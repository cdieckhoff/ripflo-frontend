// Workorders Module - Workorders, Workorder Notes, Workorder Items, Workorder Techs, Workorder Statuses, Workorder Assignment Roles
import { apiFetch } from './client';

// Enums
export enum WorkorderStatus {
  NEW = 'new',
  DIAGNOSING = 'diagnosing',
  IN_PROGRESS = 'in-progress',
  WAITING_PARTS = 'waiting-parts',
  COMPLETE = 'complete',
  CANCELLED = 'cancelled'
}

export enum WorkorderNoteType {
  PROBLEM = 'problem',
  SOLUTION = 'solution',
  MEMO = 'memo'
}

export enum WorkorderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum WorkorderAssignmentRole {
  LEAD = 'lead',
  DIAGNOSTIC = 'diagnostic',
  SERVICE = 'service',
  SUPPORT = 'support'
}

// Interfaces
export interface Workorder {
  workorder_id?: number;
  wo_text: string;
  contact_id: number;
  asset_id: number;
  parent_id?: number;
  created_by: number;
  fac_id?: number;
  status: number;
  priority: string;
  estimated_hours?: number;
  actual_hours?: number;
  total_price?: number;
  total_cost?: number;
  begin_dt?: string;
  end_dt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkorderNote {
  note_id?: number;
  workorder_id: number;
  author_user_id?: number;
  author_contact_id?: number;
  type: string;
  text: string;
  is_private: number;
  created_at?: string;
}

export interface WorkorderItem {
  wo_items_id?: number;
  wo_id: number;
  model_component_id?: number;
  code: string;
  desc: string;
  qty: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
}

export interface WorkorderTech {
  wo_tech_id?: number;
  workorder_id: number;
  user_id?: number;
  role: string;
  assigned_at?: string;
  removed_at?: string;
  is_current: number;
}

export interface WorkorderStatus {
  wo_status_id?: number;
  status: string;
}

export interface WorkorderAssignmentRole {
  role_key: string;
  display: string;
  sort: number;
  is_active: number;
}

export interface CreateWorkorderRequest {
  wo_text: string;
  contact_id: number;
  asset_id: number;
  parent_id?: number;
  created_by: number;
  fac_id?: number;
  status: number;
  priority?: string;
  estimated_hours?: number;
  begin_dt?: string;
}

export interface UpdateWorkorderRequest {
  wo_text?: string;
  contact_id?: number;
  asset_id?: number;
  parent_id?: number | null;
  created_by?: number;
  fac_id?: number | null;
  status?: number;
  priority?: string;
  estimated_hours?: number;
  actual_hours?: number;
  total_price?: number;
  total_cost?: number;
  begin_dt?: string;
  end_dt?: string;
}

export interface CreateWorkorderNoteRequest {
  workorder_id: number;
  author_user_id?: number;
  author_contact_id?: number;
  type: string;
  text: string;
  is_private?: number;
}

export interface UpdateWorkorderNoteRequest {
  workorder_id?: number;
  author_user_id?: number | null;
  author_contact_id?: number | null;
  type?: string;
  text?: string;
  is_private?: number;
}

export interface CreateWorkorderItemRequest {
  wo_id: number;
  model_component_id?: number;
  code: string;
  desc: string;
  qty: number;
  unit_price: number;
}

export interface UpdateWorkorderItemRequest {
  wo_id?: number;
  model_component_id?: number | null;
  code?: string;
  desc?: string;
  qty?: number;
  unit_price?: number;
}

export interface CreateWorkorderTechRequest {
  workorder_id: number;
  user_id?: number;
  role: string;
}

export interface UpdateWorkorderTechRequest {
  workorder_id?: number;
  user_id?: number | null;
  role?: string;
  removed_at?: string;
}

export interface UpdateWorkorderStatusRequest {
  status?: string;
}

export interface UpdateWorkorderAssignmentRoleRequest {
  display?: string;
  sort?: number;
  is_active?: number;
}

export interface WorkorderResponse {
  data: {
    workorders: Workorder[];
  };
  error: {
    message: string;
  };
}

export interface WorkorderNoteResponse {
  data: {
    workorder_notes: WorkorderNote[];
  };
  error: {
    message: string;
  };
}

export interface WorkorderItemResponse {
  data: {
    workorder_items: WorkorderItem[];
  };
  error: {
    message: string;
  };
}

export interface WorkorderTechResponse {
  data: {
    workorder_techs: WorkorderTech[];
  };
  error: {
    message: string;
  };
}

export interface WorkorderStatusResponse {
  data: {
    workorder_statuses: WorkorderStatus[];
  };
  error: {
    message: string;
  };
}

export interface WorkorderAssignmentRoleResponse {
  data: {
    workorder_assignment_roles: WorkorderAssignmentRole[];
  };
  error: {
    message: string;
  };
}

// API Functions
export async function createWorkorder(workorderRequest: CreateWorkorderRequest) {
  return apiFetch<Workorder[]>(`/workorders`, {
    method: 'POST',
    body: JSON.stringify(workorderRequest),
  }, 'workorders');
}

export async function getWorkorder(workorderId: number) {
  return apiFetch<Workorder[]>(`/workorders/${workorderId}`, {
    method: 'GET',
  }, 'workorders');
}

export async function updateWorkorder(workorderId: number, workorderRequest: UpdateWorkorderRequest) {
  return apiFetch<Workorder[]>(`/workorders/${workorderId}`, {
    method: 'PUT',
    body: JSON.stringify(workorderRequest),
  }, 'workorders');
}

export async function updateWorkorderStatus(workorderId: number, statusId: number) {
  return apiFetch<Workorder[]>(`/workorders/${workorderId}/status/${statusId}`, {
    method: 'PUT',
  }, 'workorders');
}

export async function deleteWorkorder(workorderId: number) {
  return apiFetch<Workorder[]>(`/workorders/${workorderId}`, {
    method: 'DELETE',
  }, 'workorders');
}

export async function listWorkorders(params?: { contact_id?: number; asset_id?: number; status?: number; priority?: string; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<Workorder[]>(`/workorders?${queryParams}`, {
    method: 'GET',
  }, 'workorders');
}

export async function searchWorkorders(searchTerm: string) {
  return apiFetch<Workorder[]>(`/search/workorders?q=${encodeURIComponent(searchTerm)}`, {
    method: 'GET',
  }, 'workorders');
}

export async function createWorkorderNote(workorderNoteRequest: CreateWorkorderNoteRequest) {
  return apiFetch<WorkorderNote[]>(`/workorder_notes`, {
    method: 'POST',
    body: JSON.stringify(workorderNoteRequest),
  }, 'workorder_notes');
}

export async function getWorkorderNote(noteId: number) {
  return apiFetch<WorkorderNote[]>(`/workorder_notes/${noteId}`, {
    method: 'GET',
  }, 'workorder_notes');
}

export async function updateWorkorderNote(noteId: number, workorderNoteRequest: UpdateWorkorderNoteRequest) {
  return apiFetch<WorkorderNote[]>(`/workorder_notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify(workorderNoteRequest),
  }, 'workorder_notes');
}

export async function deleteWorkorderNote(noteId: number) {
  return apiFetch<WorkorderNote[]>(`/workorder_notes/${noteId}`, {
    method: 'DELETE',
  }, 'workorder_notes');
}

export async function listWorkorderNotes(params?: { workorder_id?: number; author_user_id?: number; author_contact_id?: number; type?: string; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<WorkorderNote[]>(`/workorder_notes?${queryParams}`, {
    method: 'GET',
  }, 'workorder_notes');
}

export async function searchWorkorderNotes(searchTerm: string) {
  return apiFetch<WorkorderNote[]>(`/search/workorder_notes?q=${encodeURIComponent(searchTerm)}`, {
    method: 'GET',
  }, 'workorder_notes');
}

export async function createWorkorderItem(workorderItemRequest: CreateWorkorderItemRequest) {
  return apiFetch<WorkorderItem[]>(`/workorder_items`, {
    method: 'POST',
    body: JSON.stringify(workorderItemRequest),
  }, 'workorder_items');
}

export async function getWorkorderItem(woItemsId: number) {
  return apiFetch<WorkorderItem[]>(`/workorder_items/${woItemsId}`, {
    method: 'GET',
  }, 'workorder_items');
}

export async function updateWorkorderItem(woItemsId: number, workorderItemRequest: UpdateWorkorderItemRequest) {
  return apiFetch<WorkorderItem[]>(`/workorder_items/${woItemsId}`, {
    method: 'PUT',
    body: JSON.stringify(workorderItemRequest),
  }, 'workorder_items');
}

export async function deleteWorkorderItem(woItemsId: number) {
  return apiFetch<WorkorderItem[]>(`/workorder_items/${woItemsId}`, {
    method: 'DELETE',
  }, 'workorder_items');
}

export async function listWorkorderItems(params?: { wo_id?: number; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<WorkorderItem[]>(`/workorder_items?${queryParams}`, {
    method: 'GET',
  }, 'workorder_items');
}

export async function searchWorkorderItems(searchTerm: string) {
  return apiFetch<WorkorderItem[]>(`/search/workorder_items?q=${encodeURIComponent(searchTerm)}`, {
    method: 'GET',
  }, 'workorder_items');
}

export async function createWorkorderTech(workorderTechRequest: CreateWorkorderTechRequest) {
  return apiFetch<WorkorderTech[]>(`/workorder_techs`, {
    method: 'POST',
    body: JSON.stringify(workorderTechRequest),
  }, 'workorder_techs');
}

export async function getWorkorderTech(woTechId: number) {
  return apiFetch<WorkorderTech[]>(`/workorder_techs/${woTechId}`, {
    method: 'GET',
  }, 'workorder_techs');
}

export async function updateWorkorderTech(woTechId: number, workorderTechRequest: UpdateWorkorderTechRequest) {
  return apiFetch<WorkorderTech[]>(`/workorder_techs/${woTechId}`, {
    method: 'PUT',
    body: JSON.stringify(workorderTechRequest),
  }, 'workorder_techs');
}

export async function deleteWorkorderTech(woTechId: number) {
  return apiFetch<WorkorderTech[]>(`/workorder_techs/${woTechId}`, {
    method: 'DELETE',
  }, 'workorder_techs');
}

export async function assignTechToWorkorder(workorderId: number, workorderTechRequest: CreateWorkorderTechRequest) {
  return apiFetch<WorkorderTech[]>(`/workorders/${workorderId}/techs`, {
    method: 'POST',
    body: JSON.stringify(workorderTechRequest),
  }, 'workorder_techs');
}

export async function listWorkorderTechs(params?: { workorder_id?: number; user_id?: number; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<WorkorderTech[]>(`/workorder_techs?${queryParams}`, {
    method: 'GET',
  }, 'workorder_techs');
}

export async function searchTechs(searchTerm: string) {
  return apiFetch<WorkorderTech[]>(`/search/techs?q=${encodeURIComponent(searchTerm)}`, {
    method: 'GET',
  }, 'workorder_techs');
}

export async function createWorkorderStatus(workorderStatusRequest: { status: string }) {
  return apiFetch<WorkorderStatus[]>(`/workorder_statuses`, {
    method: 'POST',
    body: JSON.stringify(workorderStatusRequest),
  }, 'workorder_statuses');
}

export async function getWorkorderStatus(statusId: number) {
  return apiFetch<WorkorderStatus[]>(`/workorder_statuses/${statusId}`, {
    method: 'GET',
  }, 'workorder_statuses');
}

export async function updateWorkorderStatus(statusId: number, workorderStatusRequest: UpdateWorkorderStatusRequest) {
  return apiFetch<WorkorderStatus[]>(`/workorder_statuses/${statusId}`, {
    method: 'PUT',
    body: JSON.stringify(workorderStatusRequest),
  }, 'workorder_statuses');
}

export async function deleteWorkorderStatus(statusId: number) {
  return apiFetch<WorkorderStatus[]>(`/workorder_statuses/${statusId}`, {
    method: 'DELETE',
  }, 'workorder_statuses');
}

export async function listWorkorderStatuses(params?: { page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<WorkorderStatus[]>(`/workorder_statuses?${queryParams}`, {
    method: 'GET',
  }, 'workorder_statuses');
}

export async function createWorkorderAssignmentRole(workorderAssignmentRoleRequest: WorkorderAssignmentRole) {
  return apiFetch<WorkorderAssignmentRole[]>(`/workorder_assignment_roles`, {
    method: 'POST',
    body: JSON.stringify(workorderAssignmentRoleRequest),
  }, 'workorder_assignment_roles');
}

export async function getWorkorderAssignmentRole(roleKey: string) {
  return apiFetch<WorkorderAssignmentRole[]>(`/workorder_assignment_roles/${roleKey}`, {
    method: 'GET',
  }, 'workorder_assignment_roles');
}

export async function updateWorkorderAssignmentRole(roleKey: string, workorderAssignmentRoleRequest: UpdateWorkorderAssignmentRoleRequest) {
  return apiFetch<WorkorderAssignmentRole[]>(`/workorder_assignment_roles/${roleKey}`, {
    method: 'PUT',
    body: JSON.stringify(workorderAssignmentRoleRequest),
  }, 'workorder_assignment_roles');
}

export async function deleteWorkorderAssignmentRole(roleKey: string) {
  return apiFetch<WorkorderAssignmentRole[]>(`/workorder_assignment_roles/${roleKey}`, {
    method: 'DELETE',
  }, 'workorder_assignment_roles');
}

export async function listWorkorderAssignmentRoles(params?: { page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<WorkorderAssignmentRole[]>(`/workorder_assignment_roles?${queryParams}`, {
    method: 'GET',
  }, 'workorder_assignment_roles');
}