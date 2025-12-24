const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSubcategories() {
  console.log('🔍 Checking subcategories in database...\n');

  try {
    // Get all categories with their subcategories
    const categories = await prisma.category.findMany({
      include: {
        subCategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            active: true,
            categoryId: true,
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`Found ${categories.length} categories\n`);
    console.log(`${'='.repeat(80)}\n`);

    let totalSubs = 0;
    let activeSubs = 0;
    let inactiveSubs = 0;

    categories.forEach((cat, index) => {
      const subsCount = cat.subCategories.length;
      const activeCount = cat.subCategories.filter(s => s.active).length;
      const inactiveCount = cat.subCategories.filter(s => !s.active).length;

      totalSubs += subsCount;
      activeSubs += activeCount;
      inactiveSubs += inactiveCount;

      console.log(`${index + 1}. ${cat.name} (${cat.id})`);
      console.log(`   Slug: ${cat.slug}`);
      console.log(`   Subcategories: ${subsCount} total (${activeCount} active, ${inactiveCount} inactive)\n`);

      if (cat.subCategories.length > 0) {
        cat.subCategories.forEach((sub, subIndex) => {
          const status = sub.active ? '✅ ACTIVE' : '❌ INACTIVE';
          console.log(`      ${subIndex + 1}. ${sub.name} - ${status}`);
          console.log(`         Slug: ${sub.slug}`);
        });
        console.log('');
      } else {
        console.log('      ⚠️  NO SUBCATEGORIES\n');
      }
    });

    console.log(`${'='.repeat(80)}\n`);
    console.log('📊 Summary:');
    console.log(`   Total Categories: ${categories.length}`);
    console.log(`   Total Subcategories: ${totalSubs}`);
    console.log(`   Active Subcategories: ${activeSubs}`);
    console.log(`   Inactive Subcategories: ${inactiveSubs}\n`);

    if (inactiveSubs > 0) {
      console.log('⚠️  WARNING: You have inactive subcategories!');
      console.log('   These will NOT show up in the dropdown.');
      console.log('   To fix, run this SQL:\n');
      console.log('   UPDATE SubCategory SET active = 1;\n');
    }

    // Check for orphaned subcategories
    const allSubs = await prisma.subCategory.findMany({
      select: {
        id: true,
        name: true,
        categoryId: true,
      }
    });

    const orphanedSubs = [];
    for (const sub of allSubs) {
      const catExists = await prisma.category.findUnique({
        where: { id: sub.categoryId }
      });
      if (!catExists) {
        orphanedSubs.push(sub);
      }
    }

    if (orphanedSubs.length > 0) {
      console.log(`\n⚠️  Found ${orphanedSubs.length} orphaned subcategories (no matching category):`);
      orphanedSubs.forEach(sub => {
        console.log(`   - ${sub.name} (categoryId: ${sub.categoryId})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubcategories();
