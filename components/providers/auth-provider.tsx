"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, memo } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider wraps the application with NextAuth SessionProvider.
 * Memoized to prevent unnecessary re-renders that could trigger duplicate session requests.
 */
function AuthProviderComponent({ children }: AuthProviderProps) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
}

// Memoize to prevent re-renders from parent layout changes
export const AuthProvider = memo(AuthProviderComponent);
