'use client'

import { trpc } from './client';
import { trpcClient } from './trpcClient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React,{useState} from 'react';


export const Provider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                retry: () => false,
                retryDelay: 0,
            },
            mutations: {
                retry: () => false,
                retryDelay: 0,
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