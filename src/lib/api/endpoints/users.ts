import { apiFetch, apiFetchWithNormalization } from '../client';
import { getEpUsers, getEpUserRoles, getEpUserSessions } from '../endpoints';
import {
  ContactIsActive,
  UserRoles,
} from "../../types/consolidated-enums.js";
import { type ApiData } from '../types.js';

// Users interfaces
export interface User {
  user_id: number;
  username: string;
  email: string;
  role: UserRoles;
  fac_id?: number;
  is_active: ContactIsActive;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;  // Raw password sent to backend for hashing
  role?: UserRoles;
  fac_id?: number;
  is_active?: ContactIsActive;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;  // Raw password sent to backend for hashing
  role?: UserRoles;
  fac_id?: number;
  is_active?: ContactIsActive;
  last_login?: string;
  user_id: number;
}

// User Roles interfaces
export interface UserRole {
  user_role_id: number;
  role_name: string;
  permissions?: string;
  desc?: string;
  created_at?: string;
}

export interface CreateUserRoleRequest {
  role_name: string;
  permissions?: string;
  desc?: string;
}

export interface UpdateUserRoleRequest extends CreateUserRoleRequest {
  user_role_id: number;
}

// User Sessions interfaces
export interface UserSession {
  session_id: number;
  user_id: number;
  session_token: string;
  expires_at: string;
  created_at?: string;
}

export interface CreateUserSessionRequest {
  user_id: number;
  session_token: string;
  expires_at: string;
}

export interface UpdateUserSessionRequest extends CreateUserSessionRequest {
  session_id: number;
}

// Users API functions
export async function createUser(payload: CreateUserRequest) {
  return apiFetch<User[]>(getEpUsers(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'users');
}

export async function listUsers() {
  return apiFetch<User[]>(getEpUsers(), {}, 'users');
}

export async function getUser(id: number) {
  return apiFetch<User[]>(`${getEpUsers()}/${id}`, {}, 'users');
}

export async function updateUser(id: number, payload: UpdateUserRequest) {
  return apiFetch<User[]>(`${getEpUsers()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'users');
}

export async function deleteUser(id: number) {
  return apiFetch<User[]>(`${getEpUsers()}/${id}`, {
    method: 'DELETE',
  }, 'users');
}

// User Roles API functions
export async function createUserRole(payload: CreateUserRoleRequest) {
  return apiFetch<UserRole[]>(getEpUserRoles(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'user_roles');
}

export async function listUserRoles() {
  return apiFetch<UserRole[]>(getEpUserRoles(), {}, 'user_roles');
}

export async function getUserRole(id: number) {
  return apiFetch<UserRole[]>(`${getEpUserRoles()}/${id}`, {}, 'user_roles');
}

export async function updateUserRole(id: number, payload: UpdateUserRoleRequest) {
  return apiFetch<UserRole[]>(`${getEpUserRoles()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'user_roles');
}

export async function deleteUserRole(id: number) {
  return apiFetch<UserRole[]>(`${getEpUserRoles()}/${id}`, {
    method: 'DELETE',
  }, 'user_roles');
}

// User Sessions API functions
export async function createUserSession(payload: CreateUserSessionRequest) {
  return apiFetch<UserSession[]>(getEpUserSessions(), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'user_sessions');
}

export async function listUserSessions() {
  return apiFetch<UserSession[]>(getEpUserSessions(), {}, 'user_sessions');
}

export async function getUserSession(id: number) {
  return apiFetch<UserSession[]>(`${getEpUserSessions()}/${id}`, {}, 'user_sessions');
}

export async function updateUserSession(id: number, payload: UpdateUserSessionRequest) {
  return apiFetch<UserSession[]>(`${getEpUserSessions()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'user_sessions');
}

export async function deleteUserSession(id: number) {
  return apiFetch<UserSession[]>(`${getEpUserSessions()}/${id}`, {
    method: 'DELETE',
  }, 'user_sessions');
}