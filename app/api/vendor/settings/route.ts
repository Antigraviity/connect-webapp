import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';

// JSON file storage for vendor settings (until DB table is created)
const SETTINGS_FILE = path.join(process.cwd(), 'data', 'vendor-settings.json');

// Helper to read settings from file
function readVendorSettings(): Record<string, any> {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading vendor settings file:', error);
  }
  return {};
}

// Helper to write settings to file
function writeVendorSettings(settings: Record<string, any>): boolean {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing vendor settings file:', error);
    return false;
  }
}

// GET - Fetch vendor settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json({
        success: false,
        message: 'Vendor ID is required'
      }, { status: 400 });
    }

    // Get user from DB
    const user = await db.user.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        bio: true,
        verified: true,
        city: true,
        state: true,
        country: true,
        address: true,
        zipCode: true,
        createdAt: true,
        role: true,
        userType: true,
        wallet: true,
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Vendor not found'
      }, { status: 404 });
    }

    // Get extended settings from JSON file
    const allSettings = readVendorSettings();
    const vendorSettings = allSettings[vendorId] || {};

    // Build response with user data and vendor settings
    const response = {
      success: true,
      data: {
        profile: {
          id: user.id,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          image: user.image || null,
          bio: user.bio || '',
          verified: user.verified,
          website: vendorSettings.website || '',
          role: user.role,
          userType: user.userType,
          createdAt: user.createdAt,
          wallet: user.wallet || 0,
        },
        business: {
          businessName: vendorSettings.businessName || user.name || '',
          businessType: vendorSettings.businessType || 'Individual',
          serviceType: vendorSettings.serviceType || 'Service',
          gstNumber: vendorSettings.gstNumber || '',
          panNumber: vendorSettings.panNumber || '',
        },
        serviceDetails: {
          serviceCategory: vendorSettings.serviceCategory || '',
          serviceName: vendorSettings.serviceName || '',
        },
        documents: {
          idProof: vendorSettings.idProof || null,
          idProofStatus: vendorSettings.idProofStatus || 'Pending',
          businessDoc: vendorSettings.businessDoc || null,
          businessDocStatus: vendorSettings.businessDocStatus || 'Pending',
          addressProof: vendorSettings.addressProof || null,
          addressProofStatus: vendorSettings.addressProofStatus || 'Pending',
        },
        location: {
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          pincode: user.zipCode || '',
          country: user.country || 'India',
          serviceRadius: vendorSettings.serviceRadius || 10,
        },
        payment: {
          accountHolderName: vendorSettings.accountHolderName || '',
          accountNumber: vendorSettings.accountNumber || '',
          ifscCode: vendorSettings.ifscCode || '',
          bankName: vendorSettings.bankName || '',
          upiId: vendorSettings.upiId || '',
        },
        notifications: {
          emailOrders: vendorSettings.emailOrders ?? true,
          emailMessages: vendorSettings.emailMessages ?? true,
          emailReviews: vendorSettings.emailReviews ?? true,
          emailPromotions: vendorSettings.emailPromotions ?? false,
          smsOrders: vendorSettings.smsOrders ?? true,
          smsReminders: vendorSettings.smsReminders ?? true,
          pushOrders: vendorSettings.pushOrders ?? true,
          pushMessages: vendorSettings.pushMessages ?? true,
        },
        socialMedia: {
          instagram: vendorSettings.instagram || '',
          facebook: vendorSettings.facebook || '',
          twitter: vendorSettings.twitter || '',
          linkedin: vendorSettings.linkedin || '',
        },
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Fetch vendor settings error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update vendor settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId, section, data } = body;

    if (!vendorId) {
      return NextResponse.json({
        success: false,
        message: 'Vendor ID is required'
      }, { status: 400 });
    }

    // Fields that go to User table (core fields)
    const userUpdateData: any = {};
    
    if (section === 'profile') {
      if (data.name !== undefined) userUpdateData.name = data.name;
      if (data.phone !== undefined) userUpdateData.phone = data.phone;
      if (data.bio !== undefined) userUpdateData.bio = data.bio;
      if (data.image !== undefined) userUpdateData.image = data.image;
    }
    
    if (section === 'location') {
      if (data.address !== undefined) userUpdateData.address = data.address;
      if (data.city !== undefined) userUpdateData.city = data.city;
      if (data.state !== undefined) userUpdateData.state = data.state;
      if (data.country !== undefined) userUpdateData.country = data.country;
      if (data.pincode !== undefined) userUpdateData.zipCode = data.pincode;
    }

    // Update User table if there are fields to update
    if (Object.keys(userUpdateData).length > 0) {
      await db.user.update({
        where: { id: vendorId },
        data: userUpdateData
      });
    }

    // Update JSON file for extended settings
    const allSettings = readVendorSettings();
    const vendorSettings = allSettings[vendorId] || {};

    // Profile extras
    if (section === 'profile') {
      if (data.website !== undefined) vendorSettings.website = data.website;
      if (data.instagram !== undefined) vendorSettings.instagram = data.instagram;
      if (data.facebook !== undefined) vendorSettings.facebook = data.facebook;
      if (data.twitter !== undefined) vendorSettings.twitter = data.twitter;
      if (data.linkedin !== undefined) vendorSettings.linkedin = data.linkedin;
    }

    // Business info
    if (section === 'business') {
      if (data.businessName !== undefined) vendorSettings.businessName = data.businessName;
      if (data.businessType !== undefined) vendorSettings.businessType = data.businessType;
      if (data.serviceType !== undefined) vendorSettings.serviceType = data.serviceType;
      if (data.gstNumber !== undefined) vendorSettings.gstNumber = data.gstNumber;
      if (data.panNumber !== undefined) vendorSettings.panNumber = data.panNumber;
    }

    // Service details
    if (section === 'serviceDetails') {
      if (data.serviceCategory !== undefined) vendorSettings.serviceCategory = data.serviceCategory;
      if (data.serviceName !== undefined) vendorSettings.serviceName = data.serviceName;
    }

    // Documents
    if (section === 'documents') {
      if (data.idProof !== undefined) vendorSettings.idProof = data.idProof;
      if (data.businessDoc !== undefined) vendorSettings.businessDoc = data.businessDoc;
      if (data.addressProof !== undefined) vendorSettings.addressProof = data.addressProof;
    }

    // Location extras
    if (section === 'location') {
      if (data.serviceRadius !== undefined) vendorSettings.serviceRadius = parseInt(data.serviceRadius) || 10;
    }

    // Payment
    if (section === 'payment') {
      if (data.accountHolderName !== undefined) vendorSettings.accountHolderName = data.accountHolderName;
      if (data.accountNumber !== undefined) vendorSettings.accountNumber = data.accountNumber;
      if (data.ifscCode !== undefined) vendorSettings.ifscCode = data.ifscCode;
      if (data.bankName !== undefined) vendorSettings.bankName = data.bankName;
      if (data.upiId !== undefined) vendorSettings.upiId = data.upiId;
    }

    // Notifications
    if (section === 'notifications') {
      if (data.emailOrders !== undefined) vendorSettings.emailOrders = data.emailOrders;
      if (data.emailMessages !== undefined) vendorSettings.emailMessages = data.emailMessages;
      if (data.emailReviews !== undefined) vendorSettings.emailReviews = data.emailReviews;
      if (data.emailPromotions !== undefined) vendorSettings.emailPromotions = data.emailPromotions;
      if (data.smsOrders !== undefined) vendorSettings.smsOrders = data.smsOrders;
      if (data.smsReminders !== undefined) vendorSettings.smsReminders = data.smsReminders;
      if (data.pushOrders !== undefined) vendorSettings.pushOrders = data.pushOrders;
      if (data.pushMessages !== undefined) vendorSettings.pushMessages = data.pushMessages;
    }

    // Save to JSON file
    allSettings[vendorId] = vendorSettings;
    const saved = writeVendorSettings(allSettings);

    if (!saved) {
      return NextResponse.json({
        success: false,
        message: 'Failed to save settings'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Update vendor settings error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
