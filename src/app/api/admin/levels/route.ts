import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('pw');
    if (password !== 'davay_admin_2026') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const levels = await prisma.levelConfig.findMany({ orderBy: { level: 'asc' } });
    return NextResponse.json(levels);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        if (body.password !== 'davay_admin_2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { action, id, level, xp_required, title } = body;

        if (action === 'delete') {
            await prisma.levelConfig.delete({ where: { id: parseInt(id) } });
            return NextResponse.json({ success: true });
        }

        if (action === 'update') {
            const updated = await prisma.levelConfig.update({
                where: { id: parseInt(id) },
                data: { level: parseInt(level), xp_required: parseInt(xp_required), title }
            });
            return NextResponse.json(updated);
        }

        // Default: create
        const created = await prisma.levelConfig.create({
            data: { level: parseInt(level), xp_required: parseInt(xp_required), title: title || 'Street Hunter' }
        });
        return NextResponse.json(created);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
