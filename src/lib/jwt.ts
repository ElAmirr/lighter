import jwt, { SignOptions } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'davay_secret_key_for_jwt_2026';

export function signToken(payload: object, expiresIn: string | number = '7d') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
}

export function getUserFromRequest(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;
    return verifyToken(token) as { userId: string, username: string } | null;
}
