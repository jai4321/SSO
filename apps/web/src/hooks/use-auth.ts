"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { webApi } from "@/lib/web-api";
import { useAuthStore } from "@/stores/auth-store";

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      webApi<{ ok: true }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => router.replace("/dashboard"),
  });
};

export const useSetPassword = () =>
  useMutation({
    mutationFn: async (input: { token: string; password: string }) => {
      const { data } = await apiClient.post<{ message: string }>("/api/auth/set-password", input);
      return data;
    },
  });

export const useLogout = () => {
  const clear = useAuthStore((state) => state.clear);
  const router = useRouter();

  return useMutation({
    mutationFn: () =>
      webApi<{ message: string }>("/api/auth/logout", { method: "POST" }),
    onSettled: () => {
      clear();
      router.replace("/login");
    },
  });
};
