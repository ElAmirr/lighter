"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';

export default function LeaderboardTabs({ activeTab }: { activeTab: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const handleTabChange = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.push(`${pathname}?${params.toString()}`);
    };

    const tabs = [
        { id: 'captures', label: 'Captures' },
        { id: 'owned', label: 'Owned' },
        { id: 'xp', label: 'Total XP' },
    ];

    return (
        <div className="flex w-full bg-[var(--color-davay-card)] p-1 rounded-xl shadow-sm border border-[var(--color-davay-hint)]/20">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={clsx(
                        "flex-1 py-2 text-sm font-bold rounded-lg transition-colors",
                        activeTab === tab.id
                            ? "bg-[var(--color-davay-primary)] text-white shadow-sm"
                            : "text-[var(--color-davay-muted)] hover:text-[var(--color-davay-text)]"
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
