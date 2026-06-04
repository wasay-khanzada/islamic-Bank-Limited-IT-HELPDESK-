import type { UserRole } from '@/lib/roles';

export const hasRole = (userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

export const canAssignTicket = (userRole: UserRole | undefined): boolean => {
  if (!userRole) return false;
  return userRole === 'superadmin' || userRole === 'admin';
};

export const canViewAllTickets = (userRole: UserRole | undefined): boolean => {
  if (!userRole) return false;
  return userRole === 'superadmin' || userRole === 'admin';
};

export const canManageUsers = (userRole: UserRole | undefined): boolean => {
  if (!userRole) return false;
  return userRole === 'superadmin';
};

export const canManageDepartments = (userRole: UserRole | undefined): boolean => {
  if (!userRole) return false;
  return userRole === 'superadmin' || userRole === 'admin';
};

export const canViewReports = (userRole: UserRole | undefined): boolean => {
  if (!userRole) return false;
  return userRole === 'superadmin' || userRole === 'admin';
};
