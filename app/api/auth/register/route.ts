import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { checkRateLimit, getClientIp, RateLimitPresets } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent spam registrations
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, RateLimitPresets.REGISTER);

    if (!rateLimit.success) {
      return NextResponse.json({
        success: false,
        message: 'Too many registration attempts. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      }, {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
        }
      });
    }

    const body = await request.json();
    const {
      userType, // 'buyer', 'seller', 'employer'

      // Common fields
      phone,

      // Buyer fields
      fullName,
      buyerUsername,
      buyerEmail,
      buyerPassword,

      // Seller fields
      username,
      email,
      password,
      businessName,
      businessType,
      category,
      serviceName,
      businessAddress,
      pincode,
      documentType,

      // Employer fields
      accountType,
      companyName,
      employeeCount,
      designation,
      hiringFor,
      companyAddress
    } = body;

    // Validate required fields
    if (!userType || !phone) {
      return NextResponse.json({
        success: false,
        message: 'User type and phone are required'
      }, { status: 400 });
    }

    // Validate 10-digit phone number
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid phone number. Must be 10 digits.'
      }, { status: 400 });
    }

    // Normalize phone number
    const normalizedPhone = `+91${phone}`;

    // Check if user already exists by phone first
    const phoneCheck = await db.user.findFirst({
      where: { phone: normalizedPhone }
    });

    if (phoneCheck) {
      // User with this phone already exists

      // If user exists, check if they're trying to register with same email
      if ((userType === 'buyer' && phoneCheck.email === buyerEmail) ||
        (userType === 'seller' && phoneCheck.email === email) ||
        (userType === 'employer' && phoneCheck.email === email)) {

        // User already exists with same phone and email - log them in instead

        // Generate JWT token
        const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
        if (!jwtSecret) {
          throw new Error('NEXTAUTH_SECRET or JWT_SECRET must be configured');
        }

        const token = jwt.sign(
          {
            userId: phoneCheck.id,
            email: phoneCheck.email,
            role: phoneCheck.role,
            userType: phoneCheck.userType
          },
          jwtSecret,
          { expiresIn: '7d' }
        );

        // Determine redirect URL
        let redirectUrl = '/buyer/dashboard';
        if (phoneCheck.userType === 'BUYER') redirectUrl = '/buyer/dashboard';
        else if (phoneCheck.userType === 'SELLER') redirectUrl = '/vendor/dashboard';
        else if (phoneCheck.userType === 'EMPLOYER') redirectUrl = '/company/dashboard';

        const { password: _, ...userWithoutPassword } = phoneCheck;

        const response = NextResponse.json({
          success: true,
          message: 'Account already exists. Logging you in...',
          user: userWithoutPassword,
          token,
          redirectUrl
        }, { status: 200 });

        response.cookies.set('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/'
        });

        return response;
      }

      // Different email with same phone - this is an error
      return NextResponse.json({
        success: false,
        message: 'A user with this phone number already exists with a different email address'
      }, { status: 400 });
    }

    // Check for existing email
    let existingUser;
    let userEmail = '';

    if (userType === 'buyer') {
      if (!buyerEmail || !buyerUsername || !buyerPassword) {
        return NextResponse.json({
          success: false,
          message: 'Email, username, and password are required'
        }, { status: 400 });
      }
      userEmail = buyerEmail;

      existingUser = await db.user.findFirst({
        where: {
          OR: [
            { email: buyerEmail },
            { phone: normalizedPhone }
          ]
        }
      });
    } else if (userType === 'seller') {
      if (!email || !username || !password) {
        return NextResponse.json({
          success: false,
          message: 'Email, username, and password are required'
        }, { status: 400 });
      }
      userEmail = email;

      existingUser = await db.user.findFirst({
        where: {
          OR: [
            { email: email },
            { phone: normalizedPhone }
          ]
        }
      });
    } else if (userType === 'employer') {
      if (!email || !fullName || !password) {
        return NextResponse.json({
          success: false,
          message: 'Email, name, and password are required'
        }, { status: 400 });
      }
      userEmail = email;

      existingUser = await db.user.findFirst({
        where: {
          OR: [
            { email: email },
            { phone: normalizedPhone }
          ]
        }
      });
    }

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User with this email or phone already exists'
      }, { status: 400 });
    }

    // Hash password
    let hashedPassword;
    if (userType === 'buyer') {
      hashedPassword = await bcrypt.hash(buyerPassword, 10);
    } else {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    console.log('🔐 Password hashed successfully');

    // Create user based on type
    let newUser: any; // Initialize as any to avoid TypeScript errors
    let dbUserType: 'BUYER' | 'SELLER' | 'EMPLOYER' = 'BUYER'; // Initialize with default value
    let dbRole: 'USER' | 'SELLER' | 'ADMIN' = 'USER'; // Initialize with default value

    if (userType === 'buyer') {
      // Creating buyer account
      dbUserType = 'BUYER';
      dbRole = 'USER';

      newUser = await db.user.create({
        data: {
          name: fullName || buyerUsername,
          email: buyerEmail,
          password: hashedPassword,
          phone: normalizedPhone,
          role: dbRole,
          userType: dbUserType,
          verified: true, // Already verified via OTP
          active: true,
        }
      });
      // Buyer account created
    } else if (userType === 'seller') {
      // Creating seller account
      dbUserType = 'SELLER';
      dbRole = 'SELLER';

      newUser = await db.user.create({
        data: {
          name: businessName || username,
          email: email,
          password: hashedPassword,
          phone: normalizedPhone,
          role: dbRole,
          userType: dbUserType,
          address: businessAddress,
          zipCode: pincode,
          bio: `Business Type: ${businessType || 'N/A'} | Category: ${category || 'N/A'} | Service: ${serviceName || 'N/A'}${documentType ? ` | Document: ${documentType}` : ''}`,
          verified: true,
          active: true,
        }
      });
      // Seller account created
    } else if (userType === 'employer') {
      // Creating employer account
      dbUserType = 'EMPLOYER';
      dbRole = 'USER';

      newUser = await db.user.create({
        data: {
          name: fullName,
          email: email,
          password: hashedPassword,
          phone: normalizedPhone,
          role: dbRole,
          userType: dbUserType,
          address: companyAddress,
          zipCode: pincode,
          bio: `Company: ${companyName || 'N/A'} | Employees: ${employeeCount || 'N/A'} | Designation: ${designation || 'N/A'} | Account Type: ${accountType || 'company'} | Hiring For: ${hiringFor || 'company'}`,
          verified: true,
          active: true,
        }
      });
      // Employer account created
    } else {
      // Invalid user type
      return NextResponse.json({
        success: false,
        message: 'Invalid user type. Must be buyer, seller, or employer'
      }, { status: 400 });
    }

    // Determine redirect URL based on user type
    let redirectUrl = '/buyer/dashboard'; // default

    if (dbUserType === 'BUYER') {
      redirectUrl = '/buyer/dashboard';
    } else if (dbUserType === 'SELLER') {
      redirectUrl = '/vendor/dashboard';
    } else if (dbUserType === 'EMPLOYER') {
      redirectUrl = '/company/dashboard';
    }

    // Check if newUser was created (TypeScript safety check)
    if (!newUser) {
      console.log('❌ Failed to create user');
      return NextResponse.json({
        success: false,
        message: 'Failed to create user account'
      }, { status: 500 });
    }

    // Generate JWT token to automatically log in the user
    const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('NEXTAUTH_SECRET or JWT_SECRET must be configured');
    }

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        userType: newUser.userType
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('🔑 JWT token generated for auto-login');

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = newUser;

    console.log('🎉 Registration successful! Auto-login enabled. Redirecting to:', redirectUrl);

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful! Logging you in...',
      user: userWithoutPassword,
      token,
      redirectUrl
    }, { status: 201 });

    // Set cookie with proper configuration (same as login)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    console.log('🍪 Cookie set - user is now logged in');

    return response;

  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
