import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { password, name } = await request.json();
        if (password !== 'davay_admin_2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const rarity = await prisma.rarity.create({
            data: { name }
        });
        return NextResponse.json(rarity);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const password = searchParams.get('pw');
        const id = searchParams.get('id');

        if (password !== 'davay_admin_2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (id) {
            await prisma.rarity.delete({ where: { id } });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error / Constraint Failed' }, { status: 500 });
    }
}
