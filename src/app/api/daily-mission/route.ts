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
                        myXp = user.history_entries.reduce((acc, h) => acc + (h.lighter.rarity?.xp_reward || 0), 0);
                        const levelSchedule = await prisma.levelConfig.findMany({ orderBy: { xp_required: 'asc' } });
                        myLevel = 1;
                        for (const lv of levelSchedule) {
                            if (myXp >= lv.xp_required) myLevel = lv.level;
                        }
                    }
                }
            } catch (e) { }
        }

        return NextResponse.json({ mission, myProgress, myXp, myLevel });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to load mission' }, { status: 500 });
    }
}
