import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@repo/backend/server/index';

export type TRPCClient = ReturnType<typeof createTRPCReact<AppRouter>>;
export const trpc: TRPCClient = createTRPCReact<AppRouter>();