import { TRPCError, initTRPC } from "@trpc/server";
// import superjson from 'superjson'
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { verifyToken } from "../utils/auth";

export const createTRPCContext = (_opts: CreateHTTPContextOptions) => {
  const { req, res } = _opts;
  return {
    req,
    res,
  };
};

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create();

const isAuthed = t.middleware(async ({ ctx, next }) => {
  const token = ctx.req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  try {
    const payload = await verifyToken(token);
    return next({
      ctx: {
        userId: payload.sub.id,
        userRole: payload.sub.role,
      },
    });
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
});

export const router = t.router;

export const privateProcedure = t.procedure.use(isAuthed);
export const publicProcedure = t.procedure;
