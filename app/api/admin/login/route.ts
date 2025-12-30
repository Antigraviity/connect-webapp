import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Admin credentials - In production, store these securely (environment variables or database)
const ADMIN_CREDENTIALS = {
  email: 'forgeindiaconnect@gmail.com',
  password: 'ForgeIndia#12',
};

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('🔐 Admin login attempt for:', email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }

    // Check credentials
    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      console.log('❌ Invalid admin credentials');
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    console.log('✅ Admin credentials verified');

    // Generate JWT token for admin
    const token = jwt.sign(
      {
        userId: 'admin',
        email: ADMIN_CREDENTIALS.email,
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
        email: ADMIN_CREDENTIALS.email,
        role: 'ADMIN',
        name: 'Super Admin',
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

    console.log('🎉 Admin login successful');
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
