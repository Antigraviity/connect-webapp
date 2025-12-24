import { NextRequest, NextResponse } from 'next/server';
import otpStore from '@/lib/otpStore';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    console.log(`🔍 Verifying OTP for phone: ${phone}, OTP: ${otp}`);

    if (!phone || !otp) {
      return NextResponse.json({
        success: false,
        message: 'Phone number and OTP are required'
      }, { status: 400 });
    }

    // Get stored OTP with debugging
    console.log(`📋 Looking up OTP in store for: ${phone}`);
    const storedData = otpStore.get(phone);

    if (!storedData) {
      console.log(`❌ No OTP found for ${phone}`);
      otpStore.debug(); // Show current store state
      return NextResponse.json({
        success: false,
        message: 'OTP not found or expired. Please request a new OTP.'
      }, { status: 400 });
    }

    console.log(`✅ Found OTP data:`, {
      storedOTP: storedData.otp,
      inputOTP: otp,
      expiresAt: new Date(storedData.expiresAt).toLocaleString(),
      isExpired: Date.now() > storedData.expiresAt
    });

    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      console.log(`⏰ OTP expired for ${phone}`);
      otpStore.delete(phone);
      return NextResponse.json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      }, { status: 400 });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      console.log(`🚫 OTP mismatch for ${phone}. Expected: ${storedData.otp}, Got: ${otp}`);
      return NextResponse.json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      }, { status: 400 });
    }

    // OTP verified successfully - remove it from store
    console.log(`🎉 OTP verified successfully for ${phone}`);
    otpStore.delete(phone);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to verify OTP',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
