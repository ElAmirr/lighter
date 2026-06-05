import { NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';

import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const username = body.username?.trim();
        const email = body.email?.trim().toLowerCase();
        const password = body.password;

        if (!username || !email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }]
            }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Username or email already taken' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password_hash: hashedPassword,
            }
        });

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
