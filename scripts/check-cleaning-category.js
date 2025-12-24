const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCleaningCategory() {
  console.log('🔍 Checking "Cleaning" category specifically...\n');

  try {
    // Find Cleaning category
    const cleaning = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { contains: 'Cleaning' } },
          { slug: { contains: 'cleaning' } }
        ]
      },
      include: {
        subCategories: true  // Get ALL subcategories (active and inactive)
      }
    });

    if (!cleaning) {
      console.log('❌ "Cleaning" category not found in database!\n');
      console.log('Available categories:');
      const allCategories = await prisma.category.findMany({
        select: { id: true, name: true, slug: true }
      });
      allCategories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.slug})`);
      });
      return;
    }

    console.log('✅ Found Cleaning category:');
    console.log(`   ID: ${cleaning.id}`);
    console.log(`   Name: ${cleaning.name}`);
    console.log(`   Slug: ${cleaning.slug}`);
    console.log(`   Active: ${cleaning.active}\n`);

    console.log(`📦 Subcategories: ${cleaning.subCategories.length} total\n`);

    if (cleaning.subCategories.length === 0) {
      console.log('⚠️  NO SUBCATEGORIES found for Cleaning category!');
      console.log('   This is why the dropdown shows "No sub-categories available"\n');
      console.log('💡 Solution: Add subcategories for this category:');
      console.log('   1. Use the admin panel "Manage Subcategories" button');
      console.log('   2. Or run the seed script to add default subcategories\n');
    } else {
      const activeSubs = cleaning.subCategories.filter(s => s.active);
      const inactiveSubs = cleaning.subCategories.filter(s => !s.active);

      console.log(`   Active: ${activeSubs.length}`);
      console.log(`   Inactive: ${inactiveSubs.length}\n`);

      if (activeSubs.length > 0) {
        console.log('✅ ACTIVE Subcategories:');
        activeSubs.forEach(sub => {
          console.log(`   - ${sub.name} (${sub.slug})`);
        });
        console.log('');
      }

      if (inactiveSubs.length > 0) {
        console.log('❌ INACTIVE Subcategories (won\'t show in dropdown):');
        inactiveSubs.forEach(sub => {
          console.log(`   - ${sub.name} (${sub.slug})`);
        });
        console.log('\n💡 To activate them, run:');
        console.log('   node scripts/activate-subcategories.js\n');
      }
    }

    // Check what the API would return
    console.log('🔌 What the API returns for this category:\n');
    const apiResult = await prisma.category.findUnique({
      where: { id: cleaning.id },
      include: {
        subCategories: {
          where: { active: true },  // This is what the API filters
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });

    console.log(`   Subcategories in API response: ${apiResult?.subCategories.length || 0}`);
    if (apiResult?.subCategories.length === 0) {
      console.log('   ⚠️  API returns ZERO subcategories for "Cleaning"');
      console.log('   This is why the dropdown is empty!\n');
    } else {
      console.log('   API would return:');
      apiResult?.subCategories.forEach(sub => {
        console.log(`   - ${sub.name}`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCleaningCategory();
