import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/jwt';

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const subscription = await req.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
        }

        // Upsert the subscription into DB
        await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                user_id: user.userId,
                p256dh: subscription.keys?.p256dh || '',
                auth: subscription.keys?.auth || '',
            },
            create: {
                user_id: user.userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys?.p256dh || '',
                auth: subscription.keys?.auth || '',
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error saving subscription', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
