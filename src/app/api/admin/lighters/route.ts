import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { password, name, collection, rarity } = await request.json();

        if (password !== 'davay_admin_2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!name || !collection || !rarity) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const lighter = await prisma.lighter.create({
            data: {
                name,
                collection,
                rarity
            }
        });

        return NextResponse.json({ success: true, lighter });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
