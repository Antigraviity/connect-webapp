const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@connectapp.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@connectapp.com',
      password: adminPassword,
      role: 'ADMIN',
      verified: true,
      active: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // ================================
  // CREATE CATEGORIES WITH SUBCATEGORIES
  // ================================
  
  const categoriesData = [
    {
      id: 'cat-beauty-wellness',
      name: 'Beauty & Wellness',
      slug: 'beauty-wellness',
      description: 'Beauty and wellness services at home',
      icon: '💆',
      featured: true,
      order: 1,
      subCategories: [
        { id: 'sub-salon', name: 'Salon at Home', slug: 'salon' },
        { id: 'sub-spa', name: 'Spa & Massage', slug: 'spa' },
        { id: 'sub-haircut', name: 'Haircut & Styling', slug: 'haircut' },
        { id: 'sub-makeup', name: 'Bridal Makeup', slug: 'makeup' },
        { id: 'sub-nailart', name: 'Nail Art & Manicure', slug: 'nail-art' },
        { id: 'sub-facial', name: 'Facial & Skincare', slug: 'facial' },
      ]
    },
    {
      id: 'cat-health-medical',
      name: 'Health & Medical',
      slug: 'health-medical',
      description: 'Healthcare services at home',
      icon: '🏥',
      featured: true,
      order: 2,
      subCategories: [
        { id: 'sub-doctor', name: 'Doctor Consultation', slug: 'doctor-consultation' },
        { id: 'sub-nurse', name: 'Nursing Care', slug: 'nursing-care' },
        { id: 'sub-physio', name: 'Physiotherapy', slug: 'physiotherapy' },
        { id: 'sub-lab-test', name: 'Lab Tests at Home', slug: 'lab-test' },
        { id: 'sub-vaccination', name: 'Vaccination', slug: 'vaccination' },
      ]
    },
    {
      id: 'cat-home-services',
      name: 'Home Services',
      slug: 'home-services',
      description: 'Professional home maintenance and repair services',
      icon: '🏠',
      featured: true,
      order: 3,
      subCategories: [
        { id: 'sub-ac-repair', name: 'AC Repair & Service', slug: 'ac-repair' },
        { id: 'sub-plumbing', name: 'Plumbing', slug: 'plumbing' },
        { id: 'sub-electrical', name: 'Electrical Work', slug: 'electrical' },
        { id: 'sub-painting', name: 'Painting', slug: 'painting' },
        { id: 'sub-carpentry', name: 'Carpentry', slug: 'carpentry' },
        { id: 'sub-cleaning', name: 'Home Cleaning', slug: 'cleaning' },
        { id: 'sub-pest-control', name: 'Pest Control', slug: 'pest-control' },
      ]
    },
    {
      id: 'cat-automotive',
      name: 'Automotive',
      slug: 'automotive',
      description: 'Vehicle maintenance and repair services',
      icon: '🚗',
      featured: true,
      order: 4,
      subCategories: [
        { id: 'sub-car-wash', name: 'Car Wash & Detailing', slug: 'car-wash' },
        { id: 'sub-car-repair', name: 'Car Repair', slug: 'car-repair' },
        { id: 'sub-bike-service', name: 'Bike Service', slug: 'bike-service' },
        { id: 'sub-tyre-service', name: 'Tyre Services', slug: 'tyre-service' },
        { id: 'sub-battery', name: 'Battery Replacement', slug: 'battery' },
      ]
    },
    {
      id: 'cat-food-catering',
      name: 'Food & Catering',
      slug: 'food-catering',
      description: 'Catering and food services for events',
      icon: '🍽️',
      featured: false,
      order: 5,
      subCategories: [
        { id: 'sub-wedding-catering', name: 'Wedding Catering', slug: 'wedding-catering' },
        { id: 'sub-party-catering', name: 'Party Catering', slug: 'party-catering' },
        { id: 'sub-corporate-catering', name: 'Corporate Catering', slug: 'corporate-catering' },
        { id: 'sub-tiffin', name: 'Tiffin Service', slug: 'tiffin' },
        { id: 'sub-cake', name: 'Cake & Bakery', slug: 'cake' },
      ]
    },
    {
      id: 'cat-street-foods',
      name: 'Street Foods',
      slug: 'street-foods',
      description: 'Popular street food vendors and stalls',
      icon: '🌮',
      featured: false,
      order: 6,
      subCategories: [
        { id: 'sub-chaat', name: 'Chaat & Snacks', slug: 'chaat' },
        { id: 'sub-momos', name: 'Momos', slug: 'momos' },
        { id: 'sub-rolls', name: 'Rolls & Wraps', slug: 'rolls' },
        { id: 'sub-pav-bhaji', name: 'Pav Bhaji', slug: 'pav-bhaji' },
        { id: 'sub-dosa', name: 'Dosa & Idli', slug: 'dosa' },
        { id: 'sub-juice', name: 'Fresh Juice', slug: 'juice' },
      ]
    },
  ];

  console.log('🗂️  Creating categories and subcategories...');
  
  for (const categoryData of categoriesData) {
    const { subCategories, ...categoryInfo } = categoryData;
    
    // Create/update category
    const category = await prisma.category.upsert({
      where: { id: categoryData.id },
      update: {
        name: categoryInfo.name,
        slug: categoryInfo.slug,
        description: categoryInfo.description,
        icon: categoryInfo.icon,
        featured: categoryInfo.featured,
        order: categoryInfo.order,
        active: true,
      },
      create: {
        id: categoryInfo.id,
        name: categoryInfo.name,
        slug: categoryInfo.slug,
        description: categoryInfo.description,
        icon: categoryInfo.icon,
        featured: categoryInfo.featured,
        order: categoryInfo.order,
        active: true,
      },
    });
    
    console.log(`  ✅ Category: ${category.name}`);
    
    // Create subcategories
    for (const subCat of subCategories) {
      await prisma.subCategory.upsert({
        where: { id: subCat.id },
        update: {
          name: subCat.name,
          slug: subCat.slug,
          active: true,
        },
        create: {
          id: subCat.id,
          name: subCat.name,
          slug: subCat.slug,
          categoryId: category.id,
          active: true,
        },
      });
      console.log(`    ✅ SubCategory: ${subCat.name}`);
    }
  }

  console.log(`✅ Created ${categoriesData.length} categories with subcategories`);

  // Create sample seller
  const sellerPassword = await bcrypt.hash('seller123', 10);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@connectapp.com' },
    update: {},
    create: {
      name: 'John Seller',
      email: 'seller@connectapp.com',
      password: sellerPassword,
      role: 'SELLER',
      phone: '+1234567890',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      verified: true,
      active: true,
    },
  });
  console.log('✅ Sample seller created:', seller.email);

  // Create sample user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@connectapp.com' },
    update: {},
    create: {
      name: 'Jane User',
      email: 'user@connectapp.com',
      password: userPassword,
      role: 'USER',
      phone: '+0987654321',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      verified: true,
      active: true,
    },
  });
  console.log('✅ Sample user created:', user.email);

  // Create site settings
  await prisma.siteSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'ConnectApp Marketplace',
      siteDescription: 'Your trusted platform for service providers and customers',
      contactEmail: 'support@connectapp.com',
      contactPhone: '+1234567890',
      platformFee: 10,
      taxRate: 0,
      maintenanceMode: false,
      userRegistration: true,
      sellerRegistration: true,
    },
  });
  console.log('✅ Site settings created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@connectapp.com / admin123');
  console.log('Seller: seller@connectapp.com / seller123');
  console.log('User: user@connectapp.com / user123');
  
  console.log('\n📊 Categories Summary:');
  console.log('- Beauty & Wellness (6 subcategories)');
  console.log('- Health & Medical (5 subcategories)');
  console.log('- Home Services (7 subcategories)');
  console.log('- Automotive (5 subcategories)');
  console.log('- Food & Catering (5 subcategories)');
  console.log('- Street Foods (6 subcategories)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
