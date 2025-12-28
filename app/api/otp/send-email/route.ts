import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Generate random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Shared OTP store (in production, use Redis or database)
if (!global.emailOtpStore) {
  global.emailOtpStore = new Map();
}
const emailOtpStore = global.emailOtpStore as Map<string, { otp: string; timestamp: number; attempts?: number; expiresAt?: number }>;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email address is required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format'
      }, { status: 400 });
    }

    // Generate OTP
    const otp = generateOTP();
    const timestamp = Date.now();
    const expiresAt = timestamp + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    emailOtpStore.set(email.toLowerCase(), { otp, timestamp, expiresAt });

    // Send OTP via Email
    let emailSent = false;
    let emailError = null;
    
    try {
      console.log('═══════════════════════════════════════════');
      console.log('📧 EMAIL OTP SENDING');
      console.log('═══════════════════════════════════════════');
      console.log('To:', email);
      console.log('SMTP Host:', process.env.SMTP_HOST);
      console.log('SMTP Port:', process.env.SMTP_PORT);
      console.log('SMTP User:', process.env.SMTP_USER);
      console.log('SMTP Password:', process.env.SMTP_PASSWORD ? '✓ Set (' + process.env.SMTP_PASSWORD.length + ' chars)' : '✗ Not Set');
      console.log('SMTP From:', process.env.SMTP_FROM);
      console.log('═══════════════════════════════════════════');

      // Create transporter with Gmail-specific settings
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates
        }
      });

      console.log('✅ Transporter created');

      // Verify connection
      try {
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully');
      } catch (verifyError: any) {
        console.error('❌ SMTP verification failed:', verifyError.message);
        console.log('💡 For Gmail, make sure:');
        console.log('   1. Use App Password (not regular password)');
        console.log('   2. 2-Step Verification is enabled on Google account');
        console.log('   3. App Password is created at: https://myaccount.google.com/apppasswords');
        throw verifyError;
      }

      // Email content
      const mailOptions = {
        from: `"ConnectApp" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your ConnectApp Verification Code',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .otp-box { background: white; border: 2px dashed #3b82f6; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
              .otp-code { font-size: 36px; font-weight: bold; color: #3b82f6; letter-spacing: 8px; margin: 10px 0; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 5px 5px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Email Verification</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">ConnectApp</p>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>Thank you for registering with ConnectApp! Please use the verification code below to complete your registration:</p>
                
                <div class="otp-box">
                  <p style="margin: 0; color: #666; font-size: 14px;">Your verification code is:</p>
                  <p class="otp-code">${otp}</p>
                  <p style="margin: 0; color: #666; font-size: 14px;">Valid for 10 minutes</p>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong>
                  <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>Never share this code with anyone</li>
                    <li>ConnectApp will never ask for this code</li>
                    <li>This code expires in 10 minutes</li>
                  </ul>
                </div>
                
                <p>If you didn't request this code, please ignore this email.</p>
                
                <p>Best regards,<br><strong>ConnectApp Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply.</p>
                <p>© 2025 ConnectApp. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Your ConnectApp verification code is: ${otp}. Valid for 10 minutes. Never share this code with anyone.`,
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      emailSent = true;
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', info.messageId);
      console.log('Accepted:', info.accepted);
      console.log('Rejected:', info.rejected);

    } catch (error: any) {
      emailError = error;
      console.error('❌ Email sending failed:', error.message);
      
      // Provide helpful error messages
      if (error.code === 'EAUTH') {
        console.error('💡 Authentication failed. For Gmail:');
        console.error('   - Enable 2-Step Verification in Google Account');
        console.error('   - Generate App Password at: https://myaccount.google.com/apppasswords');
        console.error('   - Use the 16-character App Password as SMTP_PASSWORD');
      } else if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
        console.error('💡 Connection failed. Check:');
        console.error('   - SMTP_HOST and SMTP_PORT are correct');
        console.error('   - Firewall is not blocking the connection');
      }
    }

    // Always log OTP for debugging
    console.log('═══════════════════════════════════════════');
    console.log(`📧 Email OTP for ${email}: ${otp}`);
    console.log(`📧 Email sent: ${emailSent ? 'Yes' : 'No'}`);
    console.log('═══════════════════════════════════════════');

    return NextResponse.json({
      success: true,
      message: emailSent ? 'OTP sent to your email' : 'OTP generated',
      // Always return OTP for now (remove in production when email is working)
      otp,
      emailSent
    }, { status: 200 });

  } catch (error) {
    console.error('Send Email OTP error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send email OTP',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
