import { NextResponse } from "next/server";
import { AppError } from "./app-error";

type Handler<TReq extends Request, TCtx> = (req: TReq, ctx: TCtx) => Promise<Response>;

// Wraps route handlers so they can throw AppError instead of hand-building error responses.
export function withErrorHandler<TReq extends Request, TCtx>(handler: Handler<TReq, TCtx>) {
  return async (req: TReq, ctx: TCtx): Promise<Response> => {
    try {
      return await handler(req, ctx);
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
