"use client";

import { LogOut } from 'lucide-react';

export default function LogoutButton() {
    return (
        <button
            onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
            }}
            className="flex items-center justify-center gap-2 p-4 mt-8 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black tracking-widest text-xs w-full active:scale-95 transition-transform"
        >
            <LogOut size={18} />
            LOG OUT
        </button>
    );
}
