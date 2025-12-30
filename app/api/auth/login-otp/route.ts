import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import otpStore from '@/lib/otpStore';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    console.log(`🔐 OTP Login attempt for phone: ${phone}`);

    if (!phone || !otp) {
      return NextResponse.json({
        success: false,
        message: 'Phone number and OTP are required'
      }, { status: 400 });
    }

    // Format phone number consistently (remove +91 if present)
    const formattedPhone = phone.replace(/^\+91/, '').replace(/\D/g, '');

    // Step 1: Verify OTP first
    console.log(`📋 Verifying OTP for: ${formattedPhone}`);
    const storedData = otpStore.get(formattedPhone);

    if (!storedData) {
      console.log(`❌ No OTP found for ${formattedPhone}`);
      return NextResponse.json({
        success: false,
        message: 'OTP not found or expired. Please request a new OTP.'
      }, { status: 400 });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      console.log(`⏰ OTP expired for ${formattedPhone}`);
      otpStore.delete(formattedPhone);
      return NextResponse.json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      }, { status: 400 });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      console.log(`🚫 OTP mismatch for ${formattedPhone}. Expected: ${storedData.otp}, Got: ${otp}`);
      return NextResponse.json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      }, { status: 400 });
    }

    // OTP is valid - now check if user exists in database
    console.log(`✅ OTP verified, checking user in database...`);

    // Step 2: Check if phone number exists in database
    const user = await db.user.findFirst({
      where: {
        phone: {
          contains: formattedPhone
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        userType: true,
        role: true,
        image: true,
        verified: true,
        active: true,
      }
    });

    if (!user) {
      console.log(`❌ User not found for phone: ${formattedPhone}`);
      // Clear the OTP since it was valid
      otpStore.delete(formattedPhone);
      
      return NextResponse.json({
        success: false,
        message: 'No account found with this phone number. Please register first.',
        notRegistered: true
      }, { status: 404 });
    }

    // Check if user is active
    if (!user.active) {
      console.log(`🚫 User account is deactivated: ${user.email}`);
      otpStore.delete(formattedPhone);
      return NextResponse.json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      }, { status: 403 });
    }

    // Step 3: User exists and OTP is valid - create session/token
    console.log(`🎉 User found: ${user.email}, creating session...`);
    
    // Clear the OTP
    otpStore.delete(formattedPhone);

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role,
        userType: user.userType 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Determine redirect URL based on user type
    let redirectUrl = '/buyer/dashboard';
    if (user.userType === 'SELLER') {
      redirectUrl = '/vendor/dashboard';
    } else if (user.userType === 'EMPLOYER') {
      redirectUrl = '/company/dashboard';
    } else if (user.role === 'ADMIN') {
      redirectUrl = '/admin/dashboard';
    }

    // Create response with token in httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        role: user.role,
        image: user.image,
        verified: user.verified,
      },
      redirectUrl
    }, { status: 200 });

    // Set httpOnly cookie for the token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log(`✅ OTP login successful for ${user.email}`);
    return response;

  } catch (error) {
    console.error('OTP Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred during login',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
