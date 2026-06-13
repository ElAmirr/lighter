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
                owner: { select: { id: true, username: true, avatar_url: true } },
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

        // Compute XP and Level for feed owners
        const ownerIds = Array.from(new Set(history.map(h => h.owner.id)));
        const xpMap = new Map<string, number>();
        if (ownerIds.length > 0) {
            const xpEntries = await prisma.ownershipHistory.findMany({
                where: { owner_id: { in: ownerIds } },
                select: { owner_id: true, lighter: { select: { rarity: { select: { xp_reward: true } } } } }
            });
            for (const entry of xpEntries) {
                const current = xpMap.get(entry.owner_id) || 0;
                xpMap.set(entry.owner_id, current + (entry.lighter?.rarity?.xp_reward || 0));
            }
        }

        const levelSchedule = await prisma.levelConfig.findMany({ orderBy: { xp_required: 'asc' } });
        const userLevels = new Map<string, number>();
        for (const ownerId of ownerIds) {
            const xp = xpMap.get(ownerId) || 0;
            let level = 1;
            for (const lv of levelSchedule) {
                if (xp >= lv.xp_required) level = lv.level;
            }
            userLevels.set(ownerId, level);
        }

        const rankMap = new Map<string, number>();
        const feed = history.map((h) => {
            const key = h.lighter_id;
            const rank = (rankMap.get(key) ?? 0) + 1;
            rankMap.set(key, rank);
            return {
                id: h.id,
                username: h.owner.username,
                user_avatar: h.owner.avatar_url,
                level: userLevels.get(h.owner.id) || 1,
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

        // All-time totals
        const totalCaptures = await prisma.ownershipHistory.count();
        const totalHuntersRes: any = await prisma.$queryRaw`SELECT COUNT(DISTINCT owner_id)::int as hunters FROM "OwnershipHistory"`;
        const totalHunters = totalHuntersRes[0]?.hunters || 0;
        const totalLegendary = await prisma.ownershipHistory.count({ where: { lighter: { rarity: { name: 'Legendary' } } } });
        const totalLighters = await prisma.lighter.count();
        const totalFound = await prisma.lighter.count({ where: { history_entries: { some: {} } } });

        // Collection completion stats: % of lighters per collection that have been found
        const collectionsRaw = await prisma.collection.findMany({
            include: {
                lighters: {
                    select: {
                        id: true,
                        image_url: true,
                        history_entries: { select: { id: true }, take: 1 }
                    }
                }
            }
        });
        const collections = collectionsRaw.map(c => {
            const total = c.lighters.length;
            const found = c.lighters.filter(l => l.history_entries.length > 0).length;
            const remaining = total - found;
            const pct = total > 0 ? Math.round((found / total) * 100) : 0;
            return {
                id: c.id,
                name: c.name,
                image_url: c.image_url,
                total,
                found,
                remaining,
                pct,
            };
        });

        return NextResponse.json({
            feed,
            stats: { todayCaptures, activeHunters, legendaryFound, myMissionProgress, totalCaptures, totalHunters, totalLegendary, totalLighters, totalFound },
            collections
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ feed: [], stats: { todayCaptures: 0, activeHunters: 0, legendaryFound: 0, myMissionProgress: 0 } }, { status: 500 });
    }
}

