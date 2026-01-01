import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

export async function authenticateToken(request: NextRequest): Promise<{ authenticated: boolean; user?: AuthUser; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return { authenticated: false, error: 'No token provided' };
    }

    if (!process.env.NEXTAUTH_SECRET) {
      console.error('❌ CRITICAL: NEXTAUTH_SECRET is not defined in environment variables');
      return { authenticated: false, error: 'Internal server configuration error' };
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET
    ) as AuthUser;

    return { authenticated: true, user: decoded };
  } catch (error) {
    return { authenticated: false, error: 'Invalid or expired token' };
  }
}

export function requireAuth(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const auth = await authenticateToken(request);

    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({
        success: false,
        message: auth.error || 'Unauthorized'
      }, { status: 401 });
    }

    return handler(request, auth.user);
  };
}

export function requireRole(allowedRoles: string[]) {
  return (handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) => {
    return async (request: NextRequest) => {
      const auth = await authenticateToken(request);

      if (!auth.authenticated || !auth.user) {
        return NextResponse.json({
          success: false,
          message: auth.error || 'Unauthorized'
        }, { status: 401 });
      }

      if (!allowedRoles.includes(auth.user.role)) {
        return NextResponse.json({
          success: false,
          message: 'Forbidden: Insufficient permissions'
        }, { status: 403 });
      }

      return handler(request, auth.user);
    };
  };
}
