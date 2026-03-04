const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...\n');

    // ─── Service Categories ──────────────────────────────────────
    const categories = [
        { name: 'Cooking', icon: '🍳', description: 'Personal chefs, meal prep, catering services' },
        { name: 'Cleaning', icon: '🧹', description: 'House cleaning, deep cleaning, laundry services' },
        { name: 'Childcare', icon: '👶', description: 'Babysitting, nannying, tutoring' },
        { name: 'Maintenance', icon: '🔧', description: 'Plumbing, electrical, general handyman services' },
    ];

    for (const cat of categories) {
        await prisma.serviceCategory.upsert({
            where: { name: cat.name },
            update: {},
            create: cat,
        });
    }
    console.log('✅ Service categories seeded');

    // ─── Admin User ──────────────────────────────────────────────
    const adminEmail = 'admin@homeease.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash('admin123', salt);

        await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                name: 'HomeEase Admin',
                role: 'ADMIN',
                isVerified: true,
            },
        });
        console.log('✅ Admin user created (admin@homeease.com / admin123)');
    } else {
        console.log('ℹ️  Admin user already exists');
    }

    // ─── Demo Users ──────────────────────────────────────────────
    const demoUsers = [
        { email: 'client@demo.com', name: 'Jane Client', role: 'CLIENT' },
        { email: 'provider@demo.com', name: 'Mark Provider', role: 'PROVIDER' },
        { email: 'landlord@demo.com', name: 'Sarah Landlord', role: 'LANDLORD' },
    ];

    for (const demoUser of demoUsers) {
        const exists = await prisma.user.findUnique({ where: { email: demoUser.email } });
        if (!exists) {
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash('demo123', salt);
            await prisma.user.create({
                data: { ...demoUser, passwordHash, isVerified: true },
            });
            console.log(`✅ Demo user created: ${demoUser.email} / demo123`);
        }
    }

    console.log('\n🎉 Seeding complete!\n');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
