
import { Category } from './taxonomy.model';
import { connectDB } from '../../database/mongoose';
import mongoose from 'mongoose';

export async function seedCategories()
{
    const count = await Category.countDocuments();
    if (count > 0) return; // Already seeded

    // Example categories and subcategories
    const categories = [
        {
            name: 'Technology',
            slug: 'technology',
            description: 'All about tech',
            order: 1,
            isActive: true,
            subcategories: [
                { name: 'Programming', slug: 'programming', description: 'Coding and software', order: 1 },
                { name: 'AI & ML', slug: 'ai-ml', description: 'Artificial Intelligence and Machine Learning', order: 2 }
            ]
        },
        {
            name: 'Business',
            slug: 'business',
            description: 'Business and management',
            order: 2,
            isActive: true,
            subcategories: [
                { name: 'Entrepreneurship', slug: 'entrepreneurship', description: 'Startups and business creation', order: 1 },
                { name: 'Marketing', slug: 'marketing', description: 'Marketing strategies', order: 2 }
            ]
        }
    ];

    for (const cat of categories) {
        const parent = await Category.create({
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            order: cat.order,
            isActive: cat.isActive
        });
        if (cat.subcategories) {
            for (const sub of cat.subcategories) {
                await Category.create({
                    name: sub.name,
                    slug: sub.slug,
                    description: sub.description,
                    order: sub.order,
                    isActive: true,
                    parentId: parent._id
                });
            }
        }
    }
    console.log('Categories seeded');
}



async function main()
{
    try {
        await connectDB();
        await seedCategories();
        console.log('Seeding completed');
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

main();
