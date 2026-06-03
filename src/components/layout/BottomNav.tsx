"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, ScanLine, Grid2X2, User } from 'lucide-react';
import clsx from 'clsx';

export default function BottomNav() {
    const pathname = usePathname() || '/home';
    const isScanActive = pathname.startsWith('/scan');

    const tabs = [
        { name: 'Home', href: '/home', icon: Home },
        { name: 'Ranks', href: '/leaderboard', icon: Trophy },
        { name: 'Scan', href: '/scan', icon: ScanLine, isCenter: true },
        { name: 'Collection', href: '/collection', icon: Grid2X2 },
        { name: 'Profile', href: '/u/me', icon: User },
    ];

    return (
        <nav style={{ background: 'var(--nav-bg)', borderTop: '1px solid var(--border)' }}
            className="fixed bottom-0 w-full max-w-[390px] px-2 py-2 flex justify-between items-end pb-safe z-50">
            {tabs.map((tab) => {
                const isActive = pathname.startsWith(tab.href) || (tab.href === '/u/me' && pathname.startsWith('/u/'));
                const Icon = tab.icon;

                if (tab.isCenter) {
                    return (
                        <Link key={tab.name} href={tab.href} className="flex flex-col items-center justify-center flex-1 -mt-6">
                            <div className={clsx(
                                "bg-[var(--accent)] text-white p-3 rounded-full shadow-lg shadow-[var(--accent)]/40 mb-1 active:scale-95 transition-transform",
                                !isScanActive && "scan-bounce-anim"
                            )}
                                style={{ animation: isScanActive ? 'none' : 'scan-bounce 2.5s infinite ease-in-out' }}>
                                <Icon size={28} />
                            </div>
                            <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>
                                {tab.name}
                            </span>
                        </Link>
                    );
                }

                return (
                    <Link key={tab.name} href={tab.href} className="flex flex-col items-center justify-center flex-1 py-1">
                        <Icon
                            size={24}
                            style={{
                                color: isActive ? 'var(--accent)' : 'var(--text-3)',
                                transform: isActive ? 'scale(1.15)' : 'scale(1)',
                                transition: 'transform 200ms ease, color 200ms ease',
                                marginBottom: 4,
                            }}
                        />
                        <span style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: isActive ? 'var(--accent)' : 'var(--text-3)',
                            transition: 'color 200ms ease',
                        }}>
                            {tab.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
