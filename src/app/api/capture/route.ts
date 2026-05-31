import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/lib/jwt';
import type { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { lighter_id, latitude, longitude, city_name } = await request.json();

        if (!lighter_id) {
            return NextResponse.json({ error: 'lighter_id is required' }, { status: 400 });
        }

        const lighter = await prisma.lighter.findUnique({
            where: { id: lighter_id }
        });

        if (!lighter) {
            return NextResponse.json({ error: 'Lighter not found' }, { status: 404 });
        }

        if (lighter.current_owner_id === user.userId) {
            return NextResponse.json({ error: 'You already own this lighter' }, { status: 400 });
        }

        // Process logic
        const finalCityName = city_name || "Unknown";

        // Update lighter: current_owner_id = user id, increment scan_count
        await prisma.lighter.update({
            where: { id: lighter_id },
            data: {
                current_owner_id: user.userId,
                scan_count: { increment: 1 }
            }
        });

        // Save to ownership_history
        const history = await prisma.ownershipHistory.create({
            data: {
                lighter_id,
                owner_id: user.userId,
                latitude,
                longitude,
                city_name: finalCityName
            }
        });

        // Log the scan
        await prisma.scan.create({
            data: {
                lighter_id,
                user_id: user.userId,
                latitude,
                longitude
            }
        });

        return NextResponse.json({ success: true, capture: history });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error', detail: error?.message || String(error) }, { status: 500 });
    }
}
