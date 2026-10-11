import axios, { AxiosError, AxiosInstance } from "axios";
import { clientEnv } from "@/config/env";

export interface ApiErrorShape {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export class ApiError extends Error implements ApiErrorShape {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const normalizeError = (error: AxiosError): ApiError => {
  const data = error.response?.data as
    | { statusCode?: number; error?: string; message?: string; details?: unknown }
    | undefined;
  return new ApiError(
    data?.statusCode ?? error.response?.status ?? 500,
    data?.error ?? "INTERNAL_SERVER_ERROR",
    data?.message ?? "Something went wrong",
    data?.details,
  );
};

// Normalizes every failure to ApiError so callers never parse error.response ad hoc.
function attachErrorNormalization(instance: AxiosInstance) {
  instance.interceptors.response.use(undefined, (error: unknown) => {
    if (axios.isAxiosError(error)) return Promise.reject(normalizeError(error));
    return Promise.reject(error);
  });
}

export const apiClient = axios.create({ baseURL: clientEnv.NEXT_PUBLIC_API_URL });
attachErrorNormalization(apiClient);

export const apiServer = axios.create({ baseURL: clientEnv.NEXT_PUBLIC_API_URL });
attachErrorNormalization(apiServer);
