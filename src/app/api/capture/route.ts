import { NextResponse } from 'next/server';

import { getUserFromRequest } from '@/lib/jwt';
import type { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';

async function getCityFromCoords(lat: number, lon: number): Promise<string> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { 'User-Agent': 'DAVAY-App/1.0' }, next: { revalidate: 0 } }
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

        const { lighter_id, latitude, longitude } = await request.json();

        if (!lighter_id) {
            return NextResponse.json({ error: 'lighter_id is required' }, { status: 400 });
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

        await prisma.lighter.update({
            where: { id: lighter_id },
            data: { current_owner_id: user.userId, scan_count: { increment: 1 } }
        });

        const history = await prisma.ownershipHistory.create({
            data: { lighter_id, owner_id: user.userId, latitude, longitude, city_name }
        });

        await prisma.scan.create({
            data: { lighter_id, user_id: user.userId, latitude, longitude }
        });

        return NextResponse.json({ success: true, capture: history, city_name });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error', detail: error?.message }, { status: 500 });
    }
}
