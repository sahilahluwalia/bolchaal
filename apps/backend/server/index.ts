import { publicProcedure, router } from "./trpc";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { z } from "zod";
import { db } from "./db";

type User = { id: string; name: string };

const appRouter = router({
  hello: publicProcedure.query(() => {
    return { message: "Hello World" };
  }),
  userList: publicProcedure.query(async () => {
    // Retrieve users from a datasource, this is an imaginary database
    const users = await db.user.findMany();
    return users;
  }),
  userById: publicProcedure.input(z.string()).query(async (opts) => {
    const { input } = opts;
    // Retrieve the user with the given ID
    const user = await db.user.findById(input);
    return user;
  }),
  userCreate: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async (opts) => {
      const { input } = opts;
      // Create a new user in the database
      const user = await db.user.create(input);
      return user;
    }),
});

const server = createHTTPServer({
  router: appRouter,
  createContext() {
    console.log("context 3");
    return {};
  },
});

server.listen(3005,()=>{
  console.log('Server Running')
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
