"use client";

import { useAuthStore } from '@/stores/auth-store';
import type { PermissionKey } from '@/lib/auth-permissions';

export function useCan(permission: PermissionKey): boolean {
  return useAuthStore((state) => state.user?.permissions.includes(permission) ?? false);
}
