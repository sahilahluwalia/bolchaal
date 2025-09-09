import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@repo/backend/server';

export type TRPCClient = ReturnType<typeof createTRPCReact<AppRouter>>;
export const trpc: TRPCClient = createTRPCReact<AppRouter>();

// Export the router type for use in other files
export type { AppRouter };