
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Fetching categories...');
        const allCategories = await prisma.category.findMany({
            select: { name: true, type: true, slug: true }
        });
        console.log('All Categories:', JSON.stringify(allCategories, null, 2));

        const productCategories = await prisma.category.findMany({
            where: { type: 'PRODUCT' },
            select: { name: true, type: true, slug: true }
        });
        console.log('Product Categories count:', productCategories.length);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
