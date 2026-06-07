import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
    try {
        const todayOnly = req.nextUrl.searchParams.get('today') === 'true';
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        let myMissionProgress = 0;
        if (token) {
            try {
                const payload = verifyToken(token) as any;
                if (payload?.userId) {
                    const myCaps = await prisma.ownershipHistory.findMany({
                        where: { owner_id: payload.userId, captured_at: { gte: todayStart } },
                        distinct: ['lighter_id'],
                        select: { lighter_id: true }
                    });
                    myMissionProgress = myCaps.length;
                }
            } catch (e) { }
        }

        const history = await prisma.ownershipHistory.findMany({
            orderBy: { captured_at: 'desc' },
            take: 50,
            where: todayOnly ? { captured_at: { gte: todayStart } } : undefined,
            include: {
                owner: { select: { username: true, avatar_url: true } },
                stolen_from: { select: { username: true } },
                lighter: {
                    include: {
                        collection: true,
                        rarity: true,
                        history_entries: {
                            orderBy: { captured_at: 'asc' },
                            take: 1,
                            include: { owner: { select: { username: true } } }
                        }
                    }
                }
            }
        });

        const rankMap = new Map<string, number>();
        const feed = history.map((h) => {
            const key = h.lighter_id;
            const rank = (rankMap.get(key) ?? 0) + 1;
            rankMap.set(key, rank);
            return {
                id: h.id,
                username: h.owner.username,
                user_avatar: h.owner.avatar_url,
                lighter_id: h.lighter_id,
                lighter_name: h.lighter.name,
                collection: h.lighter.collection?.name || 'Default',
                rarity: h.lighter.rarity?.name || 'Common',
                owner_number: rank,
                origin_owner: h.lighter.history_entries[0]?.owner?.username || 'Unknown',
                scan_count: h.lighter.scan_count,
                city_name: h.city_name,
                captured_at: h.captured_at,
                lighter_image: h.lighter.image_url || h.lighter.collection?.image_url || null,
                message: h.message,
                stolen_from: h.stolen_from?.username || null,
            };
        });

        const todayCaptures = await prisma.ownershipHistory.count({ where: { captured_at: { gte: todayStart } } });
        const activeRes: any = await prisma.$queryRaw`SELECT COUNT(DISTINCT owner_id)::int as hunters FROM "OwnershipHistory" WHERE captured_at >= ${todayStart}`;
        const activeHunters = activeRes[0]?.hunters || 0;
        const legendaryFound = await prisma.ownershipHistory.count({ where: { captured_at: { gte: todayStart }, lighter: { rarity: { name: 'Legendary' } } } });

        return NextResponse.json({
            feed,
            stats: { todayCaptures, activeHunters, legendaryFound, myMissionProgress }
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ feed: [], stats: { todayCaptures: 0, activeHunters: 0, legendaryFound: 0, myMissionProgress: 0 } }, { status: 500 });
    }
}

