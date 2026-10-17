import axios, {
  AxiosHeaders,
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type GenericAbortSignal,
  type RawAxiosHeaders,
} from "axios";
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

type RateLimitRetryConfig = AxiosRequestConfig & {
  _rateLimitRetries?: number;
};

const MAX_RATE_LIMIT_RETRIES = 1;
const MAX_RATE_LIMIT_WAIT_MS = 60_000;

function getRetryAfterMs(error: AxiosError): number | undefined {
  const responseHeaders = error.response?.headers as unknown as RawAxiosHeaders | undefined;
  const header = AxiosHeaders.from(responseHeaders).get("retry-after");
  if (typeof header !== "string" && typeof header !== "number") return undefined;

  const value = String(header).trim();
  const seconds = Number(value);
  if (value && Number.isFinite(seconds) && seconds >= 0) {
    const delay = seconds * 1_000;
    return delay <= MAX_RATE_LIMIT_WAIT_MS ? delay : undefined;
  }

  const retryAt = Date.parse(value);
  if (!Number.isFinite(retryAt)) return undefined;

  const delay = Math.max(0, retryAt - Date.now());
  return delay <= MAX_RATE_LIMIT_WAIT_MS ? delay : undefined;
}

function waitForRetry(delayMs: number, signal?: GenericAbortSignal | null): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new axios.CanceledError("Request canceled before rate-limit retry."));
      return;
    }

    const onAbort = () => {
      clearTimeout(timeout);
      reject(new axios.CanceledError("Request canceled before rate-limit retry."));
    };

    const timeout = setTimeout(() => {
      signal?.removeEventListener?.("abort", onAbort);
      resolve();
    }, delayMs);
    signal?.addEventListener?.("abort", onAbort, { once: true });
  });
}

// Normalize API failures and retry a safe read once when the API tells us when to retry.
function attachApiInterceptors(instance: AxiosInstance) {
  instance.interceptors.response.use(undefined, async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);
    if (axios.isCancel(error)) return Promise.reject(error);

    const config = error.config as RateLimitRetryConfig | undefined;
    const method = config?.method?.toLowerCase();
    const isSafeRead = method === "get" || method === "head";
    const retryCount = config?._rateLimitRetries ?? 0;
    const retryAfterMs = error.response?.status === 429 ? getRetryAfterMs(error) : undefined;

    if (
      config &&
      isSafeRead &&
      retryCount < MAX_RATE_LIMIT_RETRIES &&
      retryAfterMs !== undefined
    ) {
      config._rateLimitRetries = retryCount + 1;
      try {
        await waitForRetry(retryAfterMs, config.signal);
      } catch (waitError) {
        return Promise.reject(waitError);
      }
      return instance.request(config);
    }

    return Promise.reject(normalizeError(error));
  });
}

export const apiClient = axios.create({ baseURL: clientEnv.NEXT_PUBLIC_API_URL });
attachApiInterceptors(apiClient);

// Browser requests use same-origin Next.js routes, which forward the HTTP-only session cookie.
export const webApiClient = axios.create({
  withCredentials: true,
  headers: { "Cache-Control": "no-store" },
});
attachApiInterceptors(webApiClient);

export const apiServer = axios.create({ baseURL: clientEnv.NEXT_PUBLIC_API_URL });
attachApiInterceptors(apiServer);
