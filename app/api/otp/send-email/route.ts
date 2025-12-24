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
    emailOtpStore.set(email, { otp, timestamp, expiresAt });

    // Send OTP via Email
    let emailSent = false;
    let emailError = null;
    
    try {
      console.log('📧 Attempting to send email to:', email);
      console.log('SMTP Config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: process.env.SMTP_FROM
      });

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      console.log('✅ Transporter created successfully');

      // Verify connection
      await transporter.verify();
      console.log('✅ SMTP connection verified');

      // Email content
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Your ConnectApp Verification Code',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .otp-box {
                background: white;
                border: 2px dashed #667eea;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
              }
              .otp-code {
                font-size: 32px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 5px;
              }
              .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Email Verification</h1>
                <p>ConnectApp</p>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>Thank you for registering with ConnectApp! To complete your registration, please use the verification code below:</p>
                
                <div class="otp-box">
                  <p style="margin: 0; color: #666;">Your verification code is:</p>
                  <p class="otp-code">${otp}</p>
                  <p style="margin: 0; color: #666; font-size: 14px;">Valid for 10 minutes</p>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong>
                  <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>Never share this code with anyone</li>
                    <li>ConnectApp will never ask for this code via phone or email</li>
                    <li>This code expires in 10 minutes</li>
                  </ul>
                </div>
                
                <p>If you didn't request this code, please ignore this email or contact our support team.</p>
                
                <p>Best regards,<br>ConnectApp Team</p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>&copy; 2025 ConnectApp. All rights reserved.</p>
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
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

    } catch (error: unknown) {
      emailError = error;
      console.error('❌ Email sending failed:', error);
      
      // Type-safe error handling
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
        });
      } else {
        console.error('Unknown error type:', error);
      }
    }

    // In development, log the OTP
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n📧 Email OTP for ${email}: ${otp}\n`);
    }

    return NextResponse.json({
      success: true,
      message: emailSent ? 'OTP sent to your email' : 'OTP generated (Email service unavailable)',
      // Only return OTP in development mode for testing
      ...(process.env.NODE_ENV === 'development' && { otp, debug: 'Remove this in production' })
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
