import { createTRPCProxyClient, createWSClient, httpLink,splitLink,wsLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@repo/backend/server';
import { TokenManager } from '../../utils/auth';

const createClient = () => {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3006'
  const wsClient = createWSClient({
    url: wsUrl,
    connectionParams: () => {
      const token = TokenManager.getAccessToken();
      if (!token) return {};
      return {
        'Authorization': `Bearer ${token}`
      };
    }
  })


  return createTRPCProxyClient<AppRouter>({
    links: [
      splitLink({
        condition: (op) => op.type === 'subscription',
        true: wsLink({client: wsClient}),
        false: httpLink({
          url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005',
          headers: () => {
            const token = TokenManager.getAccessToken();
            if (!token) return {};
            return {
              'Authorization': `Bearer ${token}`
            };
          },
        })
      })
    ]
  })
};


export const trpcClient = createClient();

// Also export the React hooks version
export const trpc = createTRPCReact<AppRouter>();
