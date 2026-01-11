/**
 * Seed Admin User Script
 * 
 * This script creates an admin user in the database with the existing credentials.
 * Run this once to migrate from hardcoded credentials to database storage.
 * 
 * Usage: node scripts/seed-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
    try {
        console.log('🔐 Starting admin user migration...');

        // Admin credentials (same as currently hardcoded)
        const ADMIN_EMAIL = 'forgeindiaconnect@gmail.com';
        const ADMIN_PASSWORD = 'ForgeIndia#12';
        const ADMIN_NAME = 'Super Admin';

        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: ADMIN_EMAIL }
        });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists:', ADMIN_EMAIL);

            // Update to ensure admin role is set
            if (existingAdmin.role !== 'ADMIN') {
                await prisma.user.update({
                    where: { email: ADMIN_EMAIL },
                    data: {
                        role: 'ADMIN',
                        verified: true,
                        active: true
                    }
                });
                console.log('✅ Updated existing user to admin role');
            } else {
                console.log('✅ Admin user is already configured correctly');
            }

            return;
        }

        // Hash password
        console.log('🔒 Hashing admin password...');
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        // Create admin user
        console.log('👤 Creating admin user...');
        const admin = await prisma.user.create({
            data: {
                name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                password: hashedPassword,
                role: 'ADMIN',
                verified: true,
                active: true,
                // Optional: Set userType if needed
                // userType: 'BUYER', // or null
            }
        });

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email:', admin.email);
        console.log('🆔 ID:', admin.id);
        console.log('👑 Role:', admin.role);
        console.log('');
        console.log('⚠️  IMPORTANT: You can now remove the hardcoded credentials from the code!');

    } catch (error) {
        console.error('❌ Error seeding admin user:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seed function
seedAdmin()
    .then(() => {
        console.log('🎉 Admin migration complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    });
