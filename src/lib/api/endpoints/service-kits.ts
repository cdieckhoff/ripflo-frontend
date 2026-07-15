import { apiFetch } from '../client';
import { getEpServiceKits } from '../endpoints';

// Service Kit Item interface
export interface ServiceKitItem {
  model_name?: string;
  component_model?: string;
  component_brand?: string;
  year?: number | null;
  mower_brand?: string;
  service_type: string;
  parent_component?: string | null;
  category: string;
  part_sku: string;
  part_description: string;
  part_brand: string;
  qty_needed: number;
  mfg_part_num?: string | null;
}

// Service Kit Query Parameters
export interface ServiceKitQuery {
  engine?: string;
  hydro?: string;
  page?: number;
  limit?: number;
}

// Service Kit Response Format
export interface ServiceKitResponse {
  kits: {
    [key: string]: ServiceKitItem[];
  };
  total_results: number;
}

// Get All Service Kits
export async function getServiceKits(params: ServiceKitQuery = {}) {
  const queryParams = new URLSearchParams();

  if (params.engine) queryParams.append('engine', params.engine);
  if (params.hydro) queryParams.append('hydro', params.hydro);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const url = `${getEpServiceKits()}${queryString}`;
  console.log('Calling service_kits endpoint:', url);
  return apiFetch<ServiceKitResponse>(url, {}, 'service_kits');
}

// Get Service Kits by Engine
export async function getServiceKitsByEngine(engine: string) {
  return getServiceKits({ engine });
}

// Get Service Kits by Hydro
export async function getServiceKitsByHydro(hydro: string) {
  return getServiceKits({ hydro });
}
