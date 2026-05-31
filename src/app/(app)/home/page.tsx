import TopBar from '@/components/layout/TopBar';
import { PrismaClient } from '@prisma/client';
import { Flame } from 'lucide-react';

const prisma = new PrismaClient();

export default async function HomePage() {
    const lightersCount = await prisma.lighter.count();

    return (
        <div className="flex flex-col h-full bg-[var(--color-davay-bg)] font-sans pb-20">
            <TopBar rightLabel="Home" />

            <div className="flex flex-col items-center justify-center p-8 mt-10">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 shadow-xl mb-6">
                    <Flame size={48} strokeWidth={2} />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-center">DAVAY GAME</h1>
                <p className="text-center text-gray-500 mt-2 text-sm leading-relaxed max-w-[260px]">
                    Welcome to the hunt. There are currently {lightersCount} physical lighters roaming the streets. Can you find them all?
                </p>
            </div>
        </div>
    );
}
