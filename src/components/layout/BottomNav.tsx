"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, ScanLine, Grid2X2, User } from 'lucide-react';
import clsx from 'clsx';

export default function BottomNav() {
    const pathname = usePathname() || '/home';

    const tabs = [
        { name: 'Home', href: '/home', icon: Home },
        { name: 'Ranks', href: '/leaderboard', icon: Trophy },
        { name: 'Scan', href: '/scan', icon: ScanLine, isCenter: true },
        { name: 'Collection', href: '/collection', icon: Grid2X2 },
        { name: 'Profile', href: '/u/me', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 w-full max-w-[390px] bg-[var(--color-davay-card)] border-t border-[var(--color-davay-hint)]/30 px-2 py-2 flex justify-between items-end pb-safe z-50">
            {tabs.map((tab) => {
                const isActive = pathname.startsWith(tab.href) || (tab.href === '/u/me' && pathname.startsWith('/u/'));
                const Icon = tab.icon;

                if (tab.isCenter) {
                    return (
                        <Link key={tab.name} href={tab.href} className="flex flex-col items-center justify-center flex-1 -mt-6">
                            <div className="bg-[var(--color-davay-primary)] text-white p-3 rounded-full shadow-lg shadow-[var(--color-davay-primary)]/40 mb-1 active:scale-95 transition-transform">
                                <Icon size={28} />
                            </div>
                            <span className="text-[10px] font-semibold text-[var(--color-davay-primary)]">
                                {tab.name}
                            </span>
                        </Link>
                    );
                }

                return (
                    <Link key={tab.name} href={tab.href} className="flex flex-col items-center justify-center flex-1 py-1">
                        <Icon
                            size={24}
                            className={clsx(
                                "mb-1 transition-colors",
                                isActive ? "text-[var(--color-davay-primary)]" : "text-[#CCCCCC]"
                            )}
                        />
                        <span className={clsx(
                            "text-[10px] font-medium transition-colors",
                            isActive ? "text-[var(--color-davay-primary)]" : "text-[#CCCCCC]"
                        )}>
                            {tab.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
