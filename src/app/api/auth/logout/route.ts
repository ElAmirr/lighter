import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const response = NextResponse.json({ success: true });

    // Clear the HttpOnly token cookie by setting its maxAge to 0
    response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0
    });

    return response;
}
