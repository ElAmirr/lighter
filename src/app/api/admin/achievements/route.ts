import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('pw');
    if (password !== 'davay_admin_2026') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const achievements = await prisma.achievementConfig.findMany({ orderBy: { id: 'asc' } });
    return NextResponse.json(achievements);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        if (body.password !== 'davay_admin_2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { action, id, title, icon, color, goal_type, goal_count, goal_string } = body;

        if (action === 'delete') {
            await prisma.achievementConfig.delete({ where: { id: parseInt(id) } });
            return NextResponse.json({ success: true });
        }

        if (action === 'update') {
            const updated = await prisma.achievementConfig.update({
                where: { id: parseInt(id) },
                data: { title, icon, color, goal_type, goal_count: parseInt(goal_count), goal_string }
            });
            return NextResponse.json(updated);
        }

        // Default: create
        const created = await prisma.achievementConfig.create({
            data: { title, icon, color, goal_type, goal_count: parseInt(goal_count) || 1, goal_string: goal_string || '' }
        });
        return NextResponse.json(created);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
