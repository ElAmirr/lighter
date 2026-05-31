import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { password, name, image_url, id, action } = await request.json();

        if (password !== 'davay_admin_2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (action === 'delete') {
            await prisma.collection.delete({ where: { id } });
            return NextResponse.json({ success: true });
        }

        if (action === 'edit' && id) {
            const collection = await prisma.collection.update({
                where: { id },
                data: { name, image_url }
            });
            return NextResponse.json({ success: true, collection });
        }

        if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

        const collection = await prisma.collection.create({
            data: { name, image_url }
        });

        return NextResponse.json({ success: true, collection });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
