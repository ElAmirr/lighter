import { NextResponse } from 'next/server';


import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { password, action, id, name, collection_id, rarity_id, image_url } = await request.json();

        if (password !== 'davay_admin_2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (action === 'delete') {
            if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
            await prisma.lighter.delete({ where: { id } });
            return NextResponse.json({ success: true });
        }

        if (action === 'edit') {
            if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
            const lighter = await prisma.lighter.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(collection_id && { collection_id }),
                    ...(rarity_id && { rarity_id }),
                    ...(image_url && { image_url })
                }
            });
            return NextResponse.json({ success: true, lighter });
        }

        if (!name || !collection_id || !rarity_id) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const lighter = await prisma.lighter.create({
            data: {
                name,
                collection_id,
                rarity_id,
                image_url
            }
        });

        return NextResponse.json({ success: true, lighter });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
