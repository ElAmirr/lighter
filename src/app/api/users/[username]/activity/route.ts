import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
    try {
        const { username } = await params;

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Get all captures by this user
        const captures = await prisma.ownershipHistory.findMany({
            where: { owner_id: user.id },
            orderBy: { captured_at: 'desc' },
            take: 20,
            include: { lighter: { include: { collection: true } } }
        });

        // Get all scans (where ownership changed away)
        const lightersOwnedByUser = await prisma.lighter.findMany({
            where: { history_entries: { some: { owner_id: user.id } } },
            include: { history_entries: { orderBy: { captured_at: 'asc' }, include: { owner: true } } }
        });

        const events: Array<{ type: string; text: string; timestamp: Date }> = [];

        // Capture events
        for (const c of captures) {
            events.push({
                type: 'capture',
                text: `Captured #${c.lighter_id.slice(0, 3)} ${c.lighter.name}`,
                timestamp: c.captured_at,
            });
        }

        // "Lost" events: when lighter was captured by someone else after user had it
        for (const lighter of lightersOwnedByUser) {
            const entries = lighter.history_entries;
            for (let i = 0; i < entries.length - 1; i++) {
                if (entries[i].owner_id === user.id && entries[i + 1].owner_id !== user.id) {
                    events.push({
                        type: 'lost',
                        text: `Lost #${lighter.id.slice(0, 3)} ${lighter.name} to ${entries[i + 1].owner.username}`,
                        timestamp: entries[i + 1].captured_at,
                    });
                }
            }
        }

        // Sort all events newest first and take top 10
        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const top10 = events.slice(0, 10).map(e => ({
            ...e,
            timestamp: e.timestamp.toISOString(),
        }));

        return NextResponse.json(top10);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
