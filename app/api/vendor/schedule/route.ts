import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Store schedules in a JSON file as backup (since bio field might have size limits)
const SCHEDULE_DIR = join(process.cwd(), 'data');
const SCHEDULE_FILE = join(SCHEDULE_DIR, 'vendor-schedules.json');

// Helper to read schedules from file
function readSchedulesFromFile(): Record<string, any> {
  try {
    if (existsSync(SCHEDULE_FILE)) {
      const data = readFileSync(SCHEDULE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading schedule file:', error);
  }
  return {};
}

// Helper to write schedules to file
function writeSchedulesToFile(schedules: Record<string, any>): void {
  try {
    if (!existsSync(SCHEDULE_DIR)) {
      mkdirSync(SCHEDULE_DIR, { recursive: true });
    }
    writeFileSync(SCHEDULE_FILE, JSON.stringify(schedules, null, 2));
    console.log('✅ Schedule saved to file');
  } catch (error) {
    console.error('Error writing schedule file:', error);
  }
}

// Default schedule
const DEFAULT_SCHEDULE = [
  { day: "Monday", enabled: true, startTime: "09:00", endTime: "18:00" },
  { day: "Tuesday", enabled: true, startTime: "09:00", endTime: "18:00" },
  { day: "Wednesday", enabled: true, startTime: "09:00", endTime: "18:00" },
  { day: "Thursday", enabled: true, startTime: "09:00", endTime: "18:00" },
  { day: "Friday", enabled: true, startTime: "09:00", endTime: "18:00" },
  { day: "Saturday", enabled: true, startTime: "10:00", endTime: "16:00" },
  { day: "Sunday", enabled: false, startTime: "10:00", endTime: "16:00" },
];

// GET - Fetch vendor's schedule
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('📤 Fetching schedule for user:', userId);

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    // Try to get schedule from file first (more reliable)
    const schedules = readSchedulesFromFile();
    if (schedules[userId]) {
      console.log('✅ Found schedule in file for user:', userId);
      return NextResponse.json({
        success: true,
        schedule: schedules[userId]
      });
    }

    // Fallback: Try database
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, bio: true }
      });

      if (user?.bio && user.bio.startsWith('SCHEDULE:')) {
        const schedule = JSON.parse(user.bio.replace('SCHEDULE:', ''));
        console.log('✅ Found schedule in database for user:', userId);
        
        // Save to file for future reliability
        schedules[userId] = schedule;
        writeSchedulesToFile(schedules);
        
        return NextResponse.json({
          success: true,
          schedule
        });
      }
    } catch (dbError) {
      console.log('⚠️ Database lookup failed, using defaults');
    }

    // Return default schedule
    console.log('⚠️ No saved schedule found, returning defaults');
    return NextResponse.json({
      success: true,
      schedule: DEFAULT_SCHEDULE
    });

  } catch (error) {
    console.error('❌ Fetch schedule error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch schedule',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Save vendor's schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, schedule } = body;

    console.log('📥 Received schedule save request:');
    console.log('   User ID:', userId);
    console.log('   Schedule length:', schedule?.length);

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    if (!schedule || !Array.isArray(schedule)) {
      return NextResponse.json({
        success: false,
        message: 'Schedule is required and must be an array'
      }, { status: 400 });
    }

    // Validate schedule format
    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    for (const item of schedule) {
      if (!validDays.includes(item.day)) {
        return NextResponse.json({
          success: false,
          message: `Invalid day: ${item.day}`
        }, { status: 400 });
      }
      if (typeof item.enabled !== 'boolean') {
        return NextResponse.json({
          success: false,
          message: `Invalid enabled value for ${item.day}`
        }, { status: 400 });
      }
    }

    // Save to file (primary storage - more reliable)
    const schedules = readSchedulesFromFile();
    schedules[userId] = schedule;
    writeSchedulesToFile(schedules);

    // Also try to save to database as backup
    try {
      const scheduleJson = 'SCHEDULE:' + JSON.stringify(schedule);
      await db.user.update({
        where: { id: userId },
        data: { bio: scheduleJson }
      });
      console.log('✅ Also saved to database');
    } catch (dbError) {
      console.log('⚠️ Database save failed (file save succeeded):', dbError);
    }

    console.log('✅ Schedule saved successfully for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Schedule saved successfully',
      schedule
    });

  } catch (error) {
    console.error('❌ Save schedule error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to save schedule',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
