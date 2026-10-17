"use client";

import { create } from "zustand";
import { webApi } from "@/lib/web-api";

export type OrganizationRole = "SUPERADMIN" | "ADMIN" | "MEMBER";

export interface AuthUser {
  id: string;
  organizationId: string;
  organizationRole: OrganizationRole;
}

let fetchMeRequest: Promise<AuthUser> | null = null;
let fetchMeRequestId: symbol | null = null;
let authGeneration = 0;

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
  fetchMe: () => Promise<AuthUser>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => {
    authGeneration += 1;
    fetchMeRequest = null;
    fetchMeRequestId = null;
    set({ user: null });
  },
  fetchMe: () => {
    if (fetchMeRequest) return fetchMeRequest;

    const requestGeneration = authGeneration;
    const request = webApi<{ user: AuthUser }>("/api/auth/me").then(({ user }) => {
      if (requestGeneration === authGeneration) set({ user });
      return user;
    });
    const requestId = Symbol();
    const trackedRequest = request.finally(() => {
      if (fetchMeRequestId === requestId) {
        fetchMeRequest = null;
        fetchMeRequestId = null;
      }
    });
    fetchMeRequest = trackedRequest;
    fetchMeRequestId = requestId;
    return trackedRequest;
  },
}));
