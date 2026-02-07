import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSMSProvider } from '@/lib/sms/providers';
import otpStore from '@/lib/otpStore';

// Generate random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({
        success: false,
        message: 'Phone number is required'
      }, { status: 400 });
    }

    // Validate 10-digit phone number
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid phone number. Must be 10 digits.'
      }, { status: 400 });
    }

    console.log(`📞 Sending OTP to: ${phone}`);

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes (increased from 10)

    // Store OTP with consistent phone formatting
    otpStore.set(phone, { otp, expiresAt });

    // Debug: show OTP store status (dev only)
    if (process.env.NODE_ENV === 'development') {
      otpStore.debug();
    }

    // Send OTP via SMS
    const smsProvider = getSMSProvider();
    let smsSent = false;

    try {
      smsSent = await smsProvider.sendOTP(phone, otp);
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
    }

    // In development, log the OTP
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🔐 OTP for ${phone}: ${otp}\n`);
    }

    const isDev = process.env.NODE_ENV === 'development';

    return NextResponse.json({
      success: true,
      message: smsSent ? 'OTP sent successfully' : (isDev ? 'OTP generated (SMS service unavailable)' : 'Failed to send OTP. Please try again.'),
      // Only return OTP in development mode for testing — NEVER in production
      ...(isDev && { otp })
    }, { status: 200 });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send OTP',
      ...(process.env.NODE_ENV === 'development' && { error: error instanceof Error ? error.message : 'Unknown error' })
    }, { status: 500 });
  }
}
