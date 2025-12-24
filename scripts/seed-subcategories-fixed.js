const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSubcategories() {
  console.log('🌱 Starting sub-category seeding with dynamic category lookup...\n');

  // Define subcategories by category NAME (not hardcoded IDs)
  const subcategoriesByCategory = {
    'Beauty & Wellness': [
      { name: 'Makeup', slug: 'makeup' },
      { name: 'Hair Styling', slug: 'hair-styling' },
      { name: 'Spa Services', slug: 'spa-services' },
      { name: 'Nail Art', slug: 'nail-art' },
      { name: 'Skin Care', slug: 'skin-care' },
      { name: 'Massage Therapy', slug: 'massage-therapy' },
      { name: 'Bridal Makeup', slug: 'bridal-makeup' },
      { name: 'Waxing', slug: 'waxing' },
    ],
    'Salon for Men': [
      { name: "Men's Haircut", slug: 'mens-haircut' },
      { name: 'Shaving & Grooming', slug: 'shaving-grooming' },
      { name: 'Beard Styling', slug: 'beard-styling' },
      { name: "Men's Facial", slug: 'mens-facial' },
      { name: 'Hair Coloring', slug: 'hair-coloring-men' },
      { name: 'Head Massage', slug: 'head-massage' },
    ],
    'Salon for Women': [
      { name: "Women's Haircut", slug: 'womens-haircut' },
      { name: 'Hair Coloring', slug: 'hair-coloring-women' },
      { name: 'Hair Treatment', slug: 'hair-treatment' },
      { name: 'Hair Styling', slug: 'hair-styling-women' },
      { name: 'Facial', slug: 'facial' },
      { name: 'Threading', slug: 'threading' },
    ],
    'Appliance Repair & Service': [
      { name: 'AC Repair', slug: 'ac-repair' },
      { name: 'Washing Machine Repair', slug: 'washing-machine' },
      { name: 'Refrigerator Repair', slug: 'refrigerator' },
      { name: 'TV Repair', slug: 'tv-repair' },
      { name: 'Microwave Repair', slug: 'microwave' },
      { name: 'Water Purifier Service', slug: 'water-purifier' },
      { name: 'Geyser Repair', slug: 'geyser' },
    ],
    'Electrician, Plumber & Carpenters': [
      { name: 'Plumbing', slug: 'plumbing' },
      { name: 'Electrical Work', slug: 'electrical' },
      { name: 'Carpentry', slug: 'carpentry' },
      { name: 'HVAC Services', slug: 'hvac' },
      { name: 'Painting', slug: 'painting' },
      { name: 'Waterproofing', slug: 'waterproofing' },
    ],
    'Home Services': [
      { name: 'House Cleaning', slug: 'house-cleaning' },
      { name: 'Pest Control', slug: 'pest-control' },
      { name: 'Laundry & Dry Cleaning', slug: 'laundry' },
      { name: 'Gardening', slug: 'gardening' },
      { name: 'Packers & Movers', slug: 'packers-movers' },
      { name: 'Interior Design', slug: 'interior-design' },
    ],
    'Cleaning': [
      { name: 'Deep Cleaning', slug: 'deep-cleaning' },
      { name: 'Bathroom Cleaning', slug: 'bathroom-cleaning' },
      { name: 'Kitchen Cleaning', slug: 'kitchen-cleaning' },
      { name: 'Carpet Cleaning', slug: 'carpet-cleaning' },
      { name: 'Sofa Cleaning', slug: 'sofa-cleaning' },
      { name: 'Window Cleaning', slug: 'window-cleaning' },
    ],
    'Bathroom & Kitchen Cleaning': [
      { name: 'Bathroom Renovation', slug: 'bathroom-renovation' },
      { name: 'Kitchen Renovation', slug: 'kitchen-renovation' },
      { name: 'Tile Work', slug: 'tile-work' },
      { name: 'Plumbing Fixtures', slug: 'plumbing-fixtures' },
      { name: 'Kitchen Appliance Installation', slug: 'kitchen-appliance' },
    ],
    'Health & Medical': [
      { name: 'Home Nursing', slug: 'home-nursing' },
      { name: 'Physiotherapy', slug: 'physiotherapy' },
      { name: 'Lab Tests at Home', slug: 'lab-tests' },
      { name: 'Medical Equipment Rental', slug: 'medical-equipment' },
      { name: 'Elder Care', slug: 'elder-care' },
      { name: 'Baby Care', slug: 'baby-care' },
    ],
    'Automotive': [
      { name: 'Car Wash & Detailing', slug: 'car-wash' },
      { name: 'Car Repair', slug: 'car-repair' },
      { name: 'Bike Service', slug: 'bike-service' },
      { name: 'Car Detailing', slug: 'car-detailing' },
      { name: 'Car Inspection', slug: 'car-inspection' },
      { name: 'Tire Service', slug: 'tire-service' },
    ],
    'Food & Catering': [
      { name: 'Catering Services', slug: 'catering' },
      { name: 'Home Chef', slug: 'home-chef' },
      { name: 'Tiffin Service', slug: 'tiffin-service' },
      { name: 'Cake & Bakery', slug: 'cake-bakery' },
    ],
  };

  let totalAdded = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const summary = {};

  try {
    // First, get ALL categories from database
    const allCategories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true }
    });

    console.log(`📦 Found ${allCategories.length} categories in database:\n`);
    allCategories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat.id})`);
    });
    console.log('');

    // Process each category
    for (const [categoryName, subcategories] of Object.entries(subcategoriesByCategory)) {
      console.log(`\n🔍 Processing category: "${categoryName}"`);

      // Find category by NAME (case-insensitive, partial match)
      const category = allCategories.find(cat => 
        cat.name.toLowerCase().includes(categoryName.toLowerCase()) ||
        categoryName.toLowerCase().includes(cat.name.toLowerCase())
      );

      if (!category) {
        console.log(`   ⚠️  Category "${categoryName}" not found in database`);
        console.log(`   💡 Available categories: ${allCategories.map(c => c.name).join(', ')}\n`);
        continue;
      }

      console.log(`   ✅ Found matching category: "${category.name}" (ID: ${category.id})`);

      let added = 0;
      let skipped = 0;

      for (const sub of subcategories) {
        try {
          // Check if subcategory already exists
          const existing = await prisma.subCategory.findFirst({
            where: {
              categoryId: category.id,
              slug: sub.slug
            }
          });

          if (existing) {
            console.log(`      ⏭️  Skipped: ${sub.name} (already exists)`);
            skipped++;
          } else {
            await prisma.subCategory.create({
              data: {
                name: sub.name,
                slug: sub.slug,
                categoryId: category.id,
                active: true,
              }
            });
            console.log(`      ✅ Added: ${sub.name}`);
            added++;
          }
        } catch (error) {
          console.log(`      ❌ Error adding ${sub.name}:`, error.message);
          totalErrors++;
        }
      }

      totalAdded += added;
      totalSkipped += skipped;
      summary[category.name] = `${added} added, ${skipped} skipped`;
      console.log(`   📊 ${category.name}: ${added} added, ${skipped} skipped`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Seeding Complete!\n');
    console.log(`   ✅ Added: ${totalAdded} sub-categories`);
    console.log(`   ⏭️  Skipped: ${totalSkipped} (already exist)`);
    console.log(`   ❌ Errors: ${totalErrors}`);
    console.log('='.repeat(60));

    console.log('\n📊 Summary by Category:');
    for (const [catName, result] of Object.entries(summary)) {
      console.log(`   ${catName}: ${result}`);
    }

    console.log('\n✅ All done! You can now use these sub-categories in your service creation form.\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSubcategories();
