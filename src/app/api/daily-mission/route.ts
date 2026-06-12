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
        todayStart.setHours(0, 0, 0, 0);

        let myProgress = 0;

        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (token) {
            try {
                const payload = verifyToken(token) as any;
                if (payload?.userId) {
                    if (mission.goal_type === 'captures') {
                        const caps = await prisma.ownershipHistory.findMany({
                            where: { owner_id: payload.userId, captured_at: { gte: todayStart } },
                            distinct: ['lighter_id'],
                            select: { lighter_id: true }
                        });
                        myProgress = caps.length;
                    } else if (mission.goal_type === 'scans') {
                        myProgress = await prisma.scan.count({
                            where: { user_id: payload.userId, scanned_at: { gte: todayStart } }
                        });
                    } else if (mission.goal_type === 'cities') {
                        const entries = await prisma.ownershipHistory.findMany({
                            where: { owner_id: payload.userId, captured_at: { gte: todayStart } },
                            select: { city_name: true }
                        });
                        myProgress = new Set(entries.map(e => e.city_name)).size;
                    }
                }
            } catch (e) { }
        }

        return NextResponse.json({ mission, myProgress });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to load mission' }, { status: 500 });
    }
}
