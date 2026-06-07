import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ captured: [], stolen: [] });

        const payload = verifyToken(token) as any;
        if (!payload) return NextResponse.json({ captured: [], stolen: [] });
        const userId = payload.userId;

        // All events where this user captured a lighter
        const captured = await prisma.ownershipHistory.findMany({
            where: { owner_id: userId },
            orderBy: { captured_at: 'desc' },
            include: {
                lighter: { include: { collection: true, rarity: true } }
            }
        });

        // A lighter is "stolen" for each time ownership passed FROM this user TO someone else
        const stolenEventsRaw = await prisma.ownershipHistory.findMany({
            where: { stolen_from_id: userId },
            orderBy: { captured_at: 'desc' },
            include: {
                lighter: { include: { collection: true, rarity: true } },
                owner: { select: { username: true } },
            }
        });

        const stolenEvents = stolenEventsRaw.map(s => ({
            id: s.id,
            lighter_id: s.lighter_id,
            lighter_name: s.lighter.name,
            collection: s.lighter.collection?.name || 'Default',
            rarity: s.lighter.rarity?.name || 'Common',
            stolen_by: s.owner.username,
            stolen_at: s.captured_at,
            lighter_image: s.lighter.image_url || s.lighter.collection?.image_url || null,
        }));

        const capturedMapped = captured.map(c => ({
            id: c.id,
            lighter_id: c.lighter_id,
            lighter_name: c.lighter.name,
            collection: c.lighter.collection?.name || 'Default',
            rarity: c.lighter.rarity?.name || 'Common',
            captured_at: c.captured_at,
            city_name: c.city_name,
            lighter_image: c.lighter.image_url || c.lighter.collection?.image_url || null,
        }));

        return NextResponse.json({ captured: capturedMapped, stolen: stolenEvents });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ captured: [], stolen: [] }, { status: 500 });
    }
}
