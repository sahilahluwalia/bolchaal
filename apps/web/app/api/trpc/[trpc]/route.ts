import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@repo/backend/server';
import { NextRequest } from 'next/server';

const handler = (req: NextRequest) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req: req,
        createContext: () => ({ req, res: req.nextUrl.res }),
  });
}
export { handler as GET, handler as POST };