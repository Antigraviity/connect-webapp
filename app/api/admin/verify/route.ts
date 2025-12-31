import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export async function GET(request: NextRequest) {
  try {
    const adminToken = request.cookies.get('adminToken')?.value;

    if (!adminToken) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'No admin token found'
      }, { status: 401 });
    }

    // Verify the token
    const decoded = jwt.verify(adminToken, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
      isAdmin: boolean;
    };

    if (!decoded.isAdmin || decoded.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'Invalid admin token'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      admin: {
        email: decoded.email,
        role: decoded.role,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json({
      success: false,
      authenticated: false,
      message: 'Token verification failed'
    }, { status: 401 });
  }
}
