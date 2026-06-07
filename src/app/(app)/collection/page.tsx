import { prisma } from '@/lib/prisma';
import TopBar from '@/components/layout/TopBar';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { Flame, Leaf, Droplet, Star, Circle } from 'lucide-react';
import Link from 'next/link';


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

export default async function CollectionPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    let currentUser = null;
    if (token) {
        const payload = verifyToken(token) as any;
        if (payload) currentUser = payload.userId;
    }

    // We are just showing all discovered lighters grouped by collection
    const lighters = await prisma.lighter.findMany({
        where: currentUser ? {
            history_entries: { some: { owner_id: currentUser } }
        } : undefined,
        include: { collection: true, rarity: true }
    });

    const allLighters = await prisma.lighter.findMany({ select: { collection: true } });
    const defaultCategories = ['Tunis', 'Sfax', 'Sahel', 'Meme', 'Carthage', 'Default'];
    const dbCategories = Array.from(new Set(allLighters.map(l => l.collection.name)));
    const categories = Array.from(new Set([...defaultCategories, ...dbCategories]));

    return (
        <>
            <TopBar rightLabel="Collection" />
            <div className="flex flex-col p-4 gap-6 pb-10">
                <h1 className="text-2xl font-bold tracking-tight mb-2">My Discoveries</h1>

                {categories.map(category => {
                    const categoryLighters = lighters.filter(l => l.collection?.name === category);
                    const { bg, text, icon: Icon } = getEditionStyles(category);

                    if (categoryLighters.length === 0) return null;

                    return (
                        <div key={category} className="mb-4">
                            <h2 className={`text-xs font-bold tracking-widest uppercase mb-3 flex items-center gap-2 ${text}`}>
                                <Icon size={14} /> {category} COLLECTION ({categoryLighters.length})
                            </h2>

                            <div className="grid grid-cols-2 gap-3">
                                {categoryLighters.map(lighter => {
                                    const img = lighter.image_url || lighter.collection?.image_url;

                                    return (
                                        <Link href={`/l/${lighter.id}`} key={lighter.id}
                                            className="flex flex-col rounded-2xl shadow-sm border border-[var(--border)] active:scale-95 transition-transform overflow-hidden relative pb-3 bg-[var(--bg-card)]">

                                            {/* Trading Card Image Area */}
                                            <div className={`w-full aspect-[4/5] flex items-center justify-center relative ${img ? 'bg-[var(--bg-sub)]' : bg}`}>
                                                {img ? (
                                                    <img src={img} alt={lighter.name} className="absolute inset-0 w-full h-full object-cover" />
                                                ) : (
                                                    <Icon size={40} className={`opacity-80 ${text}`} />
                                                )}

                                                {/* Top Overlay Badges */}
                                                <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                                                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded backdrop-blur-sm bg-black/60 text-white shadow-sm">
                                                        #{lighter.id.slice(0, 3)}
                                                    </span>
                                                    <span className="text-[9px] font-extrabold uppercase tracking-wider bg-[var(--text-1)] text-[#121212] px-1.5 py-0.5 rounded shadow-sm">
                                                        {lighter.rarity?.name}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Bottom Card Info */}
                                            <div className="px-3 pt-2">
                                                <span className="font-extrabold text-sm leading-snug mt-1 opacity-90 text-[var(--text-1)] line-clamp-1">{lighter.name}</span>
                                                <span className="text-[10px] font-bold text-[var(--text-3)] mt-0.5 block">{lighter.scan_count || 0} SCANS</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {lighters.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px 24px', marginTop: 16 }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-1)', marginBottom: 6 }}>Your vault is empty</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Find a DAVAY lighter and make it yours</div>
                    </div>
                )}

            </div>
        </>
    );
}
