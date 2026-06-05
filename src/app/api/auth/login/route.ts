import { NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';

import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = body.email?.trim().toLowerCase();
        const password = body.password;

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = signToken({ userId: user.id, username: user.username });

        const response = NextResponse.json({ success: true, user: { id: user.id, username: user.username } });

        // Set cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
