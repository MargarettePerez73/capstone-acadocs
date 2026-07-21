export type UserRole = 'admin' | 'teacher' | 'adas' | 'secretary';

export const Roles = {
  ADMIN: 'admin' as UserRole,
  TEACHER: 'teacher' as UserRole,
  ADAS: 'adas' as UserRole,
  SECRETARY: 'secretary' as UserRole,
};

// Display labels — the DB role is "admin" but the school calls that person Principal.
export const RoleLabels: Record<UserRole, string> = {
  admin: 'Principal',
  teacher: 'Teacher',
  adas: 'ADAS',
  secretary: 'Secretary',
};
