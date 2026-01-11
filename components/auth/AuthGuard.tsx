"use client";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard component - simplified version
 * 
 * Note: Authentication is handled by middleware.ts which checks JWT tokens
 * and redirects unauthenticated users. This component just renders children.
 * 
 * The middleware provides server-side protection, which is more secure than
 * client-side localStorage checks that can be easily bypassed.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  // Middleware handles all authentication and authorization
  // This component simply renders children for authenticated users
  return <>{children}</>;
}
