// @ts-nocheck
import { prisma } from '@/lib/prisma';
import TopBar from '@/components/layout/TopBar';
import { notFound, redirect } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { Settings, Zap, Flame, MapPin, Star, Crown, Globe, Circle, Droplet, Leaf } from 'lucide-react';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import Link from 'next/link';
import clsx from 'clsx';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';


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
    let username = decodeURIComponent(resolvedParams.username).trim();

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
        return redirect(`/u/${currentUsername}`);
    } else if (username === 'me' && !currentUsername) {
        return redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            lighters: { include: { collection: true, rarity: true } },
            history_entries: {
                include: { lighter: { include: { collection: true, rarity: true } } }
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
    // Rank Calculation using raw SQL to bypass Prisma version limits
    const rankResult: any = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT "owner_id")::int as rank
        FROM (
            SELECT "owner_id"
            FROM "OwnershipHistory"
            GROUP BY "owner_id"
            HAVING COUNT("id") > ${totalCaptures}
        ) AS TopUsers;
    `;
    const globalRank = (rankResult[0]?.rank || 0) + 1;


    // Achievements
    const hasFirstCapture = totalCaptures >= 1;
    const has10Captures = totalCaptures >= 10;
    const has3Cities = distinctCities >= 3;
    const has10Cities = distinctCities >= 10;
    const hasRare = user.history_entries.some(h => ['Rare', 'Epic', 'Legendary'].includes(h.lighter.rarity?.name || ''));
    const hasLegendary = user.history_entries.some(h => h.lighter.rarity?.name === 'Legendary');

    return (
        <>
            <TopBar rightIcon={isOwnProfile ? 'settings' : 'none'} />
            <div className="flex flex-col p-4 gap-6 pb-12">

                {/* Profile Header */}
                <div className="bg-[var(--bg-card)] p-6 rounded-3xl shadow-sm border border-[var(--border)] flex flex-col items-center">
                    <div className="relative mb-3">
                        <ProfilePictureUpload
                            username={user.username}
                            initialAvatar={user.avatar_url}
                            isOwnProfile={isOwnProfile}
                        />
                        <div className="absolute -bottom-2 -right-2 bg-[var(--color-davay-primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm z-10">
                            #{globalRank}
                        </div>
                    </div>

                    <h1 className="text-xl font-bold tracking-tight text-[var(--color-davay-text)]">{user.username}</h1>
                    <p className="text-xs font-semibold text-[var(--color-davay-muted)] uppercase tracking-wider mt-1">Joined {format(user.created_at, 'MMM yyyy')}</p>

                    {/* Stats strip */}
                    <div className="flex w-full mt-6 gap-2">
                        <div className="flex flex-col items-center flex-1 bg-[var(--bg-sub)] py-2 rounded-xl">
                            <span className="text-lg font-bold text-[var(--color-davay-primary)]">{totalCaptures}</span>
                            <span className="text-[9px] font-bold text-[var(--text-2)] uppercase tracking-widest">Captures</span>
                        </div>
                        <div className="flex flex-col items-center flex-1 bg-[var(--bg-sub)] py-2 rounded-xl">
                            <span className="text-lg font-bold text-[var(--color-davay-primary)]">{currentlyOwned}</span>
                            <span className="text-[9px] font-bold text-[var(--text-2)] uppercase tracking-widest">Owned</span>
                        </div>
                        <div className="flex flex-col items-center flex-1 bg-[var(--bg-sub)] py-2 rounded-xl">
                            <span className="text-lg font-bold text-[var(--color-davay-primary)]">{scansTriggered}</span>
                            <span className="text-[9px] font-bold text-[var(--text-2)] uppercase tracking-widest">Scans</span>
                        </div>
                        <div className="flex flex-col items-center flex-1 bg-[var(--bg-sub)] py-2 rounded-xl">
                            <span className="text-lg font-bold text-[var(--color-davay-primary)]">{distinctCities}</span>
                            <span className="text-[9px] font-bold text-[var(--text-2)] uppercase tracking-widest">Cities</span>
                        </div>
                    </div>
                </div>

                {/* Achievements */}
                <div>
                    <h2 className="text-sm font-bold tracking-widest text-[var(--color-davay-text)] mb-3 px-1">ACHIEVEMENTS</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {/* First Capture */}
                        <div className={clsx("flex flex-col items-center bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border)] shadow-sm", !hasFirstCapture && "opacity-40 grayscale")}>
                            <div className="w-10 h-10 bg-[#FF7A00]/20 text-[#FF7A00] rounded-full flex items-center justify-center mb-2">
                                <Zap size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-center leading-tight">First<br />Capture</span>
                        </div>

                        <div className={clsx("flex flex-col items-center bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border)] shadow-sm", !has10Captures && "opacity-40 grayscale")}>
                            <div className="w-10 h-10 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-2">
                                <Flame size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-center leading-tight">10<br />Captures</span>
                        </div>

                        <div className={clsx("flex flex-col items-center bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border)] shadow-sm", !has3Cities && "opacity-40 grayscale")}>
                            <div className="w-10 h-10 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mb-2">
                                <MapPin size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-center leading-tight">3<br />Cities</span>
                        </div>

                        <div className={clsx("flex flex-col items-center bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border)] shadow-sm", !hasRare && "opacity-40 grayscale")}>
                            <div className="w-10 h-10 bg-purple-500/20 text-purple-500 rounded-full flex items-center justify-center mb-2">
                                <Star size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-center leading-tight">Rare<br />Find</span>
                        </div>

                        {(hasLegendary || isOwnProfile) && (
                            <div className={clsx("flex flex-col items-center bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border)] shadow-sm", !hasLegendary && "opacity-40 grayscale")}>
                                <div className="w-10 h-10 bg-[var(--accent)]/20 text-[var(--color-davay-primary)] rounded-full flex items-center justify-center mb-2">
                                    <Crown size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-center leading-tight">Legendary<br />Hunter</span>
                            </div>
                        )}

                        {(has10Cities || isOwnProfile) && (
                            <div className={clsx("flex flex-col items-center bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border)] shadow-sm", !has10Cities && "opacity-40 grayscale")}>
                                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-2">
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
                        <span className="text-[10px] text-[var(--text-3)] font-bold">{currentlyOwned} ITEMS</span>
                    </h2>
                    {user.lighters.length === 0 ? (
                        <div className="bg-[var(--bg-sub)] border border-[var(--border)] border-dashed rounded-2xl p-6 flex items-center justify-center text-xs font-semibold text-[var(--text-3)]">
                            Empty vault
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {user.lighters.map(lighter => {
                                const { bg, text, icon: Icon } = getEditionStyles(lighter.collection?.name || 'Default');
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
                <RecentActivity username={username} />

            </div>
        </>
    );
}

async function RecentActivity({ username }: { username: string }) {
    let events: Array<{ type: string; text: string; timestamp: string }> = [];
    try {

        const user = await prisma.user.findUnique({ where: { username } });
        if (user) {
            const captures = await prisma.ownershipHistory.findMany({
                where: { owner_id: user.id },
                orderBy: { captured_at: 'desc' },
                take: 20,
                include: { lighter: { include: { collection: true } } }
            });
            const stolenFromUser = await prisma.ownershipHistory.findMany({
                where: { stolen_from_id: user.id },
                orderBy: { captured_at: 'desc' },
                take: 10,
                include: { lighter: true, owner: true }
            });
            const evts: Array<{ type: string; text: string; timestamp: Date }> = [];
            for (const c of captures) {
                evts.push({ type: 'capture', text: `Captured #${c.lighter_id.slice(0, 3)} ${c.lighter.name}`, timestamp: c.captured_at });
            }
            for (const s of stolenFromUser) {
                evts.push({ type: 'lost', text: `Lost #${s.lighter_id.slice(0, 3)} ${s.lighter.name} to ${s.owner.username}`, timestamp: s.captured_at });
            }
            evts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            events = evts.slice(0, 10).map(e => ({ ...e, timestamp: e.timestamp.toISOString() }));
        }
    } catch { }

    const dotColor: Record<string, string> = {
        capture: 'var(--accent)',
        lost: 'var(--text-3)',
        achievement: '#534AB7',
    };

    return (
        <div className="mt-2 pb-20">
            <h2 className="text-sm font-bold tracking-widest text-[var(--color-davay-text)] mb-3 px-1">RECENT ACTIVITY</h2>
            <div className="flex flex-col gap-2">
                {events.length === 0 && (
                    <p className="text-xs text-[var(--text-3)] font-medium px-1">No activity yet.</p>
                )}
                {events.map((event, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-[var(--bg-card)] rounded-2xl p-3 border border-[var(--border)] shadow-sm">
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor[event.type] ?? '#888', flexShrink: 0 }} />
                        <p className="text-sm font-medium flex-1 leading-snug text-[var(--text-1)]">{event.text}</p>
                        <span className="text-[10px] text-[var(--text-3)] font-bold whitespace-nowrap">{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

