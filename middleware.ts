import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Edge-compatible JWT library
import { checkRateLimit, rateLimitPresets } from '@/lib/rateLimit';

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  // Add your local IP for mobile testing
  'http://192.168.1.100:8081',
  'http://192.168.0.100:8081',
];

function getCorsHeaders(origin: string | null) {
  // Check if origin is allowed
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const origin = request.headers.get('origin');

  // Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    const corsHeaders = getCorsHeaders(origin);

    // Handle OPTIONS request (preflight)
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // ==================== RATE LIMITING ====================
    // Protect API routes from abuse
    let rateLimitResponse = null;

    if (pathname.startsWith('/api/auth')) {
      // Strict limit for authentication routes
      rateLimitResponse = await checkRateLimit(request, rateLimitPresets.strict);
    } else {
      // Standard limit for other API routes
      rateLimitResponse = await checkRateLimit(request, rateLimitPresets.standard);
    }

    if (rateLimitResponse) {
      // Apply CORS headers to rate limit response so client can read it
      Object.entries(corsHeaders).forEach(([key, value]) => {
        rateLimitResponse.headers.set(key, value);
      });
      return rateLimitResponse;
    }
    // =======================================================

    // For other API requests, add CORS headers to the response
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  const token = request.cookies.get('token')?.value;
  const adminToken = request.cookies.get('adminToken')?.value;

  // Admin route protection
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginPage = pathname === '/admin/login';

  if (isAdminRoute && !isAdminLoginPage) {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      if (!process.env.NEXTAUTH_SECRET) {
        console.error('❌ NEXTAUTH_SECRET is not defined');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
      const { payload: decoded } = await jwtVerify(adminToken, secret);

      if (!decoded.isAdmin || decoded.role !== 'ADMIN') {
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('adminToken');
        return response;
      }

      return NextResponse.next();
    } catch (error) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('adminToken');
      return response;
    }
  }

  // If admin is already logged in and tries to access admin login page, redirect to admin dashboard
  if (isAdminLoginPage && adminToken) {
    try {
      if (!process.env.NEXTAUTH_SECRET) {
        return NextResponse.next();
      }
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
      const { payload: decoded } = await jwtVerify(adminToken, secret);

      if (decoded.isAdmin && decoded.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } catch (error) {
      // Token invalid, let them access login page
      const response = NextResponse.next();
      response.cookies.delete('adminToken');
      return response;
    }
  }

  //
  // Define protected routes for each user type
  const buyerRoutes = ['/buyer'];
  const customerRoutes = ['/customer'];
  const vendorRoutes = ['/vendor'];
  const companyRoutes = ['/company'];
  const employerRoutes = ['/employer'];

  // Check if the route requires authentication
  const isBuyerRoute = buyerRoutes.some(route => pathname.startsWith(route));
  const isCustomerRoute = customerRoutes.some(route => pathname.startsWith(route));
  const isVendorRoute = vendorRoutes.some(route => pathname.startsWith(route));
  const isCompanyRoute = companyRoutes.some(route => pathname.startsWith(route));
  const isEmployerRoute = employerRoutes.some(route => pathname.startsWith(route));

  const isProtectedRoute = isBuyerRoute || isCustomerRoute || isVendorRoute || isCompanyRoute || isEmployerRoute;

  // If accessing a protected route without a token, redirect to signin
  if (isProtectedRoute && !token) {
    console.log('⚠️ No token found, redirecting to signin');
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // If user has a token and tries to access signin/register, redirect to their dashboard
  // EXCEPTION: Allow access to register page with ?type= parameter (for adding additional account types)
  const registerType = request.nextUrl.searchParams.get('type');
  const isRegisterWithType = pathname.startsWith('/auth/register') && registerType;

  if (token && (pathname === '/signin' || (pathname.startsWith('/auth/register') && !isRegisterWithType))) {
    try {
      if (!process.env.NEXTAUTH_SECRET) {
        return NextResponse.next();
      }
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
      const { payload: decoded } = await jwtVerify(token, secret);

      let redirectUrl = '/buyer/dashboard';

      if (decoded.userType === 'BUYER') {
        redirectUrl = '/buyer/dashboard';
      } else if (decoded.userType === 'SELLER') {
        redirectUrl = '/vendor/dashboard';
      } else if (decoded.userType === 'EMPLOYER') {
        redirectUrl = '/company/dashboard';
      } else if (decoded.role === 'SELLER') {
        redirectUrl = '/vendor/dashboard';
      } else if (decoded.role === 'USER') {
        redirectUrl = '/buyer/dashboard';
      }

      return NextResponse.redirect(new URL(redirectUrl, request.url));
    } catch (error) {
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }

  // If user is logged in and accessing register with type parameter, let them through
  // This allows buyers to become sellers, etc.
  if (token && isRegisterWithType) {
    return NextResponse.next();
  }

  // Verify token and check if user is accessing the correct dashboard
  if (isProtectedRoute && token) {
    try {
      if (!process.env.NEXTAUTH_SECRET) {
        console.error('❌ NEXTAUTH_SECRET is not defined');
        return NextResponse.redirect(new URL('/signin', request.url));
      }
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
      const { payload: decoded } = await jwtVerify(token, secret);

      if (isBuyerRoute || isCustomerRoute) {
        if (decoded.userType === 'BUYER' || decoded.role === 'USER') {
          return NextResponse.next();
        } else {
          let correctUrl = '/signin';
          if (decoded.userType === 'SELLER' || decoded.role === 'SELLER') {
            correctUrl = '/vendor/dashboard';
          } else if (decoded.userType === 'EMPLOYER') {
            correctUrl = '/company/dashboard';
          }
          return NextResponse.redirect(new URL(correctUrl, request.url));
        }
      }

      if (isVendorRoute) {
        if (decoded.userType === 'SELLER' || decoded.role === 'SELLER') {
          return NextResponse.next();
        } else {
          let correctUrl = '/signin';
          if (decoded.userType === 'BUYER' || decoded.role === 'USER') {
            correctUrl = '/buyer/dashboard';
          } else if (decoded.userType === 'EMPLOYER') {
            correctUrl = '/company/dashboard';
          }
          return NextResponse.redirect(new URL(correctUrl, request.url));
        }
      }

      if (isCompanyRoute || isEmployerRoute) {
        if (decoded.userType === 'EMPLOYER') {
          return NextResponse.next();
        } else {
          let correctUrl = '/signin';
          if (decoded.userType === 'BUYER' || decoded.role === 'USER') {
            correctUrl = '/buyer/dashboard';
          } else if (decoded.userType === 'SELLER' || decoded.role === 'SELLER') {
            correctUrl = '/vendor/dashboard';
          }
          return NextResponse.redirect(new URL(correctUrl, request.url));
        }
      }

      return NextResponse.next();
    } catch (error) {
      const response = NextResponse.redirect(new URL('/signin', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/buyer/:path*',
    '/customer/:path*',
    '/vendor/:path*',
    '/company/:path*',
    '/employer/:path*',
    '/admin/:path*',
    '/signin',
    '/auth/register',
  ],
};
