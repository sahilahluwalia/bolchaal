import {
  publicProcedure,
  router,
  privateProcedure,
  createTRPCContext,
} from "./trpc";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { z } from "zod";
import { db } from "./db";
import { systemPrompt } from "../utils/prompt";
import { prismaClient } from "@repo/db/client";
import { TRPCError } from "@trpc/server";
import { generateToken } from "../utils/auth";
import 'dotenv/config'

export const appRouter = router({
  hello: publicProcedure.query(() => {
    return { message: "Hello World" };
  }),
  bye: privateProcedure.query(() => {
    return { message: "Hello World" };
  }),
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async (opts) => {
      const {
        input: { email, password },
      } = opts;
      
     
      const result = await prismaClient.user.create({
        data: { email, password },
      });
// "result": {
//                 "id": "ec588a2e-a23f-4b5e-8f7c-bd6cd37d1ae7",
//                 "email": "sahil@gmail.com",
//                 "password": "123",
//                 "name": null,
//                 "role": "TEACHER",
//                 "createdAt": "2025-09-08T09:59:16.836Z",
//                 "updatedAt": "2025-09-08T09:59:16.836Z"
//             }   
      
      console.log(result);
      // check if user exist then
      // TODO: Implement sign up logic
      return { message: "Sign up successful", result };
    }),
  chat: publicProcedure
    .input(
      z.object({
        purpose: z.string(),
        keyVocabulary: z.string(),
        keyGrammar: z.string(),
        studentTask: z.string(),
        otherInstructions: z.string(),
      })
    )
    .mutation((opts) => {
      const { input: message } = opts;
      const {
        purpose,
        keyVocabulary,
        keyGrammar,
        studentTask,
        otherInstructions,
      } = message;
      const prompt = systemPrompt({
        purpose,
        keyVocabulary,
        keyGrammar,
        studentTask,
        otherInstructions,
      });
      return { prompt };
    }),

  signIn: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { input:{
        email,password
      } } = opts;
      const user= await prismaClient.user.findFirst({
        select:{
          id:true,
        },
        where:{
          email:email,
          password:password
        }
      })
      console.log(user)
      if(!user) throw new TRPCError({code:"UNAUTHORIZED",message:"Invalid email or password"})
      const token=await generateToken(user.id)
      // TODO: Implement sign in logic
      return { message: "Sign in successful" ,token};
    }),
});

const server = createHTTPServer({
  router: appRouter,
  createContext: (opts) => {
    return createTRPCContext(opts);
  },
});

server.listen(3005, () => {
  console.log("http Server Running");
});
// import { applyWSSHandler } from "@trpc/server/adapters/ws";
// import ws from "ws";
// const wss = new ws.Server({
//   port: 3006,
// });
// const handler = applyWSSHandler({
//   wss,
//   router: appRouter,
//   createContext() {
//     console.log("web socket");
//     return {};
//   },
//   // Enable heartbeat messages to keep connection open (disabled by default)
//   keepAlive: {
//     enabled: true,
//     // server ping message interval in milliseconds
//     pingMs: 30000,
//     // connection is terminated if pong message is not received in this many milliseconds
//     pongWaitMs: 5000,
//   },
// });
// wss.on("connection", (ws) => {
//   console.log(`➕➕ Connection (${wss.clients.size})`);
//   ws.once("close", () => {
//     console.log(`➖➖ Connection (${wss.clients.size})`);
//   });
// });
// console.log("✅ WebSocket Server listening on ws://localhost:3006");
// process.on("SIGTERM", () => {
//   console.log("SIGTERM");
//   handler.broadcastReconnectNotification();
//   wss.close();
// });

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
