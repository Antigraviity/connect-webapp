import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { checkRateLimit, getClientIp, RateLimitPresets } from '@/lib/rate-limit';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - strict limit for admin login
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, RateLimitPresets.ADMIN_LOGIN);

    if (!rateLimit.success) {
      return NextResponse.json({
        success: false,
        message: 'Too many admin login attempts. Please try again later.'
      }, { status: 429 });
    }

    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }

    // Find admin user in database
    const adminUser = await db.user.findUnique({
      where: { email: email }
    });

    // Check if user exists and is an admin
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    // Verify password using bcrypt
    if (!adminUser.password) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, adminUser.password);

    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    // Check if account is active
    if (!adminUser.active) {
      return NextResponse.json({
        success: false,
        message: 'Admin account is deactivated'
      }, { status: 403 });
    }

    // Admin credentials verified
    // Generate JWT token for admin
    const token = jwt.sign(
      {
        userId: adminUser.id,
        email: adminUser.email,
        role: 'ADMIN',
        isAdmin: true,
      },
      JWT_SECRET,
      { expiresIn: '24h' } // Admin sessions expire in 24 hours
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Admin login successful',
      admin: {
        email: adminUser.email,
        role: 'ADMIN',
        name: adminUser.name || 'Super Admin',
      }
    }, { status: 200 });

    // Set admin token cookie
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    // Admin login successful
    return response;

  } catch (error) {
    console.error('💥 Admin login error:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred during login',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
