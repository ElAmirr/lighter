import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const todayOnly = req.nextUrl.searchParams.get('today') === 'true';
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const history = await prisma.ownershipHistory.findMany({
            orderBy: { captured_at: 'desc' },
            take: 50,
            where: todayOnly ? { captured_at: { gte: todayStart } } : undefined,
            include: {
                owner: { select: { username: true } },
                lighter: {
                    include: { collection: true, rarity: true }
                }
            }
        });

        const rankMap = new Map<string, number>();
        const feed = history.map((h, i) => {
            const key = h.lighter_id;
            const rank = (rankMap.get(key) ?? 0) + 1;
            rankMap.set(key, rank);

            // Find the immediate next entry in the history array (which is the previous owner, since it's DESC)
            const prevEntry = history.slice(i + 1).find(p => p.lighter_id === h.lighter_id);
            const stolenFrom = prevEntry ? prevEntry.owner.username : null;

            return {
                id: h.id,
                username: h.owner.username,
                lighter_id: h.lighter_id,
                lighter_name: h.lighter.name,
                collection: h.lighter.collection?.name || 'Default',
                rarity: h.lighter.rarity?.name || 'Common',
                owner_number: rank,
                scan_count: h.lighter.scan_count,
                city_name: h.city_name,
                captured_at: h.captured_at,
                lighter_image: h.lighter.image_url || h.lighter.collection?.image_url || null,
                challenge_message: h.challenge_message,
                stolen_from: stolenFrom
            };
        });

        return NextResponse.json(feed);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json([], { status: 500 });
    }
}

