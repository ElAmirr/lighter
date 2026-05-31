// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import TopBar from '@/components/layout/TopBar';
import { notFound } from 'next/navigation';
import CaptureClientButton from './CaptureClientButton';
import { format } from 'date-fns';
import { Flame, Leaf, Droplet, Star, Circle, MapPin, Share2 } from 'lucide-react';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

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

function getRarityStyle(rarity: string) {
    switch (rarity) {
        case 'Common': return 'bg-[var(--color-rarity-common)] text-[var(--color-rarity-common-text)]';
        case 'Uncommon': return 'bg-[var(--color-rarity-uncommon)] text-[var(--color-rarity-uncommon-text)]';
        case 'Rare': return 'bg-[var(--color-rarity-rare)] text-[var(--color-rarity-rare-text)]';
        case 'Epic': return 'bg-[var(--color-rarity-epic)] text-[var(--color-rarity-epic-text)]';
        case 'Legendary': return 'bg-[var(--color-rarity-legendary)] text-[var(--color-rarity-legendary-text)]';
        default: return 'bg-gray-100 text-gray-500';
    }
}

export default async function LighterProfile({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const lighter = await prisma.lighter.findUnique({
        where: { id: resolvedParams.id },
        include: {
            collection: true,
            rarity: true,
            current_owner: true,
            history_entries: {
                orderBy: { captured_at: 'desc' },
                include: { owner: true }
            }
        }
    });

    if (!lighter) return notFound();

    // Every time loaded, increment scan count if not an API? The prompt specifies "Every time /l/:id is loaded, increment scan_count in lighters table."
    // But wait, server components running on GET shouldn't ideally mutate if we have Next.js caching unless we do it in a Server Action or Route Handler.
    // Actually, we can just do a background fetch in the client to register a "view scan", or do it here.
    // If we do it here, Next.js will complain about mutating in a render. We will do it in a small Client component using useEffect.

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    let currentUser = null;
    if (token) {
        const payload = verifyToken(token) as any;
        if (payload) currentUser = payload.userId;
    }

    const { bg, text, icon: Icon } = getEditionStyles(lighter.collection?.name || 'Default');
    const rarityStyle = getRarityStyle(lighter.rarity?.name || 'Common');

    // Calculate distinct cities
    const cities = Array.from(new Set(lighter.history_entries.map(h => h.city_name)));

    const alreadyOwns = lighter.current_owner_id === currentUser;

    return (
        <>
            <TopBar rightLabel={`davay.tn/l/${lighter.id.slice(0, 6)}`} />
            <div className="flex flex-col flex-1 pb-10">
                {/* Edition Card */}
                <div className={`w-full h-72 flex flex-col items-center justify-center relative p-6 shadow-sm border-b border-[var(--color-davay-hint)]/20 ${bg}`}>
                    <div className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-widest opacity-60 mix-blend-multiply">
                        GEN 1
                    </div>
                    {lighter.image_url ? (
                        <div className="w-32 h-32 mb-4 rounded-xl border border-white shadow-xl overflow-hidden relative">
                            <img src={lighter.image_url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl pointer-events-none"></div>
                        </div>
                    ) : lighter.collection?.image_url ? (
                        <div className="w-28 h-28 mb-4 rounded-full border-4 border-white/50 shadow-lg overflow-hidden relative opacity-90 transition-transform">
                            <img src={lighter.collection.image_url} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <Icon size={100} className={`mb-4 opacity-90 ${text}`} strokeWidth={1} />
                    )}
                    <div className={`font-bold tracking-[0.2em] uppercase text-sm ${text} mix-blend-multiply opacity-80`}>
                        {lighter.collection?.name || 'Unknown'} COLLECTION
                    </div>
                    <div className="absolute bottom-4 left-4 flex gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${rarityStyle}`}>
                            {lighter.rarity?.name || 'Common'}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/40 text-black/70 mix-blend-darken">
                            #{lighter.id.slice(0, 3)}
                        </span>
                    </div>
                </div>

                {/* Info Section */}
                <div className="px-5 pt-8 flex flex-col gap-6">

                    <div>
                        <h1 className="text-3xl font-extrabold text-[var(--color-davay-text)] leading-tight tracking-tight">
                            {lighter.name}
                        </h1>
                        <p className="text-[var(--color-davay-muted)] font-medium mt-1">
                            Released {format(lighter.created_at, 'MMMM yyyy')}
                        </p>
                    </div>

                    <div className="flex gap-2 w-full">
                        <div className="flex-1 bg-[--color-davay-bg] py-3 rounded-xl border border-[--color-davay-hint]/20 text-center">
                            <div className="text-[10px] font-bold tracking-wider text-[--color-davay-muted] uppercase mb-0.5">Owners</div>
                            <div className="text-xl font-extrabold text-[--color-davay-primary]">{lighter.history_entries.length === 0 ? 1 : new Set(lighter.history_entries.map(h => h.owner_id)).size}</div>
                        </div>
                        <div className="flex-1 bg-[--color-davay-bg] py-3 rounded-xl border border-[--color-davay-hint]/20 text-center">
                            <div className="text-[10px] font-bold tracking-wider text-[--color-davay-muted] uppercase mb-0.5">Scans</div>
                            <div className="text-xl font-extrabold text-[--color-davay-primary]">{lighter.scan_count}</div>
                        </div>
                        <div className="flex-1 bg-[--color-davay-bg] py-3 rounded-xl border border-[--color-davay-hint]/20 text-center">
                            <div className="text-[10px] font-bold tracking-wider text-[--color-davay-muted] uppercase mb-0.5">Cities</div>
                            <div className="text-xl font-extrabold text-[--color-davay-primary]">{cities.length === 0 ? 1 : cities.length}</div>
                        </div>
                    </div>

                    {/* Cities pills */}
                    {cities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {cities.slice(0, 4).map((city, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-[--color-davay-bg] rounded-full text-xs font-semibold text-[--color-davay-text] border border-[--color-davay-hint]/30">
                                    <MapPin size={12} className="text-[--color-davay-primary]" />
                                    {city}
                                </div>
                            ))}
                            {cities.length > 4 && <div className="text-sm text-[--color-davay-muted] font-medium flex items-center">+{cities.length - 4} more</div>}
                        </div>
                    )}

                    {/* Ownership History list */}
                    <div className="bg-[var(--color-davay-card)] p-4 rounded-2xl shadow-sm border border-[var(--color-davay-hint)]/20">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-davay-muted)] mb-4 ml-1">Journey</h3>
                        <div className="flex flex-col gap-4 relative">
                            <div className="absolute left-5 top-5 bottom-5 w-px bg-[var(--color-davay-hint)]/30"></div>

                            {lighter.history_entries.slice(0, 4).map((history, idx) => (
                                <div key={history.id} className="flex items-start gap-4 relative">
                                    {idx === 0 ? (
                                        <div className="w-10 h-10 rounded-full bg-[var(--color-davay-primary-light)] flex items-center justify-center font-bold text-xs text-[var(--color-davay-primary)] border-2 border-[var(--color-davay-primary)] z-10 shrink-0 shadow-sm shadow-[var(--color-davay-primary)]/20">
                                            {history.owner.username.substring(0, 2).toUpperCase()}
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500 border-2 border-white z-10 shrink-0 shadow-sm">
                                            {history.owner.username.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}

                                    <div className="flex flex-col justify-center min-h-[40px]">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${idx === 0 ? 'text-[var(--color-davay-text)]' : 'text-gray-600'}`}>{history.owner.username}</span>
                                            {idx === 0 && <span className="text-[9px] font-bold uppercase tracking-wider bg-[var(--color-davay-primary)] text-white px-1.5 py-0.5 rounded-sm">Now</span>}
                                        </div>
                                        <div className="text-xs text-[var(--color-davay-muted)] font-medium mt-0.5">
                                            {format(history.captured_at, 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {lighter.history_entries.length > 4 && (
                                <div className="pl-14 text-xs font-bold text-[var(--color-davay-hint)] uppercase tracking-wider mt-2">
                                    + {lighter.history_entries.length - 4} PREVIOUS OWNERS
                                </div>
                            )}
                        </div>
                    </div>

                    <CaptureClientButton
                        lighterId={lighter.id}
                        isLoggedIn={!!currentUser}
                        alreadyOwns={alreadyOwns}
                        ownerIndex={lighter.history_entries.length + 1}
                    />

                    <button className="flex w-full mt-2 items-center justify-center gap-2 py-4 rounded-xl font-bold bg-transparent border-2 border-[var(--color-davay-hint)]/30 text-[var(--color-davay-muted)] hover:text-black hover:border-black/50 transition-colors">
                        <Share2 size={18} />
                        Share Lighter
                    </button>
                </div>
            </div>
        </>
    );
}
