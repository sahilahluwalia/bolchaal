import { createTRPCProxyClient, httpLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@repo/backend/server';
import { TokenManager } from '../../utils/auth';

// Create a simple TRPC client that will handle token refresh at the React Query level
const createClient = () => {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005',
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            credentials: 'include', // Include cookies with requests
          });
        },
        headers: () => {
          const token = TokenManager.getAccessToken();
          if (!token) return {};
          return {
            'Authorization': `Bearer ${token}`
          };
        },
      }),
    ],
  });
};

export const trpcClient = createClient();

// Also export the React hooks version
export const trpc = createTRPCReact<AppRouter>();
