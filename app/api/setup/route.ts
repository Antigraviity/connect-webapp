import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';

// Setup endpoint to configure category types
// Run once to set PRODUCT vs SERVICE type for categories
export const GET = requireRole(['ADMIN'])(async (request: NextRequest) => {
  try {
    // Define which categories are PRODUCT type
    const productCategories = [
      'food-catering',
      'food-&-catering',
      'street-foods',
      'street-food',
      'groceries',
      'vegetables',
      'fruits',
      'snacks',
      'bakery',
      'dairy',
      'beverages',
      'electronics',
      'clothing',
      'fashion',
      'home-decor',
      'furniture',
      'books',
      'toys',
      'sports',
      'health-products',
    ];

    // Update categories to set type based on slug
    const allCategories = await db.category.findMany();

    const updates = [];
    for (const category of allCategories) {
      const isProduct = productCategories.some(slug =>
        category.slug.toLowerCase().includes(slug.replace('-', '')) ||
        slug.includes(category.slug.toLowerCase().replace('-', ''))
      );

      // Check if name contains product-related keywords
      const productKeywords = ['food', 'grocery', 'vegetable', 'fruit', 'snack', 'bakery', 'dairy', 'beverage', 'electronic', 'cloth', 'fashion', 'furniture', 'book', 'toy', 'sport'];
      const nameIsProduct = productKeywords.some(keyword =>
        category.name.toLowerCase().includes(keyword)
      );

      const type = (isProduct || nameIsProduct) ? 'PRODUCT' : 'SERVICE';

      updates.push({
        id: category.id,
        name: category.name,
        slug: category.slug,
        currentType: (category as any).type || 'not set',
        newType: type,
      });

      // Update the category
      await db.category.update({
        where: { id: category.id },
        data: { type }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Category types updated',
      updates,
    }, { status: 200 });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Setup failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});
