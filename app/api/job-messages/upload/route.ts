import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload to Cloudinary
async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  filename: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `connect-platform/${folder}`,
        public_id: filename.replace(/\.[^.]+$/, ''),
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    ).end(buffer);
  });
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check - require valid JWT token
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    // Verify token
    try {
      const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT secret not configured');
      }
      const jwt = await import('jsonwebtoken');
      jwt.verify(token, jwtSecret);
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token'
      }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG, GIF, WEBP' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.name);
    const filename = `${timestamp}-${randomStr}${extension}`;

    try {
      // Upload to Cloudinary instead of local filesystem
      const result = await uploadToCloudinary(buffer, 'job-messages', filename);

      return NextResponse.json({
        success: true,
        file: {
          name: file.name,
          url: result.url,
          publicId: result.publicId,
          type: file.type,
          size: file.size,
          storage: 'cloudinary'
        },
      });
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to upload file', error: String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload file', error: String(error) },
      { status: 500 }
    );
  }
}
