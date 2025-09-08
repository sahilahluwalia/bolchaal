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
  const { req, res } = ctx;
  // Bearer dvsdvs
  const token = req.headers.authorization?.split(" ")[1] ?? "";
  const payload = await verifyToken(token);
  //   .log("middleware req recived");
  if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });

  console.log("middleware passed");
  return next({
    ctx: {
      userId: payload.id,
    },
  });
});

export const router = t.router;

export const privateProcedure = t.procedure.use(isAuthed);
export const publicProcedure = t.procedure;
