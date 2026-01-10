const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const EMAIL = 'unntangle20@gmail.com';
const PASSWORD = 'Gokuls@!23';

async function main() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: EMAIL },
        });

        const hashedPassword = await bcrypt.hash(PASSWORD, 10);

        if (user) {
            console.log(`User found: ${user.email}. Updating password...`);
            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });
            console.log('Password updated successfully.');
        } else {
            console.log(`User not found. Creating user: ${EMAIL}...`);
            await prisma.user.create({
                data: {
                    email: EMAIL,
                    password: hashedPassword,
                    name: 'Gokul S',
                    role: 'SELLER', // Assuming SELLER based on context
                    userType: 'SELLER',
                },
            });
            console.log('User created successfully.');
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
