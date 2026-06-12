import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic admin check (could use a real env secret)
        if (body.password !== 'davay_admin_2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, id, username, email, newPassword } = body;

        if (action === 'delete') {
            await prisma.user.delete({ where: { id } });
            return NextResponse.json({ success: true });
        }

        if (action === 'update') {
            const dataToUpdate: any = { username, email };

            // Allow admin to set a new password manually
            if (newPassword && newPassword.trim() !== '') {
                const salt = await bcrypt.genSalt(10);
                dataToUpdate.password_hash = await bcrypt.hash(newPassword, salt);
            }

            const updated = await prisma.user.update({
                where: { id },
                data: dataToUpdate
            });
            return NextResponse.json(updated);
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
