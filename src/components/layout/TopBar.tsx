"use client";

import { Bell, Settings } from 'lucide-react';
import Link from 'next/link';

interface TopBarProps {
    rightIcon?: 'bell' | 'settings' | 'pulse' | 'none';
    rightLabel?: string;
}

export default function TopBar({ rightIcon = 'bell', rightLabel }: TopBarProps) {
    return (
        <header className="flex w-full items-center justify-between px-4 py-3.5 bg-[var(--bg-card)] border-b border-[var(--border)] sticky top-0 z-50">
            <Link href="/home" className="text-[22px] font-black tracking-[0.04em] text-[var(--text-1)] font-sans">
                DA<span className="text-[var(--accent)]">VAY</span>
            </Link>

            <div className="flex items-center gap-3 text-[var(--text-2)]">
                {rightIcon === 'pulse' ? (
                    <div className="flex items-center gap-1.5 bg-[var(--bg-sub)] rounded-full px-2.5 py-1">
                        <span className="w-[7px] h-[7px] rounded-full bg-[var(--accent)] inline-block animate-[pulse-dot_1.5s_infinite_ease-in-out]" />
                        {rightLabel && <span className="text-[11px] font-extrabold text-[var(--accent)] uppercase tracking-[0.06em]">{rightLabel}</span>}
                    </div>
                ) : rightIcon !== 'none' || rightLabel ? (
                    <div className="flex items-center gap-2 bg-[var(--bg-sub)] rounded-2xl px-3 py-1.5 border border-[var(--border)]">
                        {rightLabel && (
                            <span className="text-[10px] font-black text-[var(--text-2)] uppercase tracking-[0.1em]">{rightLabel}</span>
                        )}
                        {rightIcon === 'bell' && <Bell size={14} className="text-[var(--text-3)]" />}
                        {rightIcon === 'settings' && <Settings size={14} className="text-[var(--text-3)]" />}
                    </div>
                ) : null}
            </div>
        </header>
    );
}
