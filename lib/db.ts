import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Prisma Client configuration with connection pooling
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] // Reduced logging for better performance
      : ['error'],
    
    // Datasource configuration is handled via DATABASE_URL
    // Add ?connection_limit=20&pool_timeout=30 to your DATABASE_URL
  });
};

// Singleton pattern for Prisma Client to prevent connection exhaustion
export const db = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}

// Connection health check
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  const start = Date.now();
  
  try {
    await db.$queryRaw`SELECT 1`;
    return {
      healthy: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
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

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await disconnectDatabase();
  });
}

export default db;
