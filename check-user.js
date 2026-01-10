
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    try {
        const email = 'gokuls34492@gmail.com';
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            console.log('User found:', user);
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error('Error checking user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
