import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Edge-compatible JWT library

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const adminToken = request.cookies.get('adminToken')?.value;
  const pathname = request.nextUrl.pathname;

  // Debug logging only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('====== MIDDLEWARE DEBUG ======');
    console.log('🕐 Time:', new Date().toISOString());
    console.log('🚪 Pathname:', pathname);
    console.log('🍪 Token present:', !!token);
    console.log('🔐 Admin Token present:', !!adminToken);
    console.log('🍪 All cookies:', request.cookies.getAll().map(c => c.name));
    console.log('==============================');
  }

  // Admin route protection
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginPage = pathname === '/admin/login';

  if (isAdminRoute && !isAdminLoginPage) {
    if (!adminToken) {
      // No admin token - redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET);
      if (!secret || secret.length === 0) {
        throw new Error('NEXTAUTH_SECRET or JWT_SECRET must be configured');
      }
      const { payload: decoded } = await jwtVerify(adminToken, secret);

      if (!decoded.isAdmin || decoded.role !== 'ADMIN') {
        // Invalid admin token
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('adminToken');
        return response;
      }

      // Admin access granted
      return NextResponse.next();
    } catch (error) {
      // Admin token verification failed
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('adminToken');
      return response;
    }
  }

  // If admin is already logged in and tries to access admin login page, redirect to admin dashboard
  if (isAdminLoginPage && adminToken) {
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET);
      if (!secret || secret.length === 0) {
        throw new Error('NEXTAUTH_SECRET or JWT_SECRET must be configured');
      }
      const { payload: decoded } = await jwtVerify(adminToken, secret);

      if (decoded.isAdmin && decoded.role === 'ADMIN') {
        // Admin already logged in
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
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // If user has a token and tries to access signin/register, redirect to their dashboard
  // EXCEPTION: Allow access to register page with ?type= parameter (for adding additional account types)
  const registerType = request.nextUrl.searchParams.get('type');
  const isRegisterWithType = pathname.startsWith('/auth/register') && registerType;

  if (token && (pathname === '/signin' || (pathname.startsWith('/auth/register') && !isRegisterWithType))) {
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET);
      if (!secret || secret.length === 0) {
        throw new Error('NEXTAUTH_SECRET or JWT_SECRET must be configured');
      }
      const { payload: decoded } = await jwtVerify(token, secret);

      // User accessing auth page - redirect to dashboard

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

      // Redirect logged-in user to dashboard
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    } catch (error) {
      // Invalid token - clear cookie
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }

  // If user is logged in and accessing register with type parameter, let them through
  // This allows buyers to become sellers, etc.
  if (token && isRegisterWithType) {
    // Allow logged-in user to add additional account type
    return NextResponse.next();
  }

  // Verify token and check if user is accessing the correct dashboard
  if (isProtectedRoute && token) {
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET);
      if (!secret || secret.length === 0) {
        throw new Error('NEXTAUTH_SECRET or JWT_SECRET must be configured');
      }
      const { payload: decoded } = await jwtVerify(token, secret);

      // Verify user type matches protected route

      if (isBuyerRoute || isCustomerRoute) {
        if (decoded.userType === 'BUYER' || decoded.role === 'USER') {
          // Access granted
          return NextResponse.next();
        } else {
          // Wrong user type - redirect to correct dashboard
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
          // Access granted
          return NextResponse.next();
        } else {
          // Wrong user type - redirect
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
          // Access granted
          return NextResponse.next();
        } else {
          // Wrong user type - redirect
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
      // Token verification failed
      const response = NextResponse.redirect(new URL('/signin', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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
