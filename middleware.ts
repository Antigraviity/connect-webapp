import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Edge-compatible JWT library

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const adminToken = request.cookies.get('adminToken')?.value;
  const pathname = request.nextUrl.pathname;

  console.log('====== MIDDLEWARE DEBUG ======');
  console.log('🕐 Time:', new Date().toISOString());
  console.log('🚪 Pathname:', pathname);
  console.log('🍪 Token present:', !!token);
  console.log('🔐 Admin Token present:', !!adminToken);
  if (token) {
    console.log('🔑 Token (first 20 chars):', token.substring(0, 20) + '...');
  }
  console.log('🍪 All cookies:', request.cookies.getAll().map(c => c.name));
  console.log('==============================');

  // Admin route protection
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginPage = pathname === '/admin/login';

  if (isAdminRoute && !isAdminLoginPage) {
    if (!adminToken) {
      console.log('⚠️ No admin token found, redirecting to admin login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'your-super-secret-jwt-key');
      const { payload: decoded } = await jwtVerify(adminToken, secret);

      if (!decoded.isAdmin || decoded.role !== 'ADMIN') {
        console.log('❌ Invalid admin token - not an admin');
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('adminToken');
        return response;
      }

      console.log('✅ Admin access granted');
      return NextResponse.next();
    } catch (error) {
      console.error('💥 Admin token verification failed:', error);
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('adminToken');
      return response;
    }
  }

  // If admin is already logged in and tries to access admin login page, redirect to admin dashboard
  if (isAdminLoginPage && adminToken) {
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'your-super-secret-jwt-key');
      const { payload: decoded } = await jwtVerify(adminToken, secret);

      if (decoded.isAdmin && decoded.role === 'ADMIN') {
        console.log('🔄 Admin already logged in, redirecting to admin dashboard');
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
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'your-secret-key-here');
      const { payload: decoded } = await jwtVerify(token, secret);

      console.log('👤 User accessing auth page:', { userType: decoded.userType, role: decoded.role });

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

      console.log('🔄 User already logged in, redirecting to:', redirectUrl);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    } catch (error) {
      console.log('❌ Invalid token, clearing cookie');
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }
  
  // If user is logged in and accessing register with type parameter, let them through
  // This allows buyers to become sellers, etc.
  if (token && isRegisterWithType) {
    console.log('✅ Allowing logged-in user to access register page with type:', registerType);
    return NextResponse.next();
  }

  // Verify token and check if user is accessing the correct dashboard
  if (isProtectedRoute && token) {
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'your-secret-key-here');
      const { payload: decoded } = await jwtVerify(token, secret);

      console.log('🔍 Middleware check:', { pathname, userType: decoded.userType, role: decoded.role });

      if (isBuyerRoute || isCustomerRoute) {
        if (decoded.userType === 'BUYER' || decoded.role === 'USER') {
          console.log('✅ Access granted to buyer/customer route');
          return NextResponse.next();
        } else {
          console.log('❌ Access denied to buyer/customer route - wrong user type');
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
          console.log('✅ Access granted to vendor route');
          return NextResponse.next();
        } else {
          console.log('❌ Access denied to vendor route - wrong user type');
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
          console.log('✅ Access granted to company/employer route');
          return NextResponse.next();
        } else {
          console.log('❌ Access denied to company/employer route - wrong user type');
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
      console.error('💥 Token verification failed:', error);
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
