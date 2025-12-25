import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// POST - Seed product categories
export async function POST(request: NextRequest) {
  try {
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

    const results = [];

    for (const category of productCategories) {
      try {
        const existing = await db.category.findUnique({
          where: { slug: category.slug }
        });

        if (existing) {
          // Update existing to be PRODUCT type
          const updated = await db.category.update({
            where: { slug: category.slug },
            data: { type: 'PRODUCT' }
          });
          results.push({ name: category.name, status: 'updated', id: updated.id });
        } else {
          // Create new category
          const created = await db.category.create({ data: category });
          results.push({ name: category.name, status: 'created', id: created.id });
        }
      } catch (error: any) {
        results.push({ name: category.name, status: 'error', error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Product categories seeded successfully',
      results
    });

  } catch (error) {
    console.error('Seed product categories error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to seed product categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Check if product categories exist
export async function GET(request: NextRequest) {
  try {
    const productCategories = await db.category.findMany({
      where: { type: 'PRODUCT', active: true },
      select: { id: true, name: true, slug: true }
    });

    return NextResponse.json({
      success: true,
      count: productCategories.length,
      categories: productCategories
    });

  } catch (error) {
    console.error('Get product categories error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get product categories'
    }, { status: 500 });
  }
}
