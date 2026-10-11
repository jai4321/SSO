"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

const saveSessionCookies = (tokens: { accessToken: string; refreshToken: string }) =>
  axios.post("/api/auth/session", tokens);

export const useLogin = () => {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { data } = await apiClient.post<{ accessToken: string; refreshToken: string }>(
        "/api/auth/login",
        input,
      );
      return data;
    },
    onSuccess: async (tokens) => {
      setSession(tokens);
      await saveSessionCookies(tokens);
      router.replace("/dashboard");
    },
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
  const { refreshToken, clear } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) await apiClient.post("/api/auth/logout", { refreshToken });
      await axios.delete("/api/auth/session");
    },
    onSettled: () => {
      clear();
      router.replace("/login");
    },
  });
};
