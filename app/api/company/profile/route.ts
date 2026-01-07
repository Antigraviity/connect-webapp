import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch company profile
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const employerId = searchParams.get('employerId');

        if (!employerId) {
            return NextResponse.json({
                success: false,
                message: 'Employer ID is required'
            }, { status: 400 });
        }

        const company = await db.user.findUnique({
            where: { id: employerId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                bio: true,
                address: true,
                industry: true,
                companySize: true,
                linkedin: true,
                website: true,
                preferences: true,
            }
        });

        if (!company) {
            return NextResponse.json({
                success: false,
                message: 'Company not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: company
        });

    } catch (error) {
        console.error('Fetch company profile error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch company profile',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// PUT - Update company profile
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            employerId,
            name,
            phone,
            bio,
            image,
            address,
            industry,
            companySize,
            linkedin,
            website,
            preferences
        } = body;

        if (!employerId) {
            return NextResponse.json({
                success: false,
                message: 'Employer ID is required'
            }, { status: 400 });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) {
            if (phone && !/^\d{10}$/.test(phone)) {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid phone number. Must be 10 digits.'
                }, { status: 400 });
            }
            updateData.phone = phone ? `+91${phone}` : phone;
        }
        if (bio !== undefined) updateData.bio = bio;
        if (image !== undefined) updateData.image = image;
        if (address !== undefined) updateData.address = address;
        if (industry !== undefined) updateData.industry = industry;
        if (companySize !== undefined) updateData.companySize = companySize;
        if (linkedin !== undefined) updateData.linkedin = linkedin;
        if (website !== undefined) updateData.website = website;
        if (preferences !== undefined) updateData.preferences = preferences;

        const updatedCompany = await db.user.update({
            where: { id: employerId },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedCompany
        });

    } catch (error) {
        console.error('Update company profile error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update company profile',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
