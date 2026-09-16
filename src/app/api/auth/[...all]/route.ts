import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

function withErrorLogging(
  fn: (req: Request) => Promise<Response>,
  method: string,
) {
  return async (req: Request) => {
    try {
      return await fn(req);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);

      console.error(`[AUTH_${method}_ERROR]`, message);

      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}

export const GET = withErrorLogging(handlers.GET, "GET");
export const POST = withErrorLogging(handlers.POST, "POST");
export const PATCH = withErrorLogging(handlers.PATCH, "PATCH");
export const PUT = withErrorLogging(handlers.PUT, "PUT");
export const DELETE = withErrorLogging(handlers.DELETE, "DELETE");
