"use client";

import { Bell, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

interface TopBarProps {
    rightIcon?: 'bell' | 'settings' | 'none';
    rightLabel?: string;
}

export default function TopBar({ rightIcon = 'bell', rightLabel }: TopBarProps) {
    return (
        <header className="flex w-full items-center justify-between px-4 py-4 bg-[var(--bg-card)] border-b border-[var(--border)] sticky top-0 z-50">
            <Link href="/home" className="text-xl font-black tracking-[0.15em] text-[var(--text-1)] font-sans">
                DA<span className="text-[var(--accent)]">V</span>AY
            </Link>

            <div className="flex items-center gap-3 text-[var(--text-2)]">
                {rightLabel ? (
                    <span className="text-sm font-medium">{rightLabel}</span>
                ) : rightIcon === 'bell' ? (
                    <button aria-label="Notifications" className="p-1 hover:text-[var(--accent)] transition-colors">
                        <Bell size={24} />
                    </button>
                ) : rightIcon === 'settings' ? (
                    <button aria-label="Settings" className="p-1 hover:text-[var(--accent)] transition-colors">
                        <Settings size={24} />
                    </button>
                ) : null}

                <button
                    onClick={async () => {
                        await fetch('/api/auth/logout', { method: 'POST' });
                        window.location.href = '/login';
                    }}
                    className="p-1 hover:text-red-500 transition-colors ml-2"
                    aria-label="Logout"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
}
