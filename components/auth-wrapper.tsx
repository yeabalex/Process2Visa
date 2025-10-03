'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AuthWrapper({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { authorized, setAuthState } = useAuth();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
       
        const res = await fetch(`${baseUrl}/api/verify-token`, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          }
        });


        if (!res.ok) {
          setAuthState({ authorized: false, chatId: null });
          return;
        }

        const data = await res.json();

        setAuthState({ authorized: data?.valid ?? false, chatId: data?.data?.chatId ?? null });
      } catch (err) {
        console.error("Auth check failed:", err);
        setAuthState({ authorized: false, chatId: null });
      }
    };

    verifyToken();
  }, [setAuthState]);

  if (authorized === null) {
    return <div className="p-4 text-center">Checking authentication...</div>;
  }

  return authorized ? <>{children}</> : fallback ?? <div className="p-4 text-center">Not authorized</div>;
}
