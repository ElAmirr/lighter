import { PrismaClient } from '@prisma/client';
import TopBar from '@/components/layout/TopBar';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { Flame, Leaf, Droplet, Star, Circle } from 'lucide-react';
import Link from 'next/link';

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
                                {categoryLighters.map(lighter => (
                                    <Link href={`/l/${lighter.id}`} key={lighter.id} className={`flex flex-col p-3 rounded-2xl shadow-sm border border-black/5 active:scale-95 transition-transform ${bg}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold opacity-50 mix-blend-darken">#{lighter.id.slice(0, 3)}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-wider bg-white/40 mix-blend-darken px-1.5 py-0.5 rounded-sm">{lighter.rarity?.name}</span>
                                        </div>
                                        <Icon size={32} className={`my-2 opacity-80 ${text}`} />
                                        <span className="font-bold text-sm leading-snug mt-1 opacity-90 mix-blend-darken">{lighter.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {lighters.length === 0 && (
                    <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-3xl mt-4 text-gray-400 font-medium">
                        You haven't discovered any lighters yet. Start scanning!
                    </div>
                )}

            </div>
        </>
    );
}
