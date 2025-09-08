import type { AppRouter } from '@repo/backend/server/index';
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>();