"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface RegisterOrganizationInput {
  organizationName: string;
  contactNumber: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    country: string;
    state: string;
    city: string;
    pincode: string;
  };
  user: { name: string; email: string };
}

export const useRegisterOrganization = () =>
  useMutation({
    mutationFn: async (input: RegisterOrganizationInput) => {
      const { data } = await apiClient.post<{ message: string }>("/api/organizations/register", input);
      return data;
    },
  });

export const useVerifyOrganization = () =>
  useMutation({
    mutationFn: async (token: string) => {
      const { data } = await apiClient.post<{ message: string; setPasswordToken: string }>(
        "/api/organizations/verify",
        { token },
      );
      return data;
    },
  });

export const useResendVerification = () =>
  useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiClient.post<{ message: string }>(
        "/api/organizations/resend-verification",
        { email },
      );
      return data;
    },
  });
