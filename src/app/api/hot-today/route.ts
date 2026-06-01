import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const todayMidnight = new Date();
        todayMidnight.setUTCHours(0, 0, 0, 0);

        const todayScans = await prisma.scan.groupBy({
            by: ['lighter_id'],
            where: { scanned_at: { gte: todayMidnight } },
            _count: { lighter_id: true },
            orderBy: { _count: { lighter_id: 'desc' } },
            take: 3,
        });

        const hot = await Promise.all(todayScans.map(async (s) => {
            const lighter = await prisma.lighter.findUnique({
                where: { id: s.lighter_id },
                include: { collection: true, rarity: true }
            });
            return {
                lighter_id: s.lighter_id,
                lighter_name: lighter?.name || 'Unknown',
                collection: lighter?.collection?.name || 'Default',
                rarity: lighter?.rarity?.name || 'Common',
                lighter_image: lighter?.image_url || lighter?.collection?.image_url || null,
                scans_today: s._count.lighter_id,
            };
        }));

        return NextResponse.json(hot);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
