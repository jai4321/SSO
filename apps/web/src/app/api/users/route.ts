import { createRouteHandlers } from "@/lib/errors/with-error-handler";
import { proxyApi } from "@/lib/server-api";

const handlers = createRouteHandlers({ GET: proxyApi, POST: proxyApi });

export const GET = handlers.GET;
export const POST = handlers.POST;
