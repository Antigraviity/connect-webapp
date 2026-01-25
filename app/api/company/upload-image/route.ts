import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST - Upload company profile image to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { base64, employerId } = body;

    if (!base64) {
      return NextResponse.json({
        success: false,
        message: 'No image data provided'
      }, { status: 400 });
    }

    if (!employerId) {
      return NextResponse.json({
        success: false,
        message: 'Employer ID is required'
      }, { status: 400 });
    }

    // Upload to Cloudinary
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload(
        base64,
        {
          folder: 'connect-platform/company-logos',
          public_id: `company-${employerId}-${Date.now()}`,
          resource_type: 'auto',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          }
        }
      );
    });

    console.log('✅ Company logo uploaded to Cloudinary:', result.secure_url);

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to upload image',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
