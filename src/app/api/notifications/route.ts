import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/jwt';

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const notifications = await prisma.notification.findMany({
            where: { user_id: user.userId },
            orderBy: { created_at: 'desc' },
            take: 30
        });

        const unreadCount = notifications.filter(n => !n.is_read).length;

        return NextResponse.json({ notifications, unreadCount });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
