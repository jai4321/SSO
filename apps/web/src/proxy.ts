import { NextRequest } from "next/server";
import { sessionCheck } from "@/middlewares/session-check";

export default function proxy(req: NextRequest) {
  return sessionCheck(req);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|favicon.ico).*)"],
};
