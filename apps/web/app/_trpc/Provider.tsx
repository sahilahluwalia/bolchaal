'use client'

import { trpc } from './client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React,{useState} from 'react';
import {httpLink} from '@trpc/client';



export const Provider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient({}));
    const [trpcClient] = useState(() => trpc.createClient({
        links: [
            httpLink({
                url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005',
                headers: () => {
                    const token = typeof window !== 'undefined' ? localStorage.getItem('user-token') : null;
                    if(!token) return {};
                    return {
                        'Authorization': `Bearer ${token}`
                    }
                }
            }),
        ],
    }));
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </trpc.Provider>
  )
};