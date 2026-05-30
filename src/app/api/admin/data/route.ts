import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pw = searchParams.get('pw');

        if (pw !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const lighters = await prisma.lighter.findMany({
            include: {
                current_owner: { select: { username: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        const users = await prisma.user.findMany({
            include: {
                history_entries: { select: { id: true } } // just to compute length
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({ lighters, users });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
