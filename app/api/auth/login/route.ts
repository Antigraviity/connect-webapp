import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { z } from 'zod';
import { checkRateLimit, getClientIp, RateLimitPresets } from '@/lib/rate-limit';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent brute force attacks
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, RateLimitPresets.LOGIN);

    if (!rateLimit.success) {
      return NextResponse.json({
        success: false,
        message: 'Too many login attempts. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      }, {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetTime),
        }
      });
    }

    const body = await request.json();
    // Validate input
    // Validate input
    const validatedData = loginSchema.parse(body);

    // Find user
    const user = await db.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user || !user.password) {
      console.log('❌ User not found or no password set');
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }
    // User found - verify password
    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);

    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }
    // Password verified
    // Check if user is active
    if (!user.active) {
      console.log('⚠️ User account is inactive');
      return NextResponse.json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      }, { status: 403 });
    }

    // Determine redirect URL based on userType (primary) or role (fallback)
    let redirectUrl = '/buyer/dashboard'; // default for buyers
    // Determine redirect URL based on userType
    if (user.userType === 'BUYER') {
      redirectUrl = '/buyer/dashboard';
    } else if (user.userType === 'SELLER') {
      redirectUrl = '/vendor/dashboard';
    } else if (user.userType === 'EMPLOYER') {
      redirectUrl = '/company/dashboard';
    } else {
      // Fallback: check role if userType is not set
      if (user.role === 'SELLER') {
        redirectUrl = '/vendor/dashboard';
      } else if (user.role === 'USER') {
        redirectUrl = '/buyer/dashboard';
      } else if (user.role === 'ADMIN') {
        redirectUrl = '/admin/dashboard';
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        userType: user.userType
      },
      process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
      { expiresIn: '7d' }
    );
    // Generate JWT token
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    // Return user data without password
    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token,
      redirectUrl
    }, { status: 200 });

    // Set cookie with proper configuration
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });
    // Set cookie with proper configuration
    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('❌ Validation error:', error.errors);
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      }, { status: 400 });
    }

    console.error('💥 Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to login',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
