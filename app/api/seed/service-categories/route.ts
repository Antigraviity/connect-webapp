import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// POST - Seed service categories and sub-categories
export async function POST(request: NextRequest) {
    try {
        const serviceCategories = [
            {
                name: 'Salon & Spa',
                slug: 'salon-spa',
                description: 'Beauty services, haircut, massage, and spa treatments',
                icon: '💇‍♀️',
                type: 'SERVICE',
                featured: true,
                order: 1,
                subCategories: [
                    { name: 'Haircut & Styling', slug: 'haircut-styling', icon: '✂️' },
                    { name: 'Facial & Cleanup', slug: 'facial-cleanup', icon: '💆‍♀️' },
                    { name: 'Massage Therapy', slug: 'massage-therapy', icon: '💆' },
                    { name: 'Manicure & Pedicure', slug: 'manicure-pedicure', icon: '💅' },
                    { name: 'Makeup Services', slug: 'makeup-services', icon: '💄' },
                    { name: 'Hair Coloring', slug: 'hair-coloring', icon: '🖌️' },
                ]
            },
            {
                name: 'AC & Appliance Repair',
                slug: 'ac-appliance-repair',
                description: 'Repair and maintenance for AC, fridge, washing machine',
                icon: '🔧',
                type: 'SERVICE',
                featured: true,
                order: 2,
                subCategories: [
                    { name: 'AC Service & Repair', slug: 'ac-service-repair', icon: '❄️' },
                    { name: 'Washing Machine Repair', slug: 'washing-machine-repair', icon: '🧺' },
                    { name: 'Refrigerator Repair', slug: 'refrigerator-repair', icon: '🧊' },
                    { name: 'Microwave Repair', slug: 'microwave-repair', icon: '♨️' },
                    { name: 'TV Repair', slug: 'tv-repair', icon: '📺' },
                    { name: 'Water Purifier Repair', slug: 'water-purifier-repair', icon: '💧' },
                ]
            },
            {
                name: 'Cleaning & Pest Control',
                slug: 'cleaning-pest-control',
                description: 'Home cleaning, deep cleaning, and pest control services',
                icon: '🧹',
                type: 'SERVICE',
                featured: true,
                order: 3,
                subCategories: [
                    { name: 'Full Home Cleaning', slug: 'full-home-cleaning', icon: '🏠' },
                    { name: 'Sofa & Carpet Cleaning', slug: 'sofa-carpet-cleaning', icon: '🛋️' },
                    { name: 'Kitchen & Bathroom Cleaning', slug: 'kitchen-bathroom-cleaning', icon: '🚽' },
                    { name: 'Cockroach Control', slug: 'cockroach-control', icon: '🪳' },
                    { name: 'Termite Control', slug: 'termite-control', icon: '🐜' },
                    { name: 'Disinfection Services', slug: 'disinfection-services', icon: '🦠' },
                ]
            },
            {
                name: 'Plumbing & Electrical',
                slug: 'plumbing-electrical',
                description: 'Expert plumbers and electricians for home repairs',
                icon: '⚡',
                type: 'SERVICE',
                featured: true,
                order: 4,
                subCategories: [
                    { name: 'Electrician', slug: 'electrician', icon: '💡' },
                    { name: 'Plumber', slug: 'plumber', icon: '🔧' },
                    { name: 'Inverter Service', slug: 'inverter-service', icon: '🔋' },
                    { name: 'Water Motor Repair', slug: 'water-motor-repair', icon: '⚙️' },
                    { name: 'Geyser Repair', slug: 'geyser-repair', icon: '🔥' },
                ]
            },
            {
                name: 'Painting & Renovation',
                slug: 'painting-renovation',
                description: 'Home painting, waterproofing, and renovation services',
                icon: '🎨',
                type: 'SERVICE',
                featured: false,
                order: 5,
                subCategories: [
                    { name: 'Full Home Painting', slug: 'full-home-painting', icon: '🖌️' },
                    { name: 'Waterproofing', slug: 'waterproofing', icon: '🧱' },
                    { name: 'Wall Putty & Texture', slug: 'wall-putty-texture', icon: '🧱' },
                    { name: 'False Ceiling', slug: 'false-ceiling', icon: '🏗️' },
                    { name: 'Tiling Work', slug: 'tiling-work', icon: '🟧' },
                ]
            },
            {
                name: 'Medical & Healthcare',
                slug: 'medical-healthcare',
                description: 'Doctor consultation, nursing, and healthcare at home',
                icon: '🩺',
                type: 'SERVICE',
                featured: false,
                order: 6,
                subCategories: [
                    { name: 'Nursing at Home', slug: 'nursing-at-home', icon: '👩‍⚕️' },
                    { name: 'Physiotherapy', slug: 'physiotherapy', icon: '🤸' },
                    { name: 'Doctor Consultation', slug: 'doctor-consultation', icon: '👨‍⚕️' },
                    { name: 'Lab Tests at Home', slug: 'lab-tests-home', icon: '🩸' },
                    { name: 'Elderly Care', slug: 'elderly-care', icon: '👴' },
                ]
            },
            {
                name: 'Car & Bike Care',
                slug: 'car-bike-care',
                description: 'Vehicle servicing, washing, and repair',
                icon: '🚗',
                type: 'SERVICE',
                featured: false,
                order: 7,
                subCategories: [
                    { name: 'Car Wash & Cleaning', slug: 'car-wash-cleaning', icon: '🚿' },
                    { name: 'Car Detailing & Polishing', slug: 'car-detailing', icon: '✨' },
                    { name: 'Bike Service', slug: 'bike-service', icon: '🏍️' },
                    { name: 'Tire Puncture Repair', slug: 'tire-puncture', icon: '🍩' },
                    { name: 'Car Repair & Service', slug: 'car-repair', icon: '🔧' },
                ]
            },
            {
                name: 'Wedding & Events',
                slug: 'wedding-events',
                description: 'Event planning, catering, decoration, and photography',
                icon: '🎉',
                type: 'SERVICE',
                featured: true,
                order: 8,
                subCategories: [
                    { name: 'Wedding Photographer', slug: 'wedding-photographer', icon: '📸' },
                    { name: 'Event Decorator', slug: 'event-decorator', icon: '🎈' },
                    { name: 'Caterer', slug: 'caterer', icon: '🍽️' },
                    { name: 'DJ & Sound', slug: 'dj-sound', icon: '🎵' },
                    { name: 'Makeup Artist', slug: 'event-makeup', icon: '💄' },
                    { name: 'Event Planner', slug: 'event-planner', icon: '📋' },
                ]
            },
            {
                name: 'IT & Digital Services',
                slug: 'it-digital-services',
                description: 'Web design, development, and digital marketing',
                icon: '💻',
                type: 'SERVICE',
                featured: false,
                order: 9,
                subCategories: [
                    { name: 'Web Development', slug: 'web-development', icon: '🌐' },
                    { name: 'App Development', slug: 'app-development', icon: '📱' },
                    { name: 'SEO Services', slug: 'seo-services', icon: '🔍' },
                    { name: 'Logo & Graphic Design', slug: 'graphic-design', icon: '🎨' },
                    { name: 'Digital Marketing', slug: 'digital-marketing', icon: '📈' },
                ]
            },
            {
                name: 'Pet Care',
                slug: 'pet-care',
                description: 'Pet grooming, walking, and training',
                icon: '🐾',
                type: 'SERVICE',
                featured: false,
                order: 10,
                subCategories: [
                    { name: 'Dog Walking', slug: 'dog-walking', icon: '🐕' },
                    { name: 'Pet Grooming', slug: 'pet-grooming', icon: '✂️' },
                    { name: 'Vet Consultation', slug: 'vet-consultation', icon: '👨‍⚕️' },
                    { name: 'Pet Boarding', slug: 'pet-boarding', icon: '🏠' },
                    { name: 'Dog Training', slug: 'dog-training', icon: '🎾' },
                ]
            },
        ];

        const results = [];

        for (const category of serviceCategories) {
            try {
                let categoryId;
                const existing = await db.category.findUnique({
                    where: { slug: category.slug }
                });

                if (existing) {
                    // Update existing to be SERVICE type if needed
                    const updated = await db.category.update({
                        where: { slug: category.slug },
                        data: { type: 'SERVICE', icon: category.icon }
                    });
                    categoryId = updated.id;
                    results.push({ name: category.name, status: 'updated-category', id: updated.id });
                } else {
                    // Create new category
                    // Exclude subCategories from creation data, handling them separately
                    const { subCategories, ...categoryData } = category;
                    const created = await db.category.create({ data: categoryData });
                    categoryId = created.id;
                    results.push({ name: category.name, status: 'created-category', id: created.id });
                }

                // Process SubCategories
                if (category.subCategories && categoryId) {
                    for (const sub of category.subCategories) {
                        const subSlug = sub.slug;
                        const existingSub = await db.subCategory.findUnique({
                            where: { slug: subSlug }
                        });

                        if (existingSub) {
                            await db.subCategory.update({
                                where: { slug: subSlug },
                                data: {
                                    name: sub.name,
                                    icon: sub.icon,
                                    categoryId: categoryId
                                }
                            });
                            results.push({ name: `${category.name} -> ${sub.name}`, status: 'updated-subcategory' });
                        } else {
                            await db.subCategory.create({
                                data: {
                                    name: sub.name,
                                    slug: subSlug,
                                    icon: sub.icon,
                                    categoryId: categoryId
                                }
                            });
                            results.push({ name: `${category.name} -> ${sub.name}`, status: 'created-subcategory' });
                        }
                    }
                }

            } catch (error: any) {
                results.push({ name: category.name, status: 'error', error: error.message });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Service categories and sub-categories seeded successfully',
            results
        });

    } catch (error) {
        console.error('Seed service categories error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to seed service categories',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
