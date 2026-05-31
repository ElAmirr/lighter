import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL('/login', request.url);
    const response = NextResponse.redirect(url);
    response.cookies.delete('token');
    return response;
}
