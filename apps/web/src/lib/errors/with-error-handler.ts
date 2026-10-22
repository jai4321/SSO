import { NextResponse } from "next/server";
import { AppError } from "./app-error";

type RouteMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
type Handler<TArgs extends [Request, ...unknown[]]> = (...args: TArgs) => Promise<Response>;
type ApiRouteHandler = (request: Request, ...context: unknown[]) => Promise<Response>;
type ApiRouteHandlers = Partial<Record<RouteMethod, ApiRouteHandler>>;

type WrappedApiRouteHandlers<THandlers extends ApiRouteHandlers> = {
  [Method in keyof THandlers]: ApiRouteHandler;
};

// Wraps route handlers so they can throw AppError instead of hand-building error responses.
export function withErrorHandler<TArgs extends [Request, ...unknown[]]>(handler: Handler<TArgs>) {
  return async (...args: TArgs): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { statusCode: error.statusCode, error: error.code, message: error.message, details: error.details },
          { status: error.statusCode },
        );
      }
      console.error(error);
      return NextResponse.json(
        { statusCode: 500, error: "INTERNAL_SERVER_ERROR", message: "Something went wrong" },
        { status: 500 },
      );
    }
  };
}

// Apply the same JSON error boundary to all methods exported by a route module.
export function createRouteHandlers<THandlers extends ApiRouteHandlers>(
  handlers: THandlers,
): WrappedApiRouteHandlers<THandlers> {
  const wrapped: Partial<Record<RouteMethod, ApiRouteHandler>> = {};

  for (const method of Object.keys(handlers) as RouteMethod[]) {
    const handler = handlers[method];
    if (handler) wrapped[method] = withErrorHandler(handler);
  }

  return wrapped as WrappedApiRouteHandlers<THandlers>;
}
