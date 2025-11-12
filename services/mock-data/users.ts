import { AppUser, Role } from '../../types';
import { directorPermissions, leaderPermissions, counsellorPermissions } from './permissions';

export const MOCK_ROLES: Role[] = [
  { id: 'role_director', name: 'Director', permissions: directorPermissions },
  { id: 'role_leader', name: 'Leader', permissions: leaderPermissions },
  { id: 'role_counsellor', name: 'Counsellor', permissions: counsellorPermissions },
];

export const MOCK_USERS: AppUser[] = [
  { id: 'user_director', name: 'Admin Director', role: 'Director', permissions: directorPermissions, isShared: false },
  { id: 'user_leader', name: 'Leader Account', role: 'Leader', permissions: leaderPermissions, isShared: true },
  // FIX: Add missing 'isShared' property to match the AppUser type.
  { id: 'user_counsellor', name: 'Jane Doe', role: 'Counsellor', permissions: counsellorPermissions, isShared: false },
];