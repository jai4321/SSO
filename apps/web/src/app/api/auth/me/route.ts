import { createRouteHandlers } from "@/lib/errors/with-error-handler";
import { proxyApi } from "@/lib/server-api";

const handlers = createRouteHandlers({ GET: proxyApi });

export const GET = handlers.GET;
