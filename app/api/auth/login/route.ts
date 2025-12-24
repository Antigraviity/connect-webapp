import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔐 Login attempt for email:', body.email);
    
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
    
    console.log('👤 User found:', { id: user.id, email: user.email, userType: user.userType, role: user.role });
    
    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }
    
    console.log('✅ Password verified');
    
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
    
    console.log('🔍 Determining redirect URL. UserType:', user.userType, 'Role:', user.role);
    
    if (user.userType === 'BUYER') {
      redirectUrl = '/buyer/dashboard';
      console.log('🎯 Redirecting BUYER to:', redirectUrl);
    } else if (user.userType === 'SELLER') {
      redirectUrl = '/vendor/dashboard';
      console.log('🎯 Redirecting SELLER to:', redirectUrl);
    } else if (user.userType === 'EMPLOYER') {
      redirectUrl = '/company/dashboard';
      console.log('🎯 Redirecting EMPLOYER to:', redirectUrl);
    } else {
      // Fallback: check role if userType is not set
      console.log('⚠️ UserType not set, checking role');
      if (user.role === 'SELLER') {
        redirectUrl = '/vendor/dashboard';
        console.log('🎯 Redirecting SELLER (by role) to:', redirectUrl);
      } else if (user.role === 'USER') {
        redirectUrl = '/buyer/dashboard';
        console.log('🎯 Redirecting USER (by role) to:', redirectUrl);
      } else if (user.role === 'ADMIN') {
        redirectUrl = '/admin/dashboard'; // Add admin dashboard if needed
        console.log('🎯 Redirecting ADMIN to:', redirectUrl);
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
    
    console.log('🔑 JWT token generated');
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('✅ Login successful! Sending response with redirect URL:', redirectUrl);
    
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
    
    console.log('🍪 Cookie set in response');
    
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
