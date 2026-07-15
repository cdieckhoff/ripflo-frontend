// System Module - Users, User Roles, User Sessions, System Config, System Events, Activations, Audit Log, Login Attempts, Password Reset Tokens, Labor Rates
import { apiFetch } from './client';

// Enums
export enum UserRole {
  ADMIN = 'admin',
  TECH = 'tech',
  USER = 'user',
  SYS = 'sys',
  MANAGER = 'manager',
  HR = 'hr',
  ACCOUNTING = 'accounting',
  SALES = 'sales',
  WAREHOUSE = 'warehouse',
  DISPATCH = 'dispatch',
  MAINTENANCE = 'maintenance',
  SERVICE = 'service',
  PARTS = 'parts',
  CUSTOMER_SERVICE = 'customer_service'
}

export enum SysEventType {
  BACKUP_SUCCESS = 'backup_success',
  BACKUP_FAILED = 'backup_failed',
  DB_ERROR = 'db_error',
  API_TIMEOUT = 'api_timeout',
  EDI_SYNC_SUCCESS = 'edi_sync_success',
  EDI_SYNC_FAILED = 'edi_sync_failed',
  LICENSE_EXPIRED = 'license_expired',
  PAYMENT_GATEWAY_DOWN = 'payment_gateway_down',
  INVENTORY_SYNC_FAILED = 'inventory_sync_failed',
  EMAIL_DELIVERY_FAILED = 'email_delivery_failed'
}

export enum SysEventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

// Interfaces
export interface User {
  user_id?: number;
  username: string;
  email: string;
  role: string;
  fac_id?: number;
  is_active: number;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface UserResponse {
  user_id?: number;
  username: string;
  email: string;
  role: string;
  fac_id?: number;
  is_active: number;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface UserRole {
  user_role_id?: number;
  role_name: string;
  permissions: string;
  desc: string;
  created_at?: string;
}

export interface UserSession {
  session_id?: number;
  user_id: number;
  session_token: string;
  expires_at: string;
  created_at?: string;
}

export interface SysConfig {
  config_key: string;
  config_value: string;
  cat: string;
  updated_at?: string;
}

export interface SysEvent {
  event_id?: number;
  event_type: string;
  severity: string;
  message: string;
  details: string;
  resolved: number;
  resolved_at?: string;
  occurred_at?: string;
}

export interface Activation {
  activ_id?: number;
  fac_id: number;
  activ_key: string;
  payload_json?: string;
  sig?: string;
  paid: number;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id?: number;
  user_id?: number;
  action: string;
  desc: string;
  ip_addr: string;
  user_agent: string;
  created_at?: string;
}

export interface LoginAttempt {
  id?: number;
  username: string;
  ip_addr: string;
  success: number;
  attempted_at?: string;
}

export interface PasswordResetToken {
  reset_token_id?: number;
  user_id: number;
  token: string;
  expires_at: string;
  used: number;
  created_at?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
  fac_id?: number;
  is_active?: number;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  fac_id?: number | null;
  is_active?: number;
  last_login?: string;
}

export interface CreateUserRoleRequest {
  role_name: string;
  permissions?: string;
  desc?: string;
}

export interface UpdateUserRoleRequest {
  role_name?: string;
  permissions?: string;
  desc?: string;
}

export interface CreateUserSessionRequest {
  user_id: number;
  session_token: string;
  expires_at: string;
}

export interface UpdateUserSessionRequest {
  user_id?: number;
  session_token?: string;
  expires_at?: string;
}

export interface CreateSysConfigRequest {
  config_key: string;
  config_value: string;
  cat?: string;
}

export interface UpdateSysConfigRequest {
  config_value?: string;
  cat?: string;
}

export interface CreateSysEventRequest {
  event_type: string;
  severity?: string;
  message?: string;
  details?: string;
  resolved?: number;
  resolved_at?: string;
}

export interface UpdateSysEventRequest {
  event_type?: string;
  severity?: string;
  message?: string;
  details?: string;
  resolved?: number;
  resolved_at?: string;
}

export interface CreateActivationRequest {
  fac_id: number;
  activ_key: string;
  payload_json?: string;
  sig?: string;
  paid?: number;
}

export interface UpdateActivationRequest {
  fac_id?: number;
  activ_key?: string;
  payload_json?: string;
  sig?: string;
  paid?: number;
}

export interface CreateAuditLogRequest {
  user_id?: number;
  action: string;
  desc?: string;
  ip_addr?: string;
  user_agent?: string;
}

export interface UpdateAuditLogRequest {
  user_id?: number;
  action?: string;
  desc?: string;
  ip_addr?: string;
  user_agent?: string;
}

export interface CreateLoginAttemptRequest {
  username: string;
  ip_addr: string;
  success: number;
}

export interface UpdateLoginAttemptRequest {
  username?: string;
  ip_addr?: string;
  success?: number;
}

export interface CreatePasswordResetTokenRequest {
  user_id: number;
  token: string;
  expires_at: string;
}

export interface UpdatePasswordResetTokenRequest {
  user_id?: number;
  token?: string;
  expires_at?: string;
  used?: number;
}

export interface UserResponseData {
  data: {
    users: UserResponse[];
  };
  error: {
    message: string;
  };
}

export interface UserRoleResponse {
  data: {
    user_roles: UserRole[];
  };
  error: {
    message: string;
  };
}

export interface UserSessionResponse {
  data: {
    user_sessions: UserSession[];
  };
  error: {
    message: string;
  };
}

export interface SysConfigResponse {
  data: {
    sys_config: SysConfig[];
  };
  error: {
    message: string;
  };
}

export interface SysEventResponse {
  data: {
    sys_events: SysEvent[];
  };
  error: {
    message: string;
  };
}

export interface ActivationResponse {
  data: {
    activations: Activation[];
  };
  error: {
    message: string;
  };
}

export interface AuditLogResponse {
  data: {
    audit_log: AuditLog[];
  };
  error: {
    message: string;
  };
}

export interface LoginAttemptResponse {
  data: {
    login_attempts: LoginAttempt[];
  };
  error: {
    message: string;
  };
}

export interface PasswordResetTokenResponse {
  data: {
    password_reset_tokens: PasswordResetToken[];
  };
  error: {
    message: string;
  };
}


// API Functions
export async function createUser(userRequest: CreateUserRequest) {
  return apiFetch<UserResponse[]>(`/users`, {
    method: 'POST',
    body: JSON.stringify(userRequest),
  }, 'users');
}

export async function getUser(userId: number) {
  return apiFetch<UserResponse[]>(`/users/${userId}`, {
    method: 'GET',
  }, 'users');
}

export async function updateUser(userId: number, userRequest: UpdateUserRequest) {
  return apiFetch<UserResponse[]>(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userRequest),
  }, 'users');
}

export async function deleteUser(userId: number) {
  return apiFetch<UserResponse[]>(`/users/${userId}`, {
    method: 'DELETE',
  }, 'users');
}

export async function listUsers(params?: { role?: string; is_active?: number; fac_id?: number; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<UserResponse[]>(`/users?${queryParams}`, {
    method: 'GET',
  }, 'users');
}

export async function createUserRole(userRoleRequest: CreateUserRoleRequest) {
  return apiFetch<UserRole[]>(`/user_roles`, {
    method: 'POST',
    body: JSON.stringify(userRoleRequest),
  }, 'user_roles');
}

export async function getUserRole(userRoleId: number) {
  return apiFetch<UserRole[]>(`/user_roles/${userRoleId}`, {
    method: 'GET',
  }, 'user_roles');
}

export async function updateUserRole(userRoleId: number, userRoleRequest: UpdateUserRoleRequest) {
  return apiFetch<UserRole[]>(`/user_roles/${userRoleId}`, {
    method: 'PUT',
    body: JSON.stringify(userRoleRequest),
  }, 'user_roles');
}

export async function deleteUserRole(userRoleId: number) {
  return apiFetch<UserRole[]>(`/user_roles/${userRoleId}`, {
    method: 'DELETE',
  }, 'user_roles');
}

export async function listUserRoles(params?: { page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<UserRole[]>(`/user_roles?${queryParams}`, {
    method: 'GET',
  }, 'user_roles');
}

export async function createUserSession(userSessionRequest: CreateUserSessionRequest) {
  return apiFetch<UserSession[]>(`/user_sessions`, {
    method: 'POST',
    body: JSON.stringify(userSessionRequest),
  }, 'user_sessions');
}

export async function getUserSession(sessionId: number) {
  return apiFetch<UserSession[]>(`/user_sessions/${sessionId}`, {
    method: 'GET',
  }, 'user_sessions');
}

export async function updateUserSession(sessionId: number, userSessionRequest: UpdateUserSessionRequest) {
  return apiFetch<UserSession[]>(`/user_sessions/${sessionId}`, {
    method: 'PUT',
    body: JSON.stringify(userSessionRequest),
  }, 'user_sessions');
}

export async function deleteUserSession(sessionId: number) {
  return apiFetch<UserSession[]>(`/user_sessions/${sessionId}`, {
    method: 'DELETE',
  }, 'user_sessions');
}

export async function listUserSessions(params?: { user_id?: number; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<UserSession[]>(`/user_sessions?${queryParams}`, {
    method: 'GET',
  }, 'user_sessions');
}

export async function createSysConfig(sysConfigRequest: CreateSysConfigRequest) {
  return apiFetch<SysConfig[]>(`/sys_config`, {
    method: 'POST',
    body: JSON.stringify(sysConfigRequest),
  }, 'sys_config');
}

export async function getSysConfig(configKey: string) {
  return apiFetch<SysConfig[]>(`/sys_config/${configKey}`, {
    method: 'GET',
  }, 'sys_config');
}

export async function updateSysConfig(configKey: string, sysConfigRequest: UpdateSysConfigRequest) {
  return apiFetch<SysConfig[]>(`/sys_config/${configKey}`, {
    method: 'PUT',
    body: JSON.stringify(sysConfigRequest),
  }, 'sys_config');
}

export async function deleteSysConfig(configKey: string) {
  return apiFetch<SysConfig[]>(`/sys_config/${configKey}`, {
    method: 'DELETE',
  }, 'sys_config');
}

export async function listSysConfig(params?: { cat?: string; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<SysConfig[]>(`/sys_config?${queryParams}`, {
    method: 'GET',
  }, 'sys_config');
}

export async function createSysEvent(sysEventRequest: CreateSysEventRequest) {
  return apiFetch<SysEvent[]>(`/sys_events`, {
    method: 'POST',
    body: JSON.stringify(sysEventRequest),
  }, 'sys_events');
}

export async function getSysEvent(eventId: number) {
  return apiFetch<SysEvent[]>(`/sys_events/${eventId}`, {
    method: 'GET',
  }, 'sys_events');
}

export async function updateSysEvent(eventId: number, sysEventRequest: UpdateSysEventRequest) {
  return apiFetch<SysEvent[]>(`/sys_events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(sysEventRequest),
  }, 'sys_events');
}

export async function deleteSysEvent(eventId: number) {
  return apiFetch<SysEvent[]>(`/sys_events/${eventId}`, {
    method: 'DELETE',
  }, 'sys_events');
}

export async function listSysEvents(params?: { event_type?: string; severity?: string; resolved?: number; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<SysEvent[]>(`/sys_events?${queryParams}`, {
    method: 'GET',
  }, 'sys_events');
}

export async function createActivation(activationRequest: CreateActivationRequest) {
  return apiFetch<Activation[]>(`/activations`, {
    method: 'POST',
    body: JSON.stringify(activationRequest),
  }, 'activations');
}

export async function getActivation(activId: number) {
  return apiFetch<Activation[]>(`/activations/${activId}`, {
    method: 'GET',
  }, 'activations');
}

export async function updateActivation(activId: number, activationRequest: UpdateActivationRequest) {
  return apiFetch<Activation[]>(`/activations/${activId}`, {
    method: 'PUT',
    body: JSON.stringify(activationRequest),
  }, 'activations');
}

export async function deleteActivation(activId: number) {
  return apiFetch<Activation[]>(`/activations/${activId}`, {
    method: 'DELETE',
  }, 'activations');
}

export async function listActivations(params?: { fac_id?: number; paid?: number; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<Activation[]>(`/activations?${queryParams}`, {
    method: 'GET',
  }, 'activations');
}

export async function createAuditLog(auditLogRequest: CreateAuditLogRequest) {
  return apiFetch<AuditLog[]>(`/audit_log`, {
    method: 'POST',
    body: JSON.stringify(auditLogRequest),
  }, 'audit_log');
}

export async function getAuditLog(logId: number) {
  return apiFetch<AuditLog[]>(`/audit_log/${logId}`, {
    method: 'GET',
  }, 'audit_log');
}

export async function updateAuditLog(logId: number, auditLogRequest: UpdateAuditLogRequest) {
  return apiFetch<AuditLog[]>(`/audit_log/${logId}`, {
    method: 'PUT',
    body: JSON.stringify(auditLogRequest),
  }, 'audit_log');
}

export async function deleteAuditLog(logId: number) {
  return apiFetch<AuditLog[]>(`/audit_log/${logId}`, {
    method: 'DELETE',
  }, 'audit_log');
}

export async function listAuditLog(params?: { user_id?: number; action?: string; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<AuditLog[]>(`/audit_log?${queryParams}`, {
    method: 'GET',
  }, 'audit_log');
}

export async function createLoginAttempt(loginAttemptRequest: CreateLoginAttemptRequest) {
  return apiFetch<LoginAttempt[]>(`/login_attempts`, {
    method: 'POST',
    body: JSON.stringify(loginAttemptRequest),
  }, 'login_attempts');
}

export async function getLoginAttempt(attemptId: number) {
  return apiFetch<LoginAttempt[]>(`/login_attempts/${attemptId}`, {
    method: 'GET',
  }, 'login_attempts');
}

export async function updateLoginAttempt(attemptId: number, loginAttemptRequest: UpdateLoginAttemptRequest) {
  return apiFetch<LoginAttempt[]>(`/login_attempts/${attemptId}`, {
    method: 'PUT',
    body: JSON.stringify(loginAttemptRequest),
  }, 'login_attempts');
}

export async function deleteLoginAttempt(attemptId: number) {
  return apiFetch<LoginAttempt[]>(`/login_attempts/${attemptId}`, {
    method: 'DELETE',
  }, 'login_attempts');
}

export async function listLoginAttempts(params?: { username?: string; success?: number; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<LoginAttempt[]>(`/login_attempts?${queryParams}`, {
    method: 'GET',
  }, 'login_attempts');
}

export async function createPasswordResetToken(passwordResetTokenRequest: CreatePasswordResetTokenRequest) {
  return apiFetch<PasswordResetToken[]>(`/password_reset_tokens`, {
    method: 'POST',
    body: JSON.stringify(passwordResetTokenRequest),
  }, 'password_reset_tokens');
}

export async function getPasswordResetToken(tokenId: number) {
  return apiFetch<PasswordResetToken[]>(`/password_reset_tokens/${tokenId}`, {
    method: 'GET',
  }, 'password_reset_tokens');
}

export async function updatePasswordResetToken(tokenId: number, passwordResetTokenRequest: UpdatePasswordResetTokenRequest) {
  return apiFetch<PasswordResetToken[]>(`/password_reset_tokens/${tokenId}`, {
    method: 'PUT',
    body: JSON.stringify(passwordResetTokenRequest),
  }, 'password_reset_tokens');
}

export async function deletePasswordResetToken(tokenId: number) {
  return apiFetch<PasswordResetToken[]>(`/password_reset_tokens/${tokenId}`, {
    method: 'DELETE',
  }, 'password_reset_tokens');
}

export async function listPasswordResetTokens(params?: { user_id?: number; used?: number; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return apiFetch<PasswordResetToken[]>(`/password_reset_tokens?${queryParams}`, {
    method: 'GET',
  }, 'password_reset_tokens');
}

