"use client";

import { create } from "zustand";
import { webApi } from "@/lib/web-api";
import { authUserSchema, type AuthUser } from "@/lib/auth-permissions";

export type { AuthUser } from "@/lib/auth-permissions";
export type OrganizationRole = AuthUser["organizationRole"];

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
    const request = webApi<{ user: unknown }>("/api/auth/me").then(({ user: value }) => {
      const parsedUser = authUserSchema.safeParse(value);
      if (!parsedUser.success) {
        throw new Error("The current-user response is invalid.");
      }
      const user = parsedUser.data;
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
