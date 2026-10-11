"use client";

import { create } from "zustand";
import { apiClient } from "@/lib/api-client";

export type OrganizationRole = "SUPERADMIN" | "ADMIN" | "MEMBER";

export interface AuthUser {
  id: string;
  organizationId: string;
  organizationRole: OrganizationRole;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (tokens: { accessToken: string; refreshToken: string }) => void;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
  fetchMe: () => Promise<AuthUser>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  setSession: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),
  setUser: (user) => set({ user }),
  clear: () => set({ user: null, accessToken: null, refreshToken: null }),
  fetchMe: async () => {
    const { accessToken } = get();
    console.log("Value of get", get());
    const { data } = await apiClient.get<{ user: AuthUser }>("/api/auth/me", {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    set({ user: data.user });
    return data.user;
  },
}));
