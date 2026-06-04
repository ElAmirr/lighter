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

        // Lighters where user was once owner but someone else took it after
        const allUserLighters = await prisma.lighter.findMany({
            where: { history_entries: { some: { owner_id: userId } } },
            include: {
                history_entries: {
                    orderBy: { captured_at: 'asc' },
                    include: { owner: { select: { username: true } } }
                },
                collection: true,
                rarity: true,
            }
        });

        // A lighter is "stolen" for each time ownership passed FROM this user TO someone else
        const stolenEvents: any[] = [];
        for (const lighter of allUserLighters) {
            const entries = lighter.history_entries;
            for (let i = 0; i < entries.length - 1; i++) {
                if (entries[i].owner_id === userId && entries[i + 1].owner_id !== userId) {
                    stolenEvents.push({
                        id: entries[i + 1].id,
                        lighter_id: lighter.id,
                        lighter_name: lighter.name,
                        collection: lighter.collection?.name || 'Default',
                        rarity: lighter.rarity?.name || 'Common',
                        stolen_by: entries[i + 1].owner.username,
                        stolen_at: entries[i + 1].captured_at,
                        lighter_image: lighter.image_url || lighter.collection?.image_url || null,
                    });
                }
            }
        }
        stolenEvents.sort((a, b) => new Date(b.stolen_at).getTime() - new Date(a.stolen_at).getTime());

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
