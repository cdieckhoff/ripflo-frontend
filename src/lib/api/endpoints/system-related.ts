import { apiFetch, apiFetchWithNormalization } from '../client';
import { getEpActivations, getEpAuditLog, getEpLoginAttempts, getEpPasswordResetTokens, getEpSysConfig, getEpSysEvents } from '../endpoints';
import {
  ContactIsActive,
  LoginAttemptSuccess,
  PasswordResetTokenUsed,
  SysEventResolved,
  SysEventSeverity,
  SysEventTypes,
  UserRoles,
} from "../../types/consolidated-enums.js";
import { type ApiData, type BackendApiResponse } from '../types.js';

// Activations interfaces
export interface Activation {
  activ_id: number;
  fac_id: number;
  activ_key: string;
  payload_json?: string;
  sig?: string;
  paid: ContactIsActive;
  created_at?: string;
  updated_at?: string;
}

export interface CreateActivationRequest {
  fac_id: number;
  activ_key: string;
  payload_json?: string;
  sig?: string;
  paid?: ContactIsActive;
}

export interface UpdateActivationRequest extends CreateActivationRequest {
  activ_id: number;
}

// Audit Log interfaces
export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  desc?: string;
  ip_addr?: string;
  user_agent?: string;
  created_at?: string;
}

export interface CreateAuditLogRequest {
  user_id?: number;
  action: string;
  desc?: string;
  ip_addr?: string;
  user_agent?: string;
}

// Login Attempts interfaces
export interface LoginAttempt {
  id: number;
  username: string;
  ip_addr: string;
  success: LoginAttemptSuccess;
  attempted_at?: string;
}

export interface CreateLoginAttemptRequest {
  username: string;
  ip_addr: string;
  success: LoginAttemptSuccess;
}

// Password Reset Tokens interfaces
export interface PasswordResetToken {
  reset_token_id: number;
  user_id: number;
  token: string;
  expires_at: string;
  used: PasswordResetTokenUsed;
  created_at?: string;
}

export interface CreatePasswordResetTokenRequest {
  user_id: number;
  token: string;
  expires_at: string;
  used?: PasswordResetTokenUsed;
}

export interface UpdatePasswordResetTokenRequest extends CreatePasswordResetTokenRequest {
  reset_token_id: number;
}

// System Config interfaces
export interface SystemConfig {
  config_key: string;
  config_value: string;
  cat?: string;
  updated_at?: string;
}

export interface CreateSystemConfigRequest {
  config_key: string;
  config_value: string;
  cat?: string;
}

export interface UpdateSystemConfigRequest {
  config_value: string;
  cat?: string;
  config_key: string;
}

// System Events interfaces
export interface SystemEvent {
  event_id: number;
  event_type: SysEventTypes;
  severity?: SysEventSeverity;
  message?: string;
  details?: string;
  resolved: SysEventResolved;
  resolved_at?: string;
  occurred_at?: string;
}

export interface CreateSystemEventRequest {
  event_type: SysEventTypes;
  severity?: SysEventSeverity;
  message?: string;
  details?: string;
  resolved?: SysEventResolved;
  resolved_at?: string;
}

export interface UpdateSystemEventRequest extends CreateSystemEventRequest {
  event_id: number;
}

// Activations API functions
export async function createActivation(payload: CreateActivationRequest) {
  return apiFetch<Activation[]>(getEpActivations(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'activations');
}

export async function listActivations() {
  return apiFetch<Activation[]>(getEpActivations(), {}, 'activations');
}

export async function getActivation(id: number) {
  return apiFetch<Activation[]>(`${getEpActivations()}/${id}`, {}, 'activations');
}

export async function updateActivation(id: number, payload: UpdateActivationRequest) {
  return apiFetch<Activation[]>(`${getEpActivations()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'activations');
}

export async function deleteActivation(id: number) {
  return apiFetch<Activation[]>(`${getEpActivations()}/${id}`, {
    method: 'DELETE',
  }, 'activations');
}

// Audit Log API functions
export async function createAuditLog(payload: CreateAuditLogRequest) {
  return apiFetch<AuditLog[]>(getEpAuditLog(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'audit_log');
}

export async function listAuditLog() {
  return apiFetch<AuditLog[]>(getEpAuditLog(), {}, 'audit_log');
}

export async function getAuditLog(id: number) {
  return apiFetch<AuditLog[]>(`${getEpAuditLog()}/${id}`, {}, 'audit_log');
}

export async function updateAuditLog(id: number, payload: CreateAuditLogRequest) {
  return apiFetch<AuditLog[]>(`${getEpAuditLog()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'audit_log');
}

export async function deleteAuditLog(id: number) {
  return apiFetch<AuditLog[]>(`${getEpAuditLog()}/${id}`, {
    method: 'DELETE',
  }, 'audit_log');
}

// Login Attempts API functions
export async function createLoginAttempt(payload: CreateLoginAttemptRequest) {
  return apiFetch<LoginAttempt[]>(getEpLoginAttempts(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'login_attempts');
}

export async function listLoginAttempts() {
  return apiFetch<LoginAttempt[]>(getEpLoginAttempts(), {}, 'login_attempts');
}

export async function getLoginAttempt(id: number) {
  return apiFetch<LoginAttempt[]>(`${getEpLoginAttempts()}/${id}`, {}, 'login_attempts');
}

export async function updateLoginAttempt(id: number, payload: CreateLoginAttemptRequest) {
  return apiFetch<LoginAttempt[]>(`${getEpLoginAttempts()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'login_attempts');
}

export async function deleteLoginAttempt(id: number) {
  return apiFetch<LoginAttempt[]>(`${getEpLoginAttempts()}/${id}`, {
    method: 'DELETE',
  }, 'login_attempts');
}

// Password Reset Tokens API functions
export async function createPasswordResetToken(payload: CreatePasswordResetTokenRequest) {
  return apiFetch<PasswordResetToken[]>(getEpPasswordResetTokens(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'password_reset_tokens');
}

export async function listPasswordResetTokens() {
  return apiFetch<PasswordResetToken[]>(getEpPasswordResetTokens(), {}, 'password_reset_tokens');
}

export async function getPasswordResetToken(id: number) {
  return apiFetch<PasswordResetToken[]>(`${getEpPasswordResetTokens()}/${id}`, {}, 'password_reset_tokens');
}

export async function updatePasswordResetToken(id: number, payload: UpdatePasswordResetTokenRequest) {
  return apiFetch<PasswordResetToken[]>(`${getEpPasswordResetTokens()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'password_reset_tokens');
}

export async function deletePasswordResetToken(id: number) {
  return apiFetch<PasswordResetToken[]>(`${getEpPasswordResetTokens()}/${id}`, {
    method: 'DELETE',
  }, 'password_reset_tokens');
}

// System Config API functions
export async function createSystemConfig(payload: CreateSystemConfigRequest) {
  return apiFetch<SystemConfig[]>(getEpSysConfig(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'sys_config');
}

export async function listSystemConfig() {
  return apiFetch<SystemConfig[]>(getEpSysConfig(), {}, 'sys_config');
}

export async function getSystemConfig(key: string) {
  return apiFetch<SystemConfig[]>(`${getEpSysConfig()}/${key}`, {}, 'sys_config');
}

export async function updateSystemConfig(key: string, payload: UpdateSystemConfigRequest) {
  return apiFetch<SystemConfig[]>(`${getEpSysConfig()}/${key}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'sys_config');
}

export async function deleteSystemConfig(key: string) {
  return apiFetch<SystemConfig[]>(`${getEpSysConfig()}/${key}`, {
    method: 'DELETE',
  }, 'sys_config');
}

// System Events API functions
export async function createSystemEvent(payload: CreateSystemEventRequest) {
  return apiFetch<SystemEvent[]>(getEpSysEvents(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'sys_events');
}

export async function listSystemEvents() {
  return apiFetch<SystemEvent[]>(getEpSysEvents(), {}, 'sys_events');
}

export async function getSystemEvent(id: number) {
  return apiFetch<SystemEvent[]>(`${getEpSysEvents()}/${id}`, {}, 'sys_events');
}

export async function updateSystemEvent(id: number, payload: UpdateSystemEventRequest) {
  return apiFetch<SystemEvent[]>(`${getEpSysEvents()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'sys_events');
}

export async function deleteSystemEvent(id: number) {
  return apiFetch<SystemEvent[]>(`${getEpSysEvents()}/${id}`, {
    method: 'DELETE',
  }, 'sys_events');
}