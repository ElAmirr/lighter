"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Flame } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to login');
            }

            router.push('/home');
            router.refresh(); // Refresh to catch new cookies across the whole app
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 items-center justify-center px-6 py-12">
            <div className="w-full text-center mb-10">
                <div className="inline-flex items-center justify-center p-4 bg-[var(--color-edition-tunis)] rounded-full mb-4 shadow-sm">
                    <Flame size={32} className="text-[var(--color-davay-primary)]" />
                </div>
                <h1 className="text-3xl font-bold tracking-[0.15em] mb-2">
                    DA<span className="text-[var(--color-davay-primary)]">V</span>AY
                </h1>
                <p className="text-[var(--color-davay-muted)] text-sm">Sign in to capture and claim.</p>
            </div>

            <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
                {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-davay-muted)] mb-1.5 ml-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white border border-[var(--color-davay-hint)]/40 rounded-xl focus:outline-none focus:border-[var(--color-davay-primary)] focus:ring-1 focus:ring-[var(--color-davay-primary)] transition-all shadow-sm"
                        placeholder="flame@davay.tn"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-davay-muted)] mb-1.5 ml-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white border border-[var(--color-davay-hint)]/40 rounded-xl focus:outline-none focus:border-[var(--color-davay-primary)] focus:ring-1 focus:ring-[var(--color-davay-primary)] transition-all shadow-sm"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-[var(--color-davay-primary)] text-white font-bold py-4 rounded-xl shadow-md shadow-[var(--color-davay-primary)]/20 hover:bg-[#c24b23] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100 flex justify-center"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Login'}
                </button>
            </form>

            <div className="mt-8 text-sm text-[var(--color-davay-muted)] font-medium">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-[var(--color-davay-primary)] font-bold hover:underline">
                    Register
                </Link>
            </div>
        </div>
    );
}
