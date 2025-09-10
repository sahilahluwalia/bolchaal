'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TokenManager } from '../../utils/auth';

function decodeJwt(token: string): { user?: { id: string; role: string } } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const payload = JSON.parse(atob(padded));
    return payload || null;
  } catch {
    return null;
  }
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  const accessToken = useMemo(() => TokenManager.getAccessToken(), []);

  useEffect(() => {
    if (!accessToken) {
      router.replace(`/auth/sign-in?next=${encodeURIComponent(pathname || '/')}`);
      return;
    }
    setChecked(true);
  }, [accessToken, pathname, router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}

export function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = TokenManager.getAccessToken();
    if (token) {
      const payload = decodeJwt(token);
      const role = payload?.user?.role;
      if (role === 'TEACHER') {
        router.replace('/dashboard/teacher');
        return;
      }
      if (role === 'STUDENT') {
        router.replace('/dashboard/student');
        return;
      }
      router.replace('/');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}


