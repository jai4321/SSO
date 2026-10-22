import { createRouteHandlers } from "@/lib/errors/with-error-handler";
import { proxyApi } from "@/lib/server-api";

const handlers = createRouteHandlers({
  GET: proxyApi,
  PATCH: proxyApi,
  POST: proxyApi,
  DELETE: proxyApi,
});

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const POST = handlers.POST;
export const DELETE = handlers.DELETE;
