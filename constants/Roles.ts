export type UserRole = 'principal' | 'teacher' | 'adas' | 'secretary';

export const Roles = {
  PRINCIPAL: 'principal' as UserRole,
  TEACHER: 'teacher' as UserRole,
  ADAS: 'adas' as UserRole,
  SECRETARY: 'secretary' as UserRole,
};

export const RoleLabels: Record<UserRole, string> = {
  principal: 'Principal',
  teacher: 'Teacher',
  adas: 'ADAS',
  secretary: 'Secretary',
};
