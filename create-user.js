
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createUser() {
    try {
        const email = 'gokuls34492@gmail.com';
        const password = 'Gokuls@!23';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name: 'gk_emp', // Using a placeholder name based on previous errors
                email,
                password: hashedPassword,
                role: 'USER',
                userType: 'EMPLOYER', // Assuming employer based on context
                verified: true,
                active: true,
            },
        });

        console.log('User created successfully:', user);
    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createUser();
