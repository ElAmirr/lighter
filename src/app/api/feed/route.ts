import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const history = await prisma.ownershipHistory.findMany({
            orderBy: { captured_at: 'desc' },
            take: 20,
            include: {
                owner: { select: { username: true } },
                lighter: {
                    include: { collection: true, rarity: true }
                }
            }
        });

        const feed = await Promise.all(history.map(async (h) => {
            // Count how many times this lighter was owned before this event
            const ownerNumber = await prisma.ownershipHistory.count({
                where: { lighter_id: h.lighter_id, captured_at: { lte: h.captured_at } }
            });

            return {
                id: h.id,
                username: h.owner.username,
                lighter_id: h.lighter_id,
                lighter_name: h.lighter.name,
                collection: h.lighter.collection?.name || 'Default',
                rarity: h.lighter.rarity?.name || 'Common',
                owner_number: ownerNumber,
                scan_count: h.lighter.scan_count,
                city_name: h.city_name,
                captured_at: h.captured_at,
                lighter_image: h.lighter.image_url || h.lighter.collection?.image_url || null,
            };
        }));

        return NextResponse.json(feed);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
