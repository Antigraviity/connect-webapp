
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  {
    name: 'Food & Groceries',
    slug: 'food-groceries',
    icon: '🥦',
    type: 'PRODUCT',
    subCategories: [
      { name: 'Fresh Vegetables', slug: 'fresh-vegetables' },
      { name: 'Organic Fruits', slug: 'organic-fruits' },
      { name: 'Dairy Products', slug: 'dairy-products' },
      { name: 'Bakery Items', slug: 'bakery-items' },
      { name: 'Homemade Snacks', slug: 'homemade-snacks' },
      { name: 'Street Food', slug: 'street-food' },
      { name: 'Beverages', slug: 'beverages' },
    ]
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    icon: '📱',
    type: 'PRODUCT',
    subCategories: [
      { name: 'Mobiles & Tablets', slug: 'mobiles-tablets' },
      { name: 'Laptops & Computers', slug: 'laptops-computers' },
      { name: 'Cameras', slug: 'cameras' },
      { name: 'Accessories', slug: 'electronics-accessories' },
    ]
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    icon: '👕',
    type: 'PRODUCT',
    subCategories: [
      { name: 'Men\'s Clothing', slug: 'mens-clothing' },
      { name: 'Women\'s Clothing', slug: 'womens-clothing' },
      { name: 'Kids\' Wear', slug: 'kids-wear' },
      { name: 'Footwear', slug: 'footwear' },
    ]
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    icon: '🏠',
    type: 'PRODUCT',
    subCategories: [
      { name: 'Kitchenware', slug: 'kitchenware' },
      { name: 'Home Decor', slug: 'home-decor' },
      { name: 'Furniture', slug: 'furniture' },
    ]
  },
  {
    name: 'Beauty & Health',
    slug: 'beauty-health',
    icon: '💄',
    type: 'PRODUCT',
    subCategories: [
      { name: 'Skincare', slug: 'skincare' },
      { name: 'Haircare', slug: 'haircare' },
      { name: 'Wellness', slug: 'wellness' },
    ]
  }
];

async function main() {
  console.log('Seeding product categories...');

  for (const cat of categories) {
    // Upsert category
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        icon: cat.icon,
        type: cat.type,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        type: cat.type,
      }
    });

    console.log(`Upserted category: ${category.name}`);

    // Create subcategories
    if (cat.subCategories) {
      for (const sub of cat.subCategories) {
        await prisma.subCategory.upsert({
          where: { slug: sub.slug },
          update: {
            name: sub.name,
            categoryId: category.id
          },
          create: {
            name: sub.name,
            slug: sub.slug,
            categoryId: category.id
          }
        });
      }
      console.log(`  Added ${cat.subCategories.length} subcategories`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
