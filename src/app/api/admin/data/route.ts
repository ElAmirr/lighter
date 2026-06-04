import { NextResponse } from 'next/server';


import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pw = searchParams.get('pw');

        if (pw !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const lighters = await prisma.lighter.findMany({
            include: {
                current_owner: { select: { username: true } },
                collection: true,
                rarity: true
            },
            orderBy: { created_at: 'desc' }
        });

        const collections = await prisma.collection.findMany();
        const rarities = await prisma.rarity.findMany();

        const users = await prisma.user.findMany({
            include: {
                history_entries: { select: { id: true } } // just to compute length
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({ lighters, users, collections, rarities });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
