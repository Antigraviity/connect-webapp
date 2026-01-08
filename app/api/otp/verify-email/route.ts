import { NextRequest, NextResponse } from 'next/server';

// Shared email OTP store
if (!global.emailOtpStore) {
  global.emailOtpStore = new Map();
}
const emailOtpStore = global.emailOtpStore as Map<string, { otp: string; timestamp: number; attempts?: number; expiresAt?: number }>;

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({
        success: false,
        message: 'Email and OTP are required'
      }, { status: 400 });
    }

    // Get stored OTP
    const storedData = emailOtpStore.get(email.toLowerCase());

    if (!storedData) {
      return NextResponse.json({
        success: false,
        message: 'OTP not found or expired. Please request a new OTP.'
      }, { status: 400 });
    }

    // Check if OTP is expired
    if (storedData.expiresAt && Date.now() > storedData.expiresAt) {
      emailOtpStore.delete(email);
      return NextResponse.json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      }, { status: 400 });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return NextResponse.json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      }, { status: 400 });
    }

    // OTP verified successfully - remove it from store
    emailOtpStore.delete(email);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Verify Email OTP error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to verify email OTP',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
