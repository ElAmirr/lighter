import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
    try {
        let mission = await prisma.dailyMission.findUnique({ where: { id: 'daily' } });
        if (!mission) {
            mission = await prisma.dailyMission.create({ data: { id: 'daily' } });
        }

        const todayStart = new Date();
        const day = todayStart.getDay();
        const diff = todayStart.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const weekStart = new Date(todayStart.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);

        let myProgress = 0;
        let myXp = 0;
        let myLevel = 1;

        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (token) {
            try {
                const payload = verifyToken(token) as any;
                if (payload?.userId) {
                    if (mission.goal_type === 'captures') {
                        const caps = await prisma.ownershipHistory.findMany({
                            where: { owner_id: payload.userId, captured_at: { gte: weekStart } },
                            distinct: ['lighter_id'],
                            select: { lighter_id: true }
                        });
                        myProgress = caps.length;
                    } else if (mission.goal_type === 'scans') {
                        myProgress = await prisma.scan.count({
                            where: { user_id: payload.userId, scanned_at: { gte: weekStart } }
                        });
                    } else if (mission.goal_type === 'cities') {
                        const entries = await prisma.ownershipHistory.findMany({
                            where: { owner_id: payload.userId, captured_at: { gte: weekStart } },
                            select: { city_name: true }
                        });
                        myProgress = new Set(entries.map(e => e.city_name)).size;
                    }
                    // Compute Total XP
                    const user = await prisma.user.findUnique({
                        where: { id: payload.userId },
                        include: {
                            lighters: true,
                            history_entries: { include: { lighter: { include: { rarity: true } } } },
                            scans: { select: { id: true } }
                        }
                    });

                    if (user) {
                        const totalCaptures = user.history_entries.length;
                        const currentlyOwned = user.lighters.length;
                        const scansTriggered = user.scans.length;
                        const distinctCities = new Set(user.history_entries.map(h => h.city_name)).size;

                        const xpConfig = await prisma.xpConfig.findUnique({ where: { id: 'default' } }) || {
                            capture_base: 150, owned_base: 200, scan_base: 20, city_base: 100,
                            first_capture: 100, ten_captures: 500, three_cities: 200, ten_cities: 1000,
                            rare_find: 250, legendary_found: 1000
                        } as any;

                        myXp += totalCaptures * xpConfig.capture_base;
                        myXp += currentlyOwned * xpConfig.owned_base;
                        myXp += scansTriggered * xpConfig.scan_base;
                        myXp += distinctCities * xpConfig.city_base;
                        myXp += user.history_entries.reduce((acc, h) => acc + (h.lighter.rarity?.xp_reward || 0), 0);

                        if (totalCaptures >= 1) myXp += xpConfig.first_capture;
                        if (totalCaptures >= 10) myXp += xpConfig.ten_captures;
                        if (distinctCities >= 3) myXp += xpConfig.three_cities;
                        if (distinctCities >= 10) myXp += xpConfig.ten_cities;

                        myLevel = Math.floor(Math.sqrt(myXp / 100)) + 1;
                    }
                }
            } catch (e) { }
        }

        return NextResponse.json({ mission, myProgress, myXp, myLevel });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to load mission' }, { status: 500 });
    }
}
