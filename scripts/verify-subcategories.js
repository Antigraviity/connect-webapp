const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifySubCategories() {
  console.log('✅ Verifying sub-categories setup...\n');

  try {
    // Count total sub-categories
    const totalSubs = await prisma.subCategory.count();
    console.log(`📊 Total sub-categories in database: ${totalSubs}\n`);

    if (totalSubs === 0) {
      console.log('❌ No sub-categories found!');
      console.log('💡 Run the seed script first:');
      console.log('   node scripts/seed-subcategories.js\n');
      return;
    }

    // Get categories with their sub-category counts
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { subCategories: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log('📋 Categories and their sub-category counts:\n');

    const categoriesWithSubs = [];
    const categoriesWithoutSubs = [];

    categories.forEach(cat => {
      const count = cat._count.subCategories;
      if (count > 0) {
        console.log(`   ✅ ${cat.name}: ${count} sub-categories`);
        categoriesWithSubs.push(cat);
      } else {
        console.log(`   ❌ ${cat.name}: No sub-categories`);
        categoriesWithoutSubs.push(cat);
      }
    });

    console.log(`\n${'='.repeat(70)}\n`);

    // Summary
    console.log('📊 Summary:');
    console.log(`   ✅ Categories WITH sub-categories: ${categoriesWithSubs.length}`);
    console.log(`   ❌ Categories WITHOUT sub-categories: ${categoriesWithoutSubs.length}`);
    console.log(`   📦 Total sub-categories: ${totalSubs}\n`);

    // Show which categories need sub-categories
    if (categoriesWithoutSubs.length > 0) {
      console.log('⚠️  These categories need sub-categories:');
      categoriesWithoutSubs.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.slug})`);
      });
      console.log('\n💡 Add them to seed-subcategories.js and run the script again.\n');
    }

    // Test: Try to find sub-categories for a specific category
    console.log('🧪 Test: Fetching sub-categories for first category...\n');
    
    const firstCatWithSubs = categoriesWithSubs[0];
    if (firstCatWithSubs) {
      const subs = await prisma.subCategory.findMany({
        where: { categoryId: firstCatWithSubs.id },
        take: 5
      });

      console.log(`   Category: ${firstCatWithSubs.name}`);
      console.log(`   Sub-categories found: ${subs.length}`);
      subs.forEach((sub, i) => {
        console.log(`      ${i + 1}. ${sub.name}`);
      });
      console.log('\n✅ Sub-categories are working correctly!\n');
    }

    // Final check
    if (totalSubs > 0 && categoriesWithSubs.length > 0) {
      console.log('🎉 SUCCESS! Your sub-categories are set up correctly.');
      console.log('   You can now create services and select sub-categories!\n');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySubCategories();
