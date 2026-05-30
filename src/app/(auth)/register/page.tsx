"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to register');
            }

            router.push('/home');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 justify-center px-6 py-12">
            <div className="w-full mb-8">
                <h1 className="text-2xl font-bold tracking-[0.10em] mb-1">
                    JOIN DA<span className="text-[var(--color-davay-primary)]">V</span>AY
                </h1>
                <p className="text-[var(--color-davay-muted)] text-sm font-medium">Become part of the Tunisian street culture.</p>
            </div>

            <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
                {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-davay-muted)] mb-1.5 ml-1">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white border border-[var(--color-davay-hint)]/40 rounded-xl focus:outline-none focus:border-[var(--color-davay-primary)] focus:ring-1 focus:ring-[var(--color-davay-primary)] transition-all shadow-sm"
                        placeholder="choc_tn"
                        required
                        minLength={3}
                        maxLength={20}
                    />
                </div>

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
                        minLength={6}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-[var(--color-davay-text)] text-white font-bold py-4 rounded-xl shadow-md hover:bg-black active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100 flex justify-center"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Create Account'}
                </button>
            </form>

            <div className="mt-6 text-sm text-[var(--color-davay-text)] font-medium text-center">
                Already have an account?{' '}
                <Link href="/login" className="text-[var(--color-davay-primary)] font-bold hover:underline">
                    Login
                </Link>
            </div>
        </div>
    );
}
