import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        let settings = await (db.siteSetting as any).findFirst();

        if (!settings) {
            // Create initial settings if none exist with all fields
            settings = await (db.siteSetting as any).create({
                data: {
                    siteName: "Forge India Connect",
                    siteDescription: "Connecting service providers and job seekers with customers and employers",
                    platformUrl: "https://forgeindia.connect",
                    timeZone: "Asia/Kolkata",
                    currency: "INR",
                    // Features
                    enableServiceBookings: true,
                    enableJobPostings: true,
                    userRegistration: true,
                    enableEmailVerification: false,
                    enablePushNotifications: false,
                    // Security
                    enableTwoFactor: false,
                    sessionTimeout: 30,
                    passwordMinLength: 8,
                    requireSpecialChar: false,
                    maxLoginAttempts: 5,
                    // Notifications
                    emailNotifications: true,
                    smsNotifications: false,
                    orderNotifications: true,
                    systemNotifications: true,
                },
            });
        }

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('=== Settings Update Request ===');
        console.log('Request body:', JSON.stringify(body, null, 2));

        // Remove read-only fields that Prisma/DB shouldn't update manually
        const { id, createdAt, updatedAt, ...updateData } = body;

        console.log('Update data:', JSON.stringify(updateData, null, 2));

        const existingSettings = await (db.siteSetting as any).findFirst();

        console.log('Existing settings found:', !!existingSettings);
        console.log('Existing settings ID:', existingSettings?.id);

        let settings;
        if (existingSettings) {
            settings = await (db.siteSetting as any).update({
                where: { id: existingSettings.id },
                data: updateData,
            });
        } else {
            settings = await (db.siteSetting as any).create({
                data: updateData,
            });
        }

        console.log('Settings updated successfully');

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error("=== Error updating settings ===");
        console.error("Error type:", error?.constructor?.name);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
        console.error("Full error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to update settings",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
