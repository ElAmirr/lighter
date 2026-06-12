import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('pw');

    if (password !== 'davay_admin_2026') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        let mission = await prisma.dailyMission.findUnique({ where: { id: 'daily' } });
        if (!mission) {
            mission = await prisma.dailyMission.create({ data: { id: 'daily' } });
        }
        return NextResponse.json(mission);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to load mission' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        if (body.password !== 'davay_admin_2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description, goal_type, goal_count, xp_reward, reward_label } = body;

        const mission = await prisma.dailyMission.upsert({
            where: { id: 'daily' },
            create: { id: 'daily', title, description, goal_type, goal_count: parseInt(goal_count), xp_reward: parseInt(xp_reward), reward_label },
            update: { title, description, goal_type, goal_count: parseInt(goal_count), xp_reward: parseInt(xp_reward), reward_label }
        });

        return NextResponse.json(mission);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update mission' }, { status: 500 });
    }
}
