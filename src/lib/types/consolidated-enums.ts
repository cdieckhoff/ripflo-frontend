// Consolidated enum types interface for cached common data

export interface AddressTypeInfo {
  addr_type_id: number;
  name: string;
}

export interface Brand {
  brand_id: number;
  name: string;
}

export interface ModelCategory {
  cat_name: string;
  hourly_rate: number;
  labor_rate_id: number;
  labor_rate_name: string;
  model_cat_id: number;
  parent_cat_id: number | null;
}

export interface PhoneType {
  phone_type_id: number;
  type: string;
}

export interface UserRole {
  user_role_id: number;
  role_name: string;
  permissions?: string;
  desc?: string;
  created_at?: string;
}

export interface WorkOrderAssignmentRoleInfo {
  display: string;
  is_active: number;
  role_key: string;
  sort: number;
}

export interface WorkOrderStatus {
  status: string;
  wo_status_id: number;
}

export interface ComponentCategory {
  comp_cat_id: number;
  name: string;
  parent_id: number | null;
}

// Interface for the response from the /enums endpoint
export interface EnumsResponse {
  data: {
    address_types: AddressTypeInfo[];
    brands: Brand[];
    component_cats: ComponentCategory[];
    model_cats: ModelCategory[];
    phone_types: PhoneType[];
    user_roles: UserRole[];
    workorder_assignment_roles: WorkOrderAssignmentRoleInfo[];
    workorder_statuses: WorkOrderStatus[];
    priority_types?: Array<{ label: string; value: string }>; // Additional field from actual response
  };
  error: {
    message: string;
  } | null;
}

// Interface for the cached enums in the app state
export interface CachedEnums {
  addressTypes: AddressTypeInfo[];
  brands: Brand[];
  componentCats: ComponentCategory[];
  modelCats: ModelCategory[];
  phoneTypes: PhoneType[];
  userRoles: UserRole[];
  workOrderAssignmentRoles: WorkOrderAssignmentRoleInfo[];
  workOrderStatuses: WorkOrderStatus[];
  priorityTypes?: Array<{ label: string; value: string }>; // Additional field from actual response
}

// Enums derived from database constraints
export enum ContactType {
  PERSON = 'person',
  EMPLOYEE = 'employee',
  COMPANY = 'company',
  SUPPLIER = 'supplier'
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum AddressType {
  HOME = 'home',
  WORK = 'work',
  DELIVERY = 'delivery',
  PICKUP = 'pickup'
}

export enum PhoneIsPrimary {
  NO = 0,
  YES = 1
}

export enum ContactIsActive {
  NO = 0,
  YES = 1
}

export enum FacilityIsActive {
  NO = 0,
  YES = 1
}

export enum EmailIsPrimary {
  NO = 0,
  YES = 1
}

export enum AddressIsPrimary {
  NO = 0,
  YES = 1
}

export enum WorkOrderNoteType {
  PROBLEM = 'problem',
  SOLUTION = 'solution',
  MEMO = 'memo'
}

export enum WorkOrderNoteIsPrivate {
  NO = 0,
  YES = 1
}

export enum WorkOrderAssignmentRole {
  LEAD = 'lead',
  DIAG = 'diag',
  SERVICE = 'service',
  HELPER = 'helper',
  QC = 'qc',
  TEST = 'test',
  DELIVERY = 'delivery',
  CLEANUP = 'cleanup',
  WARRANTY = 'warranty'
}

export enum WorkOrderAssignmentIsCurrent {
  NO = 0,
  YES = 1
}

export enum SysEventTypes {
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

export enum SysEventResolved {
  NO = 0,
  YES = 1
}

export enum UserRoles {
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

export enum LoginAttemptSuccess {
  FAILED = 0,
  SUCCESS = 1
}

export enum PasswordResetTokenUsed {
  NOT_USED = 0,
  USED = 1
}

export enum WorkOrderType {
  NEW = 'new',
  DIAGNOSING = 'diagnosing',
  IN_PROGRESS = 'in-progress',
  AWAITING_PARTS = 'awaiting-parts',
  AWAITING_APPROVAL = 'awaiting-approval',
  TESTING = 'testing',
  FINISHED = 'finished'
}