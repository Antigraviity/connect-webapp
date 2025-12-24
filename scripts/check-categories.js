const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  console.log('🔍 Checking your categories and sub-categories...\n');

  try {
    // Get all categories with their sub-categories
    const categories = await prisma.category.findMany({
      include: {
        subCategories: {
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            subCategories: true,
            services: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`Found ${categories.length} categories\n`);
    console.log(`${'='.repeat(70)}\n`);

    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
      console.log(`   ID: ${category.id}`);
      console.log(`   Slug: ${category.slug}`);
      console.log(`   Type: ${category.type}`);
      console.log(`   Sub-categories: ${category._count.subCategories}`);
      console.log(`   Services: ${category._count.services}`);

      if (category.subCategories.length > 0) {
        console.log(`   \n   Sub-categories:`);
        category.subCategories.forEach((sub, subIndex) => {
          console.log(`      ${subIndex + 1}. ${sub.name} (${sub.slug}) - ${sub.active ? 'Active' : 'Inactive'}`);
        });
      } else {
        console.log(`   ⚠️  NO SUB-CATEGORIES - Run seed script to add them!`);
      }
      console.log('');
    });

    console.log(`${'='.repeat(70)}\n`);

    // Summary
    const totalSubCategories = await prisma.subCategory.count();
    const categoriesWithSubs = categories.filter(c => c._count.subCategories > 0).length;
    const categoriesWithoutSubs = categories.length - categoriesWithSubs;

    console.log('📊 Summary:');
    console.log(`   Total Categories: ${categories.length}`);
    console.log(`   Categories with sub-categories: ${categoriesWithSubs}`);
    console.log(`   Categories WITHOUT sub-categories: ${categoriesWithoutSubs}`);
    console.log(`   Total Sub-categories: ${totalSubCategories}\n`);

    if (categoriesWithoutSubs > 0) {
      console.log('💡 Tip: Run the seed script to add sub-categories:');
      console.log('   node scripts/seed-subcategories.js\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
