import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { phone, email, newPassword, method } = await request.json();

    if (!newPassword) {
      return NextResponse.json({
        success: false,
        message: 'New password is required'
      }, { status: 400 });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json({
        success: false,
        message: 'Password must include uppercase, lowercase, number & special character (min 6 chars)'
      }, { status: 400 });
    }

    let user = null;

    if (method === 'phone' && phone) {
      // Find user by phone number
      user = await db.user.findFirst({
        where: { phone: phone }
      });

      if (!user) {
        // Also try with +91 prefix
        user = await db.user.findFirst({
          where: { phone: `+91${phone}` }
        });
      }
    } else if (method === 'email' && email) {
      // Find user by email
      user = await db.user.findUnique({
        where: { email: email.toLowerCase() }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Phone or email is required'
      }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'No account found with this ' + (method === 'phone' ? 'phone number' : 'email')
      }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    console.log(`✅ Password reset successfully for user: ${user.id} (${user.email})`);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to reset password',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
