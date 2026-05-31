import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const existingUser = await prisma.user.findUnique({
        where: { username: "Moez_tn" }
    });

    if (existingUser) {
        console.log("Database already seeded");
        return;
    }

    const hashedPassword = await bcrypt.hash("password123", 10);

    const user = await prisma.user.create({
        data: {
            username: 'Moez_tn',
            email: 'moez@davay.tn',
            password_hash: hashedPassword,
        },
    })

    // Create standard lighters based on the spec
    const lighters = [
        {
            name: 'Tunis Edition #01',
            collection: 'Tunis',
            rarity: 'Common'
        },
        {
            name: 'Sfax Olive #041',
            collection: 'Sfax',
            rarity: 'Uncommon'
        },
        {
            name: 'Meme #023',
            collection: 'Meme',
            rarity: 'Rare'
        },
        {
            name: 'Carthage Glory',
            collection: 'Carthage',
            rarity: 'Epic'
        },
        {
            name: 'Golden Flame',
            collection: 'Default',
            rarity: 'Legendary'
        }
    ]

    for (const l of lighters) {
        await prisma.lighter.create({
            data: {
                name: l.name,
                collection: {
                    connectOrCreate: {
                        where: { name: l.collection },
                        create: { name: l.collection }
                    }
                },
                rarity: {
                    connectOrCreate: {
                        where: { name: l.rarity },
                        create: { name: l.rarity }
                    }
                },
                current_owner_id: user.id
            }
        })
    }

    console.log('Seeded database successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
