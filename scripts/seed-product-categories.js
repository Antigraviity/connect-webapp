// Script to seed PRODUCT categories
// Run with: node scripts/seed-product-categories.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const productCategories = [
  {
    name: 'Fresh Vegetables',
    slug: 'fresh-vegetables',
    description: 'Farm-fresh vegetables delivered to your doorstep',
    icon: '🥬',
    type: 'PRODUCT',
    featured: true,
    order: 1,
  },
  {
    name: 'Fresh Fruits',
    slug: 'fresh-fruits',
    description: 'Seasonal and exotic fruits',
    icon: '🍎',
    type: 'PRODUCT',
    featured: true,
    order: 2,
  },
  {
    name: 'Dairy & Eggs',
    slug: 'dairy-eggs',
    description: 'Milk, cheese, eggs and dairy products',
    icon: '🥛',
    type: 'PRODUCT',
    featured: true,
    order: 3,
  },
  {
    name: 'Groceries',
    slug: 'groceries',
    description: 'Daily essentials and grocery items',
    icon: '🛒',
    type: 'PRODUCT',
    featured: true,
    order: 4,
  },
  {
    name: 'Bakery',
    slug: 'bakery',
    description: 'Fresh bread, cakes, and pastries',
    icon: '🍞',
    type: 'PRODUCT',
    featured: false,
    order: 5,
  },
  {
    name: 'Snacks & Beverages',
    slug: 'snacks-beverages',
    description: 'Chips, drinks, and ready-to-eat snacks',
    icon: '🥤',
    type: 'PRODUCT',
    featured: false,
    order: 6,
  },
  {
    name: 'Meat & Seafood',
    slug: 'meat-seafood',
    description: 'Fresh meat, fish, and seafood',
    icon: '🥩',
    type: 'PRODUCT',
    featured: false,
    order: 7,
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen-products',
    description: 'Kitchen appliances and home essentials',
    icon: '🏠',
    type: 'PRODUCT',
    featured: false,
    order: 8,
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Beauty and personal care products',
    icon: '🧴',
    type: 'PRODUCT',
    featured: false,
    order: 9,
  },
  {
    name: 'Organic Products',
    slug: 'organic-products',
    description: 'Certified organic and natural products',
    icon: '🌿',
    type: 'PRODUCT',
    featured: true,
    order: 10,
  },
];

async function main() {
  console.log('Seeding PRODUCT categories...');
  
  for (const category of productCategories) {
    try {
      const existing = await prisma.category.findUnique({
        where: { slug: category.slug }
      });
      
      if (existing) {
        console.log(`Category "${category.name}" already exists, updating type to PRODUCT...`);
        await prisma.category.update({
          where: { slug: category.slug },
          data: { type: 'PRODUCT' }
        });
      } else {
        await prisma.category.create({ data: category });
        console.log(`Created category: ${category.name}`);
      }
    } catch (error) {
      console.error(`Error with category ${category.name}:`, error.message);
    }
  }
  
  console.log('Done seeding PRODUCT categories!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
