import { withErrorHandler } from "@/lib/errors/with-error-handler";
import { proxyApi } from "@/lib/server-api";

export const GET = withErrorHandler(proxyApi);
export const PATCH = withErrorHandler(proxyApi);
export const POST = withErrorHandler(proxyApi);
export const DELETE = withErrorHandler(proxyApi);
