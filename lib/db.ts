import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Singleton pattern for Prisma Client with optimized connection pool
export const db = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}

// Ensure connections are cleaned up properly
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await db.$disconnect();
  });
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    await db.$connect();
    console.log('✅ Database connected successfully');
    return { success: true, message: 'Database connected successfully' };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { 
      success: false, 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  try {
    await db.$disconnect();
    console.log('Database disconnected');
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
}

export default db;
