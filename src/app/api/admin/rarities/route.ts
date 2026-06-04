import { NextResponse } from 'next/server';


import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { password, name, id, action } = await request.json();

        if (password !== 'davay_admin_2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (action === 'delete') {
            await prisma.rarity.delete({ where: { id } });
            return NextResponse.json({ success: true });
        }

        if (action === 'edit' && id) {
            const rarity = await prisma.rarity.update({
                where: { id },
                data: { name }
            });
            return NextResponse.json({ success: true, rarity });
        }

        if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

        const rarity = await prisma.rarity.create({
            data: { name }
        });

        return NextResponse.json({ success: true, rarity });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
