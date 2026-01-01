import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Define Validation Schemas
const baseSchema = z.object({
  userType: z.enum(['buyer', 'seller', 'employer']),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
});

const buyerSchema = baseSchema.extend({
  userType: z.literal('buyer'),
  fullName: z.string().optional(),
  buyerUsername: z.string().optional(),
  buyerEmail: z.string().email('Invalid email address'),
  buyerPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine(data => data.fullName || data.buyerUsername, {
  message: "Either Full Name or Username is required",
  path: ["fullName"]
});

const sellerSchema = baseSchema.extend({
  userType: z.literal('seller'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  category: z.string().optional(),
  serviceName: z.string().optional(),
  businessAddress: z.string().optional(),
  pincode: z.string().optional(),
  documentType: z.string().optional(),
});

const employerSchema = baseSchema.extend({
  userType: z.literal('employer'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  accountType: z.string().optional(),
  companyName: z.string().optional(),
  employeeCount: z.string().optional(),
  designation: z.string().optional(),
  hiringFor: z.string().optional(),
  companyAddress: z.string().optional(),
});

const registerSchema = z.union([
  buyerSchema,
  sellerSchema,
  employerSchema
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: result.error.errors
      }, { status: 400 });
    }

    const data = result.data as any; // Cast to any for easier access in conditional logic
    const { userType, phone } = data;

    console.log('🔥 Registration request received');

    // Normalize phone number
    const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    // Check if user already exists by phone first
    const phoneCheck = await db.user.findFirst({
      where: { phone: normalizedPhone }
    });

    if (phoneCheck) {
      console.log('⚠️ User with this phone already exists:', phoneCheck.id);

      // Check email match to decide if we should login or error
      let emailMatch = false;
      if (userType === 'buyer' && phoneCheck.email === data.buyerEmail) emailMatch = true;
      if (userType === 'seller' && phoneCheck.email === data.email) emailMatch = true;
      if (userType === 'employer' && phoneCheck.email === data.email) emailMatch = true;

      if (emailMatch) {
        // User already exists with same phone and email - log them in instead
        console.log('🔄 User already registered. Logging them in...');

        if (!process.env.NEXTAUTH_SECRET) {
          throw new Error('NEXTAUTH_SECRET is not defined');
        }

        // Generate JWT token
        const token = jwt.sign(
          {
            userId: phoneCheck.id,
            email: phoneCheck.email,
            role: phoneCheck.role,
            userType: phoneCheck.userType
          },
          process.env.NEXTAUTH_SECRET,
          { expiresIn: '7d' }
        );

        // Determine redirect URL
        let redirectUrl = '/buyer/dashboard';
        if (phoneCheck.userType === 'BUYER') redirectUrl = '/buyer/dashboard';
        else if (phoneCheck.userType === 'SELLER') redirectUrl = '/vendor/dashboard';
        else if (phoneCheck.userType === 'EMPLOYER') redirectUrl = '/company/dashboard';

        // @ts-ignore
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

    // Check for existing email (since phone check passed, this checks if email is taken by ANOTHER phone)
    let userEmail = '';
    if (userType === 'buyer') userEmail = data.buyerEmail;
    else userEmail = data.email;

    const existingUser = await db.user.findFirst({
      where: { email: userEmail }
    });

    if (existingUser) {
      console.log('❌ User already exists with email:', userEmail);
      return NextResponse.json({
        success: false,
        message: 'User with this email already exists'
      }, { status: 400 });
    }

    // Hash password
    let hashedPassword;
    if (userType === 'buyer') {
      hashedPassword = await bcrypt.hash(data.buyerPassword, 10);
    } else {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    console.log('🔐 Password hashed successfully');

    // Create user based on type
    let newUser;
    let dbUserType: 'BUYER' | 'SELLER' | 'EMPLOYER' = 'BUYER';
    let dbRole: 'USER' | 'SELLER' | 'ADMIN' = 'USER';

    if (userType === 'buyer') {
      console.log('👤 Creating buyer account...');
      dbUserType = 'BUYER';
      dbRole = 'USER';

      newUser = await db.user.create({
        data: {
          name: data.fullName || data.buyerUsername || 'Buyer',
          email: data.buyerEmail,
          password: hashedPassword,
          phone: normalizedPhone,
          role: dbRole,
          userType: dbUserType,
          verified: true,
          active: true,
        }
      });
    } else if (userType === 'seller') {
      console.log('🏪 Creating seller account...');
      dbUserType = 'SELLER';
      dbRole = 'SELLER';

      newUser = await db.user.create({
        data: {
          name: data.businessName || data.username,
          email: data.email,
          password: hashedPassword,
          phone: normalizedPhone,
          role: dbRole,
          userType: dbUserType,
          address: data.businessAddress,
          zipCode: data.pincode,
          bio: `Business Type: ${data.businessType || 'N/A'} | Category: ${data.category || 'N/A'} | Service: ${data.serviceName || 'N/A'}${data.documentType ? ` | Document: ${data.documentType}` : ''}`,
          verified: true,
          active: true,
        }
      });
    } else {
      console.log('💼 Creating employer account...');
      dbUserType = 'EMPLOYER';
      dbRole = 'USER';

      newUser = await db.user.create({
        data: {
          name: data.fullName,
          email: data.email,
          password: hashedPassword,
          phone: normalizedPhone,
          role: dbRole,
          userType: dbUserType,
          address: data.companyAddress,
          zipCode: data.pincode,
          bio: `Company: ${data.companyName || 'N/A'} | Employees: ${data.employeeCount || 'N/A'} | Designation: ${data.designation || 'N/A'} | Account Type: ${data.accountType || 'company'} | Hiring For: ${data.hiringFor || 'company'}`,
          verified: true,
          active: true,
        }
      });
    }

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    // Determine redirect URL
    let redirectUrl = '/buyer/dashboard';
    if (dbUserType === 'SELLER') redirectUrl = '/vendor/dashboard';
    else if (dbUserType === 'EMPLOYER') redirectUrl = '/company/dashboard';

    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error('NEXTAUTH_SECRET is not defined');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        userType: newUser.userType
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from user object
    // @ts-ignore
    const { password: _, ...userWithoutPassword } = newUser;

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful! Logging you in...',
      user: userWithoutPassword,
      token,
      redirectUrl
    }, { status: 201 });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      }, { status: 400 });
    }

    console.error('❌ Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
