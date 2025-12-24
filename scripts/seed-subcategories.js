const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Define subcategories for each category
const subcategoriesData = [
  {
    categorySlug: 'cat-beauty-wellness',
    subcategories: [
      { id: 'sub-makeup', name: 'Makeup', slug: 'makeup' },
      { id: 'sub-hair-styling', name: 'Hair Styling', slug: 'hair-styling' },
      { id: 'sub-spa', name: 'Spa Services', slug: 'spa-services' },
      { id: 'sub-nail-art', name: 'Nail Art', slug: 'nail-art' },
      { id: 'sub-skin-care', name: 'Skin Care', slug: 'skin-care' },
      { id: 'sub-massage', name: 'Massage Therapy', slug: 'massage-therapy' },
      { id: 'sub-bridal-makeup', name: 'Bridal Makeup', slug: 'bridal-makeup' },
      { id: 'sub-waxing', name: 'Waxing', slug: 'waxing' },
    ]
  },
  {
    categorySlug: 'cat-salon-men',
    subcategories: [
      { id: 'sub-mens-haircut', name: 'Men\'s Haircut', slug: 'mens-haircut' },
      { id: 'sub-shaving', name: 'Shaving & Grooming', slug: 'shaving-grooming' },
      { id: 'sub-beard-styling', name: 'Beard Styling', slug: 'beard-styling' },
      { id: 'sub-mens-facial', name: 'Men\'s Facial', slug: 'mens-facial' },
      { id: 'sub-hair-coloring-men', name: 'Hair Coloring', slug: 'hair-coloring-men' },
      { id: 'sub-head-massage', name: 'Head Massage', slug: 'head-massage' },
    ]
  },
  {
    categorySlug: 'cat-salon-women',
    subcategories: [
      { id: 'sub-womens-haircut', name: 'Women\'s Haircut', slug: 'womens-haircut' },
      { id: 'sub-hair-color-women', name: 'Hair Coloring', slug: 'hair-coloring-women' },
      { id: 'sub-hair-treatment', name: 'Hair Treatment', slug: 'hair-treatment' },
      { id: 'sub-hair-styling-women', name: 'Hair Styling', slug: 'hair-styling-women' },
      { id: 'sub-facial-women', name: 'Facial', slug: 'facial-women' },
      { id: 'sub-threading', name: 'Threading', slug: 'threading' },
    ]
  },
  {
    categorySlug: 'cat-appliance-repair',
    subcategories: [
      { id: 'sub-ac-repair', name: 'AC Repair', slug: 'ac-repair' },
      { id: 'sub-washing-machine', name: 'Washing Machine Repair', slug: 'washing-machine-repair' },
      { id: 'sub-refrigerator', name: 'Refrigerator Repair', slug: 'refrigerator-repair' },
      { id: 'sub-tv-repair', name: 'TV Repair', slug: 'tv-repair' },
      { id: 'sub-microwave-repair', name: 'Microwave Repair', slug: 'microwave-repair' },
      { id: 'sub-water-purifier', name: 'Water Purifier Service', slug: 'water-purifier-service' },
      { id: 'sub-geyser-repair', name: 'Geyser Repair', slug: 'geyser-repair' },
    ]
  },
  {
    categorySlug: 'cat-electrician-plumber',
    subcategories: [
      { id: 'sub-plumbing', name: 'Plumbing Services', slug: 'plumbing-services' },
      { id: 'sub-electrical', name: 'Electrical Services', slug: 'electrical-services' },
      { id: 'sub-carpentry', name: 'Carpentry Services', slug: 'carpentry-services' },
      { id: 'sub-hvac', name: 'HVAC Services', slug: 'hvac-services' },
      { id: 'sub-painting', name: 'Painting Services', slug: 'painting-services' },
      { id: 'sub-waterproofing', name: 'Waterproofing', slug: 'waterproofing' },
    ]
  },
  {
    categorySlug: 'cat-home-services',
    subcategories: [
      { id: 'sub-house-cleaning', name: 'House Cleaning', slug: 'house-cleaning' },
      { id: 'sub-pest-control', name: 'Pest Control', slug: 'pest-control' },
      { id: 'sub-laundry', name: 'Laundry Services', slug: 'laundry-services' },
      { id: 'sub-gardening', name: 'Gardening', slug: 'gardening' },
      { id: 'sub-moving', name: 'Packers & Movers', slug: 'packers-movers' },
      { id: 'sub-interior-design', name: 'Interior Design', slug: 'interior-design' },
    ]
  },
  {
    categorySlug: 'cat-cleaning',
    subcategories: [
      { id: 'sub-deep-cleaning', name: 'Deep Cleaning', slug: 'deep-cleaning' },
      { id: 'sub-bathroom-cleaning', name: 'Bathroom Cleaning', slug: 'bathroom-cleaning' },
      { id: 'sub-kitchen-cleaning', name: 'Kitchen Cleaning', slug: 'kitchen-cleaning' },
      { id: 'sub-carpet-cleaning', name: 'Carpet Cleaning', slug: 'carpet-cleaning' },
      { id: 'sub-sofa-cleaning', name: 'Sofa Cleaning', slug: 'sofa-cleaning' },
      { id: 'sub-window-cleaning', name: 'Window Cleaning', slug: 'window-cleaning' },
    ]
  },
  {
    categorySlug: 'cat-health-medical',
    subcategories: [
      { id: 'sub-home-nursing', name: 'Home Nursing', slug: 'home-nursing' },
      { id: 'sub-physiotherapy', name: 'Physiotherapy', slug: 'physiotherapy' },
      { id: 'sub-lab-tests', name: 'Lab Tests at Home', slug: 'lab-tests-home' },
      { id: 'sub-medical-equipment', name: 'Medical Equipment Rental', slug: 'medical-equipment-rental' },
      { id: 'sub-elder-care', name: 'Elder Care', slug: 'elder-care' },
      { id: 'sub-baby-care', name: 'Baby Care', slug: 'baby-care' },
    ]
  },
  {
    categorySlug: 'cat-automotive',
    subcategories: [
      { id: 'sub-car-wash', name: 'Car Wash', slug: 'car-wash' },
      { id: 'sub-car-repair', name: 'Car Repair', slug: 'car-repair' },
      { id: 'sub-bike-service', name: 'Bike Service', slug: 'bike-service' },
      { id: 'sub-car-detailing', name: 'Car Detailing', slug: 'car-detailing' },
      { id: 'sub-car-inspection', name: 'Car Inspection', slug: 'car-inspection' },
      { id: 'sub-tire-service', name: 'Tire Service', slug: 'tire-service' },
    ]
  },
  {
    categorySlug: 'cat-bathroom-kitchen',
    subcategories: [
      { id: 'sub-bathroom-renovation', name: 'Bathroom Renovation', slug: 'bathroom-renovation' },
      { id: 'sub-kitchen-renovation', name: 'Kitchen Renovation', slug: 'kitchen-renovation' },
      { id: 'sub-tile-work', name: 'Tile Work', slug: 'tile-work' },
      { id: 'sub-plumbing-fixtures', name: 'Plumbing Fixtures', slug: 'plumbing-fixtures' },
      { id: 'sub-kitchen-appliance', name: 'Kitchen Appliance Installation', slug: 'kitchen-appliance' },
    ]
  },
  {
    categorySlug: 'cat-food-catering',
    subcategories: [
      { id: 'sub-catering', name: 'Catering Services', slug: 'catering-services' },
      { id: 'sub-home-chef', name: 'Home Chef', slug: 'home-chef' },
      { id: 'sub-tiffin-service', name: 'Tiffin Service', slug: 'tiffin-service' },
      { id: 'sub-cake-bakery', name: 'Cake & Bakery', slug: 'cake-bakery' },
    ]
  },
];

async function seedSubCategories() {
  console.log('🌱 Starting sub-category seeding...\n');

  try {
    let totalAdded = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const categoryData of subcategoriesData) {
      const { categorySlug, subcategories } = categoryData;

      // Find category by slug
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true, name: true }
      });

      if (!category) {
        console.log(`⚠️  Category not found: ${categorySlug}`);
        continue;
      }

      console.log(`\n📂 Processing: ${category.name}`);

      for (const sub of subcategories) {
        try {
          // Check if already exists by slug
          const existing = await prisma.subCategory.findUnique({
            where: { slug: sub.slug }
          });

          if (existing) {
            console.log(`   ⏭️  ${sub.name} - already exists`);
            totalSkipped++;
            continue;
          }

          // Create subcategory
          await prisma.subCategory.create({
            data: {
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              categoryId: category.id,
              active: true,
            }
          });

          console.log(`   ✅ ${sub.name} - added`);
          totalAdded++;
        } catch (error) {
          console.error(`   ❌ Error adding ${sub.name}:`, error.message);
          totalErrors++;
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('🎉 Seeding Complete!\n');
    console.log(`   ✅ Added: ${totalAdded} sub-categories`);
    console.log(`   ⏭️  Skipped: ${totalSkipped} (already exist)`);
    console.log(`   ❌ Errors: ${totalErrors}`);
    console.log(`${'='.repeat(60)}\n`);

    // Show summary by category
    console.log('📊 Summary by Category:\n');
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { subCategories: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    categories.forEach(cat => {
      if (cat._count.subCategories > 0) {
        console.log(`   ${cat.name}: ${cat._count.subCategories} sub-categories`);
      }
    });

    console.log('\n✅ All done! You can now use these sub-categories in your service creation form.\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedSubCategories();