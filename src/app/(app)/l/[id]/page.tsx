// @ts-nocheck
import { prisma } from '@/lib/prisma';
import TopBar from '@/components/layout/TopBar';
import { notFound } from 'next/navigation';
import CaptureClientButton from './CaptureClientButton';
import { format, formatDistance } from 'date-fns';
import { Flame, Leaf, Droplet, Star, Circle, MapPin } from 'lucide-react';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';


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
        case 'Common': return { bg: 'bg-[var(--color-rarity-common)]', text: 'text-[var(--color-rarity-common-text)]' };
        case 'Uncommon': return { bg: 'bg-[var(--color-rarity-uncommon)]', text: 'text-[var(--color-rarity-uncommon-text)]' };
        case 'Rare': return { bg: 'bg-[var(--color-rarity-rare)]', text: 'text-[var(--color-rarity-rare-text)]' };
        case 'Epic': return { bg: 'bg-[var(--color-rarity-epic)]', text: 'text-[var(--color-rarity-epic-text)]' };
        case 'Legendary': return { bg: 'bg-[var(--color-rarity-legendary)]', text: 'text-[var(--color-rarity-legendary-text)]' };
        default: return { bg: 'bg-gray-100', text: 'text-gray-500' };
    }
}

export default async function LighterProfile({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const lighter = await prisma.lighter.findUnique({
        where: { id: resolvedParams.id },
        include: {
            current_owner: true,
            history_entries: {
                orderBy: { captured_at: 'desc' },
                include: { owner: true }
            },
            collection: true,
            rarity: true
        }
    });

    if (!lighter) return notFound();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    let currentUser = null;
    if (token) {
        const payload = verifyToken(token) as any;
        if (payload) currentUser = payload.userId;
    }

    const editionConf = getEditionStyles(lighter.collection?.name || 'Default');
    const rarityStyle = getRarityStyle(lighter.rarity?.name || 'Common');

    // Calculate distinct cities
    const cities = Array.from(new Set(lighter.history_entries.filter(h => h.city_name).map(h => h.city_name)));
    const distinctOwners = lighter.history_entries.length === 0 ? 0 : new Set(lighter.history_entries.map(h => h.owner_id)).size;
    const totalScans = lighter.scan_count ?? 0;
    const firstCapture = lighter.history_entries.length > 0
        ? lighter.history_entries.reduce((a, b) => a.captured_at < b.captured_at ? a : b).captured_at
        : null;

    const alreadyOwns = lighter.current_owner_id === currentUser;

    const heroImage = lighter.image_url || lighter.collection?.image_url || null;

    return (
        <>
            <TopBar rightLabel={`davay.tn/l/${lighter.id.slice(0, 6)}`} />
            <div className="flex flex-col flex-1 pb-10">

                {/* Edition Card */}
                <div className={`w-full h-72 flex flex-col items-center justify-center relative overflow-hidden shadow-sm border-b border-[var(--border)] ${heroImage ? '' : editionConf.bg} p-6`}>
                    {heroImage ? (
                        <>
                            <img src={heroImage} alt={lighter.name} className="absolute inset-0 w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/30" />
                        </>
                    ) : (
                        <editionConf.icon size={100} className={`mb-4 opacity-90 ${editionConf.text}`} strokeWidth={1} />
                    )}
                    <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full rarity-badge rarity-${(lighter.rarity?.name || 'Common').toLowerCase()} ${rarityStyle.bg} ${rarityStyle.text}`}>
                            {lighter.rarity?.name}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${heroImage ? 'bg-white/40 text-white' : 'bg-[var(--text-1)]/10 text-[var(--text-1)]'}`}>
                            {lighter.collection?.name}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${heroImage ? 'bg-white/40 text-white' : 'bg-[var(--text-1)]/10 text-[var(--text-1)]'}`}>
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

                        {/* ORIGIN badge — only shows when no one has owned it yet */}
                        {lighter.history_entries.length === 0 && (
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,165,0,0.08))',
                                border: '1px solid rgba(255,215,0,0.5)',
                                borderRadius: 20, padding: '8px 16px', marginTop: 12,
                                boxShadow: '0 0 16px rgba(255,215,0,0.15)',
                            }}>
                                <span style={{ fontSize: 16 }}>👑</span>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 900, color: '#FFD700', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Origin</div>
                                    <div style={{ fontSize: 10, color: '#B8972A', fontWeight: 600 }}>Never been owned — be the first</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 4-stat grid */}
                    <div className="grid grid-cols-4 gap-2 w-full">
                        <div className="bg-[--color-davay-bg] py-3 rounded-xl border border-[--color-davay-hint]/20 text-center">
                            <div className="text-[10px] font-bold tracking-wider text-[var(--text-3)] uppercase mb-0.5">Owners</div>
                            <div className="text-xl font-extrabold text-[--color-davay-primary]">{distinctOwners}</div>
                        </div>
                        <div className="bg-[--color-davay-bg] py-3 rounded-xl border border-[--color-davay-hint]/20 text-center">
                            <div className="text-[10px] font-bold tracking-wider text-[var(--text-3)] uppercase mb-0.5">Cities</div>
                            <div className="text-xl font-extrabold text-[--color-davay-primary]">{cities.length}</div>
                        </div>
                        <div className="bg-[--color-davay-bg] py-3 rounded-xl border border-[--color-davay-hint]/20 text-center">
                            <div className="text-[10px] font-bold tracking-wider text-[var(--text-3)] uppercase mb-0.5">Scans</div>
                            <div className="text-xl font-extrabold text-[--color-davay-primary]">{totalScans}</div>
                        </div>
                        <div className="bg-[--color-davay-bg] py-3 rounded-xl border border-[--color-davay-hint]/20 text-center">
                            <div className="text-[10px] font-bold tracking-wider text-[var(--text-3)] uppercase mb-0.5">Alive</div>
                            <div className="text-[11px] font-extrabold text-[--color-davay-primary] leading-tight px-1">
                                {firstCapture ? formatDistance(new Date(firstCapture), new Date(), { addSuffix: false }) : '—'}
                            </div>
                        </div>
                    </div>

                    {/* City pills */}
                    {cities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {cities.slice(0, 5).map((city, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-[--color-davay-bg] rounded-full text-xs font-semibold text-[--color-davay-text] border border-[--color-davay-hint]/30">
                                    <MapPin size={12} className="text-[--color-davay-primary]" />
                                    {city}
                                </div>
                            ))}
                            {cities.length > 5 && <div className="text-sm text-[--color-davay-muted] font-medium flex items-center">+{cities.length - 5} more</div>}
                        </div>
                    )}

                    {/* Ownership History */}
                    <div className="bg-[var(--color-davay-card)] p-4 rounded-2xl shadow-sm border border-[var(--color-davay-hint)]/20">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-davay-muted)] mb-4 ml-1">Journey</h3>
                        <div className="flex flex-col gap-4 relative">
                            <div className="absolute left-5 top-5 bottom-5 w-px bg-[var(--color-davay-hint)]/30 border-l border-dashed border-[var(--border)]"></div>

                            {lighter.history_entries.slice(0, 4).map((history, idx) => (
                                <div key={history.id} className="flex items-start gap-4 relative">
                                    {idx === 0 ? (
                                        <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center font-bold text-xs text-[var(--accent)] border-2 border-[var(--accent)] z-10 shrink-0 shadow-sm shadow-[var(--accent)]/20">
                                            {history.owner.username.substring(0, 2).toUpperCase()}
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-[var(--bg-sub)] flex items-center justify-center font-bold text-xs text-[var(--text-2)] border-2 border-[var(--bg-card)] z-10 shrink-0 shadow-sm">
                                            {history.owner.username.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex flex-col justify-center min-h-[40px]">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${idx === 0 ? 'text-[var(--text-1)]' : 'text-[var(--text-2)]'}`}>{history.owner.username}</span>
                                            {idx === 0 && <span className="text-[9px] font-bold uppercase tracking-wider bg-[var(--accent)] text-white px-1.5 py-0.5 rounded-sm">Now</span>}
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
                        lighterName={lighter.name}
                        collection={lighter.collection?.name || 'Default'}
                        isLoggedIn={!!currentUser}
                        alreadyOwns={alreadyOwns}
                        ownerIndex={lighter.history_entries.length + 1}
                    />
                </div>
            </div>
        </>
    );
}

