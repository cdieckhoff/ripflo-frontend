import { apiFetch, apiFetchWithNormalization, normalizeApiData } from '../client';
import { getEpWorkOrders, getEpWorkOrderStatuses, getEpSearchWorkOrders } from '../endpoints';
import {
  Priority,
  WorkOrderType,
  WorkOrderNoteType
} from "../../types/consolidated-enums.js";
import { type ApiData, type BackendApiResponse } from '../types.js';

// Work Order Statuses interfaces
export interface WorkOrderStatus {
  wo_status_id: number;
  status: WorkOrderType;
}

export interface CreateWorkOrderStatusRequest {
  status: WorkOrderType;
}

export interface UpdateWorkOrderStatusRequest extends CreateWorkOrderStatusRequest {
  wo_status_id: number;
}

// Work Order Payloads
export interface WorkOrderNote {
  note_id?: number;
  workorder_id: number;
  author_user_id?: number;
  author_contact_id?: number;
  type_field: string; // Changed from type to type_field as per documentation
  text: string;
  is_private?: number; // Changed from boolean to number as per documentation
  created_at?: string;
}

export interface WorkOrderTech {
  wo_tech_id: number;
  workorder_id: number;
  user_id: number;
  role: string;
  assigned_at?: string;
  removed_at?: string;
  is_current: number;
}

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

export interface WorkOrder {
  workorder_id?: number;
  wo_text: string;
  contact_id: number;
  contact_name: string;
  asset_id: number;
  created_by: number;
  fac_id?: number;
  status: string; // Changed from number to string as per documentation
  priority: string;
  estimated_hours?: number;
  actual_hours?: number;
  total_cost?: number;
  begin_dt?: string;
  end_dt?: string;
  created_at?: string;
  updated_at?: string;
  brand_name?: string;
  model_name?: string;
  model_serial?: string;
  mfg_month?: number;
  mfg_year?: number;
  model_category?: string;
  asset_custom_serial?: string;
  asset_hours?: number;
  parent_id?: number; // Added for return workorder tracking
  notes?: WorkOrderNote[];
  techs?: WorkOrderTech[];
  items?: WorkorderItem[];
}

// Work Order Search Result interface
export interface WorkOrderSearchResult {
  workorder_id: number;
  contact_id: number;
  asset_id: number;
  workorder_status_id: number;
  workorder_priority_id: number;
  subject: string;
  wo_text: string;
  description: string;
  contact_name: string;
  brand_name: string;
  model_name: string;
  scheduled_start: string;
  scheduled_end: string;
  actual_start: string;
  actual_end: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkOrderRequest {
  contact_id: number;
  asset_id: number;
  created_by: number;
  fac_id?: number;
  status: number;
  priority?: Priority;
  estimated_hours?: number;
  begin_dt?: string;
}

export interface UpdateWorkOrderRequest {
  contact_id?: number;
  asset_id?: number;
  created_by?: number;
  fac_id?: number | null;
  status?: number;
  priority?: Priority;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  total_cost?: number | null;
  begin_dt?: string | null;
  end_dt?: string | null;
}

// Work Orders API functions
export async function createWorkOrder(payload: CreateWorkOrderRequest) {
  return apiFetch<WorkOrder[]>(getEpWorkOrders(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'workorders');
}

export async function listWorkOrders(queryParams?: { [key: string]: string }) {
  const query = queryParams ? new URLSearchParams(queryParams).toString() : '';
  return apiFetch<WorkOrder[]>(`${getEpWorkOrders()}${query ? '?' + query : ''}`, {}, 'workorders');
}

export async function getWorkOrders() {
  return apiFetch<WorkOrder[]>(getEpWorkOrders(), {}, 'workorders');
}

export async function getWorkOrder(id: number) {
  return apiFetch<WorkOrder[]>(`${getEpWorkOrders()}/${id}`, {}, 'workorders');
}

export async function updateWorkOrder(id: number, payload: UpdateWorkOrderRequest) {
  return apiFetch<WorkOrder[]>(`${getEpWorkOrders()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'workorders');
}

export async function updateWorkOrderStatus(workorderId: number, statusId: number) {
  return apiFetch<WorkOrder[]>(`${getEpWorkOrders()}/${workorderId}/status/${statusId}`, {
    method: 'PUT',
  }, 'workorders');
}

export async function deleteWorkOrder(id: number) {
  return apiFetch<WorkOrder[]>(`${getEpWorkOrders()}/${id}`, {
    method: 'DELETE',
  }, 'workorders');
}

// Work Order Statuses API functions
export async function createWorkOrderStatus(payload: CreateWorkOrderStatusRequest) {
  return apiFetch<WorkOrderStatus[]>(getEpWorkOrderStatuses(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'workorder_statuses');
}

export async function listWorkOrderStatuses() {
  return apiFetch<WorkOrderStatus[]>(getEpWorkOrderStatuses(), {}, 'workorder_statuses');
}

export async function getWorkOrderStatus(statusId: number) {
  return apiFetch<WorkOrderStatus[]>(`${getEpWorkOrderStatuses()}/${statusId}`, {}, 'workorder_statuses');
}

export async function updateWorkOrderStatusEntity(statusId: number, payload: UpdateWorkOrderStatusRequest) {
  return apiFetch<WorkOrderStatus[]>(`${getEpWorkOrderStatuses()}/${statusId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'workorder_statuses');
}

export async function deleteWorkOrderStatus(statusId: number) {
  return apiFetch<WorkOrderStatus[]>(`${getEpWorkOrderStatuses()}/${statusId}`, {
    method: 'DELETE',
  }, 'workorder_statuses');
}

// Work Order Search API function
export async function searchWorkOrders(q: string) {
  const queryString = `?q=${encodeURIComponent(q)}`;
  return apiFetch<WorkOrderSearchResult[]>(`${getEpSearchWorkOrders()}${queryString}`, {}, 'workorders');
}