import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/jwt';

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await prisma.notification.updateMany({
            where: { user_id: user.userId, is_read: false },
            data: { is_read: true }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
