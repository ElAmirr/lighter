import { Bell, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

interface TopBarProps {
    rightIcon?: 'bell' | 'settings' | 'none';
    rightLabel?: string;
}

export default function TopBar({ rightIcon = 'bell', rightLabel }: TopBarProps) {
    return (
        <header className="flex w-full items-center justify-between px-4 py-4 bg-[var(--color-davay-card)] border-b border-[var(--color-davay-hint)]/30 sticky top-0 z-50">
            <Link href="/home" className="text-xl font-bold tracking-[0.15em] text-[var(--color-davay-text)]">
                DA<span className="text-[var(--color-davay-primary)]">V</span>AY
            </Link>

            <div className="flex items-center gap-2 text-[var(--color-davay-muted)]">
                {rightLabel ? (
                    <span className="text-sm font-medium">{rightLabel}</span>
                ) : rightIcon === 'bell' ? (
                    <button aria-label="Notifications" className="p-1 hover:text-[var(--color-davay-primary)] transition-colors">
                        <Bell size={24} />
                    </button>
                ) : rightIcon === 'settings' ? (
                    <button aria-label="Settings" className="p-1 hover:text-[var(--color-davay-primary)] transition-colors">
                        <Settings size={24} />
                    </button>
                ) : null}

                {/* Logout Button provided natively as regular anchor to trigger GET /api/auth/logout */}
                <a href="/api/auth/logout" aria-label="Logout" className="p-1 hover:text-[var(--color-davay-primary)] transition-colors">
                    <LogOut size={20} />
                </a>
            </div>
        </header>
    );
}
