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

    console.log(`📞 Sending OTP to: ${phone}`);

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes (increased from 10)

    // Store OTP with consistent phone formatting
    otpStore.set(phone, { otp, expiresAt });
    
    // Debug: show OTP store status
    otpStore.debug();

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

    return NextResponse.json({
      success: true,
      message: smsSent ? 'OTP sent successfully' : 'OTP generated (SMS service unavailable)',
      // Always return OTP for now (remove in production when SMS is working)
      otp
    }, { status: 200 });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send OTP',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
