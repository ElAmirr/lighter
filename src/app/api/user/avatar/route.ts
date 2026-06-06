import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/jwt';

export async function POST(req: NextRequest) {
    try {
        const userPayload = getUserFromRequest(req);
        if (!userPayload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { avatarData } = body;

        // Ensure string is a basic base64 data URI format before accepting
        if (!avatarData || typeof avatarData !== 'string' || !avatarData.startsWith('data:image/')) {
            return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userPayload.userId },
            data: { avatar_url: avatarData }
        });

        return NextResponse.json({ success: true, avatar_url: updatedUser.avatar_url });
    } catch (e: any) {
        console.error("Avatar upload error:", e);
        return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
    }
}
