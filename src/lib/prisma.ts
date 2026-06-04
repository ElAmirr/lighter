import { PrismaClient } from '@prisma/client';

// Singleton Prisma client to prevent connection pool exhaustion in Next.js dev
// (module hot-reload creates new PrismaClient instances; global avoids that)
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
