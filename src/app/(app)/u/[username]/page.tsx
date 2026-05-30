// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import TopBar from '@/components/layout/TopBar';
import { notFound } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { Settings, Zap, Flame, MapPin, Star, Crown, Globe, Circle, Droplet, Leaf } from 'lucide-react';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import Link from 'next/link';
import clsx from 'clsx';

const prisma = new PrismaClient();

function getEditionStyles(collection: string) {
    switch (collection) {
        case 'Tunis': return { bg: 'bg-[var(--color-edition-tunis)]', text: 'text-[var(--color-accent-tunis)]', icon: Flame };
        case 'Sfax': return { bg: 'bg-[var(--color-edition-sfax)]', text: 'text-[var(--color-accent-sfax)]', icon: Leaf };
        case 'Sahel': return { bg: 'bg-[var(--color-edition-sahel)]', text: 'text-[var(--color-accent-sahel)]', icon: Droplet };
        case 'Meme': return { bg: 'bg-[var(--color-edition-meme)]', text: 'text-[var(--color-accent-meme)]', icon: Star };
        case 'Carthage': return { bg: 'bg-[var(--color-edition-carthage)]', text: 'text-[var(--color-accent-carthage)]', icon: Star };
        default: return { bg: 'bg-[var(--color-edition-default)]', text: 'text-[var(--color-accent-generic)]', icon: Circle };
    }
}

export default async function UserProfile({ params }: { params: Promise<{ username: string }> }) {
    const resolvedParams = await params;
    let username = resolvedParams.username;

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    let currentUserId = null;
    let currentUsername = null;

    if (token) {
        const payload = verifyToken(token) as any;
        if (payload) {
            currentUserId = payload.userId;
            currentUsername = payload.username;
        }
    }

    if (username === 'me' && currentUsername) {
        username = currentUsername;
    } else if (username === 'me' && !currentUsername) {
        return notFound();
    }

    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            lighters: true,
            history_entries: {
                include: { lighter: true }
            },
            scans: true
        }
    });

    if (!user) return notFound();

    const isOwnProfile = user.id === currentUserId;

    // Stats calculation
    const totalCaptures = user.history_entries.length;
    const currentlyOwned = user.lighters.length;
    const scansTriggered = user.scans.length;
    const distinctCities = new Set(user.history_entries.map(h => h.city_name)).size;

    // Rank Calculation
    const allUsersCaptures = await prisma.user.findMany({
        include: { _count: { select: { history_entries: true } } }
    });
    const rankings = allUsersCaptures.map(u => ({ id: u.id, score: u._count.history_entries }));
    rankings.sort((a, b) => b.score - a.score);
    const globalRank = rankings.findIndex(r => r.id === user.id) + 1;

    // Recent events (combine captures and losses)
    // Loss = another user captured a lighter we owned previously. We don't have a direct table for losses.
    // We can just show captures.
    const activity = user.history_entries
        .sort((a, b) => b.captured_at.getTime() - a.captured_at.getTime())
        .slice(0, 10);

    // Achievements
    const hasFirstCapture = totalCaptures >= 1;
    const has10Captures = totalCaptures >= 10;
    const has3Cities = distinctCities >= 3;
    const has10Cities = distinctCities >= 10;
    const hasRare = user.history_entries.some(h => h.lighter.rarity === 'Rare' || h.lighter.rarity === 'Epic' || h.lighter.rarity === 'Legendary');
    const hasLegendary = user.history_entries.some(h => h.lighter.rarity === 'Legendary');

    return (
        <>
            <TopBar rightIcon={isOwnProfile ? 'settings' : 'none'} />
            <div className="flex flex-col p-4 gap-6 pb-12">

                {/* Profile Header */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-[var(--color-davay-hint)]/20 flex flex-col items-center">
                    <div className="relative mb-3">
                        <div className="w-20 h-20 bg-[var(--color-rarity-legendary)] text-[var(--color-rarity-legendary-text)] rounded-full flex items-center justify-center font-extrabold text-2xl shadow-inner border border-white">
                            {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-[var(--color-davay-primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                            #{globalRank}
                        </div>
                    </div>

                    <h1 className="text-xl font-bold tracking-tight text-[var(--color-davay-text)]">{user.username}</h1>
                    <p className="text-xs font-semibold text-[var(--color-davay-muted)] uppercase tracking-wider mt-1">Joined {format(user.created_at, 'MMM yyyy')}</p>

                    {/* Stats strip */}
                    <div className="flex w-full mt-6 gap-2">
                        <div className="flex flex-col items-center flex-1 bg-gray-50 py-2 rounded-xl">
                            <span className="text-lg font-bold text-[var(--color-davay-primary)]">{totalCaptures}</span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Captures</span>
                        </div>
                        <div className="flex flex-col items-center flex-1 bg-gray-50 py-2 rounded-xl">
                            <span className="text-lg font-bold text-[var(--color-davay-primary)]">{currentlyOwned}</span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Owned</span>
                        </div>
                        <div className="flex flex-col items-center flex-1 bg-gray-50 py-2 rounded-xl">
                            <span className="text-lg font-bold text-[var(--color-davay-primary)]">{scansTriggered}</span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Scans</span>
                        </div>
                        <div className="flex flex-col items-center flex-1 bg-gray-50 py-2 rounded-xl">
                            <span className="text-lg font-bold text-[var(--color-davay-primary)]">{distinctCities}</span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Cities</span>
                        </div>
                    </div>
                </div>

                {/* Achievements */}
                <div>
                    <h2 className="text-sm font-bold tracking-widest text-[var(--color-davay-text)] mb-3 px-1">ACHIEVEMENTS</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {/* First Capture */}
                        <div className={clsx("flex flex-col items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm", !hasFirstCapture && "opacity-40 grayscale")}>
                            <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-2">
                                <Zap size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-center leading-tight">First<br />Capture</span>
                        </div>

                        <div className={clsx("flex flex-col items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm", !has10Captures && "opacity-40 grayscale")}>
                            <div className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2">
                                <Flame size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-center leading-tight">10<br />Captures</span>
                        </div>

                        <div className={clsx("flex flex-col items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm", !has3Cities && "opacity-40 grayscale")}>
                            <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-2">
                                <MapPin size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-center leading-tight">3<br />Cities</span>
                        </div>

                        <div className={clsx("flex flex-col items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm", !hasRare && "opacity-40 grayscale")}>
                            <div className="w-10 h-10 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mb-2">
                                <Star size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-center leading-tight">Rare<br />Find</span>
                        </div>

                        {(hasLegendary || isOwnProfile) && (
                            <div className={clsx("flex flex-col items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm", !hasLegendary && "opacity-40 grayscale")}>
                                <div className="w-10 h-10 bg-yellow-100 text-[var(--color-davay-primary)] rounded-full flex items-center justify-center mb-2">
                                    <Crown size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-center leading-tight">Legendary<br />Hunter</span>
                            </div>
                        )}

                        {(has10Cities || isOwnProfile) && (
                            <div className={clsx("flex flex-col items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm", !has10Cities && "opacity-40 grayscale")}>
                                <div className="w-10 h-10 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                                    <Globe size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-center leading-tight">10<br />Cities</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Currently Owns */}
                <div>
                    <h2 className="text-sm font-bold tracking-widest text-[var(--color-davay-text)] mb-3 px-1 mt-2 flex justify-between items-end">
                        <span>VAULT</span>
                        <span className="text-[10px] text-gray-400 font-bold">{currentlyOwned} ITEMS</span>
                    </h2>
                    {user.lighters.length === 0 ? (
                        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-6 flex items-center justify-center text-xs font-semibold text-gray-400">
                            Empty vault
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {user.lighters.map(lighter => {
                                const { bg, text, icon: Icon } = getEditionStyles(lighter.collection);
                                return (
                                    <Link href={`/l/${lighter.id}`} key={lighter.id} className="flex flex-col items-center group">
                                        <div className={`w-full aspect-square rounded-2xl flex items-center justify-center mb-1.5 shadow-sm border border-transparent group-hover:border-[var(--color-davay-primary)]/30 transition-all ${bg}`}>
                                            <Icon size={28} className={text} />
                                        </div>
                                        <span className="text-[10px] font-bold text-[var(--color-davay-text)] max-w-full truncate px-1 text-center leading-tight">{lighter.name}</span>
                                        <span className="text-[9px] font-bold text-[var(--color-davay-muted)]">#{lighter.id.slice(0, 3)}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="mt-2">
                    <h2 className="text-sm font-bold tracking-widest text-[var(--color-davay-text)] mb-3 px-1">ACTIVITY</h2>
                    <div className="flex flex-col gap-3">
                        {activity.map(entry => (
                            <div key={entry.id} className="flex gap-3 px-1 items-start">
                                <div className="w-2 h-2 mt-1.5 rounded-full bg-[var(--color-davay-primary)] shrink-0"></div>
                                <div className="flex flex-col py-0.5">
                                    <p className="text-sm font-medium leading-snug">
                                        Captured <span className="font-bold">#{entry.lighter_id.slice(0, 3)} {entry.lighter.name}</span> in {entry.city_name}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">{formatDistanceToNow(entry.captured_at, { addSuffix: true })}</p>
                                </div>
                            </div>
                        ))}
                        {activity.length === 0 && (
                            <p className="text-xs text-gray-400 font-medium px-1">No activity yet.</p>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
}
