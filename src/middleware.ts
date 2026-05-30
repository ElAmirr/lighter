import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    const publicPaths = ['/login', '/register', '/', '/admin'];
    const isPublicPath = publicPaths.includes(path);

    // Exclude API, static assets, lighter public profiles (maybe?)
    if (path.startsWith('/api') || path.startsWith('/_next') || path.includes('.')) {
        return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;

    if (!isPublicPath && !token) {
        if (path.startsWith('/l/')) {
            // Allow lighter viewing but capture will bounce to login
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isPublicPath && token && path !== '/') {
        return NextResponse.redirect(new URL('/home', request.url));
    }

    return NextResponse.next();
}
