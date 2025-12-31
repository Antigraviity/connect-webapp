import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Admin logged out successfully'
    }, { status: 200 });

    // Clear the admin token cookie
    response.cookies.set('adminToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred during logout'
    }, { status: 500 });
  }
}
