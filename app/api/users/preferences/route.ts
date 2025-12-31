import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET /api/users/preferences?userId=...
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
        }

        const user = await db.user.findUnique({
            where: { id: userId },
            select: { preferences: true }
        });

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, preferences: user.preferences || {} });
    } catch (error) {
        console.error("Error fetching preferences:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

// POST /api/users/preferences
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, preferences } = body;

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
        }

        const updatedUser = await db.user.update({
            where: { id: userId },
            data: { preferences: preferences }
        });

        return NextResponse.json({
            success: true,
            message: "Preferences updated successfully",
            preferences: updatedUser.preferences
        });
    } catch (error) {
        console.error("Error updating preferences:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
