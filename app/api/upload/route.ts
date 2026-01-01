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

import { requireAuth } from '@/lib/auth-middleware';

// POST - Upload file
export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Handle JSON body (base64 upload)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { base64, fileName, fileType, fileSize, folder = 'uploads' } = body;

      if (!base64 || !fileName) {
        return NextResponse.json({
          success: false,
          message: 'base64 and fileName are required'
        }, { status: 400 });
      }

      const buffer = Buffer.from(base64.split(',')[1] || base64, 'base64');
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const extension = fileName.split('.').pop() || 'jpg';
      const newFilename = `${timestamp}-${randomStr}.${extension}`;

      try {
        const result = await uploadToCloudinary(buffer, folder, newFilename);
        console.log('✅ Uploaded to Cloudinary:', result.url);
        return NextResponse.json({
          success: true,
          message: 'File uploaded successfully',
          file: {
            url: result.url,
            publicId: result.publicId,
            name: fileName,
            type: fileType,
            size: fileSize,
            storage: 'cloudinary'
          }
        }, { status: 201 });
      } catch (e) {
        console.error('Cloudinary upload failed:', e);
        return NextResponse.json({
          success: false,
          message: 'Failed to upload file',
          error: e instanceof Error ? e.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Handle FormData upload
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        message: 'File type not allowed. Allowed: images, PDF, Word, Excel, text files'
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(file.name) || getExtensionFromMime(file.type);
    const filename = `${timestamp}-${randomStr}${extension}`;

    try {
      const result = await uploadToCloudinary(buffer, folder, filename);
      console.log('✅ Uploaded to Cloudinary:', result.url);
      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully',
        file: {
          url: result.url,
          publicId: result.publicId,
          name: file.name,
          type: file.type,
          size: file.size,
          storage: 'cloudinary'
        }
      }, { status: 201 });
    } catch (e) {
      console.error('Cloudinary upload failed:', e);
      return NextResponse.json({
        success: false,
        message: 'Failed to upload file',
        error: e instanceof Error ? e.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to upload file',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});

// DELETE - Delete file from Cloudinary
export const DELETE = requireAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json({
        success: false,
        message: 'Public ID is required'
      }, { status: 400 });
    }

    await cloudinary.uploader.destroy(publicId);
    console.log('✅ Deleted from Cloudinary:', publicId);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete file',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});

function getExtensionFromMime(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'text/plain': '.txt',
  };
  return mimeToExt[mimeType] || '';
}
