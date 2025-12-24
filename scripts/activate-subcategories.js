const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function activateAllSubcategories() {
  console.log('🔧 Activating all subcategories...\n');

  try {
    // Update all subcategories to be active
    const result = await prisma.subCategory.updateMany({
      where: {
        active: false
      },
      data: {
        active: true
      }
    });

    console.log(`✅ Activated ${result.count} subcategories!\n`);

    // Show updated count
    const totalSubs = await prisma.subCategory.count();
    const activeSubs = await prisma.subCategory.count({ where: { active: true } });

    console.log('📊 Current Status:');
    console.log(`   Total Subcategories: ${totalSubs}`);
    console.log(`   Active Subcategories: ${activeSubs}`);
    console.log(`   Inactive Subcategories: ${totalSubs - activeSubs}\n`);

    console.log('🎉 Done! All subcategories are now active and will show in dropdowns.\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

activateAllSubcategories();
