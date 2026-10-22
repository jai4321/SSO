"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { webApi } from "@/lib/web-api";
import type { OrganizationRole } from "@/stores/auth-store";

export interface OrganizationUser {
  id: string;
  name: string;
  email: string;
  organizationRole: OrganizationRole;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
}

export interface OrganizationUsersResponse {
  users: OrganizationUser[];
  total: number;
  page: number;
  limit: number;
}

export type UserListStatus = "active" | "inactive";

export interface OrganizationUsersQuery {
  page: number;
  limit: number;
  search?: string;
  organizationRole?: OrganizationRole;
  status?: UserListStatus;
}

export interface CreateOrganizationUserInput {
  name: string;
  email: string;
  organizationRole: OrganizationRole;
}

export interface UpdateOrganizationUserInput {
  id: string;
  name: string;
  organizationRole?: OrganizationRole;
}

const USERS_QUERY_KEY = ["organization-users"] as const;

function usersQueryString(query: OrganizationUsersQuery) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  return params.toString();
}

export function useOrganizationUsers(query: OrganizationUsersQuery, enabled = true) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, query],
    queryFn: () =>
      webApi<OrganizationUsersResponse>(`/api/users?${usersQueryString(query)}`),
    enabled,
  });
}

export function useCreateOrganizationUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrganizationUserInput) => {
      const data = await webApi<{ user: OrganizationUser }>("/api/users", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return data.user;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}

export function useUpdateOrganizationUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateOrganizationUserInput) => {
      const data = await webApi<{ user: OrganizationUser }>(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
      return data.user;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}

export function useSetOrganizationUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const action = isActive ? "activate" : "deactivate";
      const data = await webApi<{ user: OrganizationUser }>(
        `/api/users/${id}/${action}`,
        { method: "PATCH", body: JSON.stringify({}) },
      );
      return data.user;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}

export function useDeleteOrganizationUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      webApi<{ message: string }>(`/api/users/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}
