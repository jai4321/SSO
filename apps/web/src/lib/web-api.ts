import { type Method } from "axios";
import { webApiClient } from "@/lib/api-client";

export async function webApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new TypeError("webApi only supports same-origin paths.");
  }

  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  headers.set("cache-control", "no-store");

  const requestHeaders: Record<string, string> = {};
  headers.forEach((value, key) => {
    requestHeaders[key] = value;
  });
  console.log({
    url: path,
    method: init.method?.toLowerCase() as Method | undefined,
    data: init.body ?? undefined,
    headers: requestHeaders,
    signal: init.signal ?? undefined,
  });
  const { data } = await webApiClient.request<T>({
    url: path,
    method: init.method?.toLowerCase() as Method | undefined,
    data: init.body ?? undefined,
    headers: requestHeaders,
    signal: init.signal ?? undefined,
  });

  return data;
}
