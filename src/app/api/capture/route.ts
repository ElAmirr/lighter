import { NextResponse } from 'next/server';

import { getUserFromRequest } from '@/lib/jwt';
import type { NextRequest } from 'next/server';
import webpush from 'web-push';

import { prisma } from '@/lib/prisma';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:amirr@davay.tn',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

async function getCityFromCoords(lat: number, lon: number): Promise<string> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { 'User-Agent': 'HatChaaoul-App/1.0' }, next: { revalidate: 0 } }
        );
        const data = await res.json();
        const addr = data.address || {};
        return addr.city || addr.town || addr.village || addr.county || 'Unknown';
    } catch {
        return 'Unknown';
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { lighter_id, latitude, longitude, message } = await request.json();

        if (!lighter_id) {
            return NextResponse.json({ error: 'lighter_id is required' }, { status: 400 });
        }

        const realUser = await prisma.user.findUnique({ where: { id: user.userId } });
        if (!realUser) {
            const resp = NextResponse.json({ error: 'Session invalid. Please log out and log in again.' }, { status: 401 });
            resp.cookies.delete('token');
            return resp;
        }

        const lighter = await prisma.lighter.findUnique({ where: { id: lighter_id } });
        if (!lighter) {
            return NextResponse.json({ error: 'Lighter not found' }, { status: 404 });
        }

        if (lighter.current_owner_id === user.userId) {
            return NextResponse.json({ error: 'You already own this lighter' }, { status: 400 });
        }

        // Server-side geocoding
        let city_name = 'Unknown';
        if (latitude != null && longitude != null) {
            city_name = await getCityFromCoords(latitude, longitude);
        }

        const stolen_from_id = lighter.current_owner_id;

        await prisma.lighter.update({
            where: { id: lighter_id },
            data: { current_owner_id: user.userId, scan_count: { increment: 1 } }
        });

        const history = await prisma.ownershipHistory.create({
            data: { lighter_id, owner_id: user.userId, latitude, longitude, city_name, message, stolen_from_id }
        });

        await prisma.scan.create({
            data: { lighter_id, user_id: user.userId, latitude, longitude }
        });

        // Send push notification if stolen
        if (stolen_from_id && stolen_from_id !== user.userId) {
            try {
                const subs = await prisma.pushSubscription.findMany({ where: { user_id: stolen_from_id } });
                const notificationPayload = JSON.stringify({
                    title: '🚨 ولاعتك تسرقت!',
                    body: `${user.username} قبض على ${lighter.name}`,
                    url: `/l/${lighter_id}`
                });

                await Promise.all(subs.map(async (sub) => {
                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: { p256dh: sub.p256dh, auth: sub.auth }
                    };
                    try {
                        await webpush.sendNotification(pushSubscription, notificationPayload);
                    } catch (err: any) {
                        // If subscription is gone, delete it
                        if (err?.statusCode === 410 || err?.statusCode === 404) {
                            await prisma.pushSubscription.delete({ where: { id: sub.id } });
                        }
                    }
                }));
            } catch (err) {
                console.error('Push notification failed:', err);
            }
        }

        return NextResponse.json({ success: true, capture: history, city_name });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error', detail: error?.message }, { status: 500 });
    }
}
