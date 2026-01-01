import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const lat = searchParams.get('lat');
        const lon = searchParams.get('lon');

        if (!lat || !lon) {
            return NextResponse.json(
                { success: false, message: 'Latitude and longitude are required' },
                { status: 400 }
            );
        }

        // Call Nominatim API from server-side (no CORS issues)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
            {
                headers: {
                    'Accept-Language': 'en',
                    'User-Agent': 'ForgeIndiaConnect/1.0',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Nominatim API returned ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch address'
            },
            { status: 500 }
        );
    }
}
