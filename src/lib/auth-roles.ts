/**
 * Role-Based Access Control (RBAC) & School Membership for Waghamba Sports Health Hub.
 * Enforces strict authorization separation between server permissions and client-side app lock.
 */

export type UserRole = 'admin' | 'teacher' | 'coach' | 'viewer';

export interface SchoolMembership {
  id: string;
  schoolId: string;
  userId: string;
  role: UserRole;
  status: 'active' | 'suspended';
  displayName?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermissions {
  canManageSchool: boolean;
  canManageMembers: boolean;
  canEditRoster: boolean;
  canDeleteStudent: boolean;
  canRecordAttendance: boolean;
  canRecordFitness: boolean;
  canManageTacticsAndMatches: boolean;
  canManageEquipment: boolean;
  canLogInjuries: boolean;
  canAccessBiometrics: boolean;
  isReadOnly: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canManageSchool: true,
    canManageMembers: true,
    canEditRoster: true,
    canDeleteStudent: true,
    canRecordAttendance: true,
    canRecordFitness: true,
    canManageTacticsAndMatches: true,
    canManageEquipment: true,
    canLogInjuries: true,
    canAccessBiometrics: true,
    isReadOnly: false,
  },
  teacher: {
    canManageSchool: false,
    canManageMembers: false,
    canEditRoster: true,
    canDeleteStudent: false, // Protected against accidental student deletion
    canRecordAttendance: true,
    canRecordFitness: true,
    canManageTacticsAndMatches: true,
    canManageEquipment: true,
    canLogInjuries: true,
    canAccessBiometrics: true,
    isReadOnly: false,
  },
  coach: {
    canManageSchool: false,
    canManageMembers: false,
    canEditRoster: false, // View roster only
    canDeleteStudent: false,
    canRecordAttendance: true,
    canRecordFitness: false,
    canManageTacticsAndMatches: true,
    canManageEquipment: true,
    canLogInjuries: true,
    canAccessBiometrics: false,
    isReadOnly: false,
  },
  viewer: {
    canManageSchool: false,
    canManageMembers: false,
    canEditRoster: false,
    canDeleteStudent: false,
    canRecordAttendance: false,
    canRecordFitness: false,
    canManageTacticsAndMatches: false,
    canManageEquipment: false,
    canLogInjuries: false,
    canAccessBiometrics: false,
    isReadOnly: true,
  },
};

/**
 * Returns the effective permission set for a given role.
 */
export function getPermissionsForRole(role?: UserRole | string | null): RolePermissions {
  const normalizedRole = (role?.toLowerCase() || 'viewer') as UserRole;
  return ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.viewer;
}

/**
 * Validates if the current user role has permission to execute an operation.
 */
export function hasPermission(
  role: UserRole | string | undefined | null,
  action: keyof RolePermissions
): boolean {
  const perms = getPermissionsForRole(role);
  return Boolean(perms[action]);
}

/**
 * Local App Lock state management (Strictly separated from Server Authorization).
 * The PIN is only a local UI privacy shield, NOT a substitute for server-side auth rules.
 */
export const APP_LOCK_STORAGE_KEY = 'wgb_app_pin_lock';

export function isAppLockActive(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(APP_LOCK_STORAGE_KEY));
}

export function setAppLockPin(pin: string): void {
  if (typeof window === 'undefined') return;
  if (pin.trim()) {
    localStorage.setItem(APP_LOCK_STORAGE_KEY, pin.trim());
  } else {
    localStorage.removeItem(APP_LOCK_STORAGE_KEY);
  }
}

export function clearAppLockPin(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(APP_LOCK_STORAGE_KEY);
}
