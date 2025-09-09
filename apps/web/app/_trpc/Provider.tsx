'use client'

import { trpc } from './client';
import { trpcClient } from './trpcClient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React,{useState} from 'react';
import { TRPCClientError } from '@trpc/client';
import { TokenRefreshService } from '../../utils/tokenRefresh';

let isRefreshing = false;

export const Provider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                retry: (failureCount, error) => {
                    // Handle 401 errors with token refresh
                    if (error instanceof TRPCClientError && error.data?.code === 'UNAUTHORIZED' && failureCount === 0) {
                        // Trigger refresh asynchronously (don't block retry decision)
                        if (!isRefreshing) {
                            isRefreshing = true;
                            TokenRefreshService.refreshAccessToken().finally(() => {
                                isRefreshing = false;
                            });
                        }
                        return true; // Retry once after potential token refresh
                    }
                    return false; // Don't retry other errors
                },
                retryDelay: 100, // Small delay to allow token refresh
            },
            mutations: {
                retry: (failureCount, error) => {
                    // Handle 401 errors with token refresh for mutations too
                    if (error instanceof TRPCClientError && error.data?.code === 'UNAUTHORIZED' && failureCount === 0) {
                        // Trigger refresh asynchronously
                        if (!isRefreshing) {
                            isRefreshing = true;
                            TokenRefreshService.refreshAccessToken().finally(() => {
                                isRefreshing = false;
                            });
                        }
                        return true; // Retry once
                    }
                    return false;
                },
                retryDelay: 100,
            },
        },
    }));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </trpc.Provider>
  )
};