import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('pw');

    if (password !== 'davay_admin_2026') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        let config = await prisma.xpConfig.findUnique({
            where: { id: 'default' }
        });

        if (!config) {
            config = await prisma.xpConfig.create({
                data: { id: 'default' }
            });
        }

        return NextResponse.json(config);
    } catch (e) {
        return NextResponse.json({ error: "Failed to load config" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (body.password !== 'davay_admin_2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = { ...body };
        delete data.password;

        const config = await prisma.xpConfig.upsert({
            where: { id: 'default' },
            create: { id: 'default', ...data },
            update: data
        });

        return NextResponse.json(config);
    } catch (e) {
        return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
    }
}
