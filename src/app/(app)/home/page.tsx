import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, User, Flame, Leaf, Droplet, Star, Circle } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';

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

export default async function Home() {
    const recentCaptures = await prisma.ownershipHistory.findMany({
        orderBy: { captured_at: 'desc' },
        take: 10,
        include: {
            lighter: true,
            owner: true
        }
    });

    const hotLighters = await prisma.lighter.findMany({
        orderBy: { scan_count: 'desc' },
        take: 3
    });

    return (
        <>
            <TopBar />
            <div className="flex flex-col p-4 gap-6">
                {/* Live captures header */}
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-white border border-[var(--color-davay-primary)]/30 rounded-full flex items-center gap-2 shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-davay-primary)] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-davay-primary)]"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-davay-primary)]">Live Captures</span>
                    </div>
                </div>

                {/* Feed */}
                <div className="flex flex-col gap-3">
                    {recentCaptures.map((capture, idx) => {
                        const { bg, text, icon: Icon } = getEditionStyles(capture.lighter.collection);
                        const rarityStyle = getRarityStyle(capture.lighter.rarity);

                        return (
                            <Link href={`/l/${capture.lighter.id}`} key={capture.id} className="block w-full">
                                <div className="bg-white rounded-2xl p-3 border border-[var(--color-davay-hint)]/20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-transform relative">
                                    <div className="flex gap-4 items-center">
                                        {/* Thumbnail */}
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                                            <Icon size={24} className={text} strokeWidth={2.5} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm">
                                                    <span className="font-bold text-[var(--color-davay-text)]">{capture.owner.username}</span> got
                                                    <span className="font-bold text-[var(--color-davay-primary)] ml-1">
                                                        {capture.lighter.name}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[var(--color-davay-muted)] font-medium">
                                                <span>{formatDistanceToNow(capture.captured_at, { addSuffix: true })}</span>
                                                <span>•</span>
                                                <MapPin size={10} className="inline mr-0.5" />
                                                <span>{capture.city_name}</span>
                                            </div>

                                            <div className="flex gap-3 mt-2 text-[10px] font-bold text-[var(--color-davay-hint)] uppercase tracking-wider">
                                                <span>{capture.lighter.scan_count} SCANS</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Badge absolute */}
                                    <div className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${rarityStyle}`}>
                                        {capture.lighter.rarity}
                                    </div>
                                </div>
                            </Link>
                        )
                    })}

                    {recentCaptures.length === 0 && (
                        <div className="text-center p-8 bg-[var(--color-davay-card)] rounded-2xl border border-[var(--color-davay-hint)]/20">
                            <p className="text-[var(--color-davay-muted)] text-sm font-medium">No captures yet. Scan a lighter to be the first!</p>
                        </div>
                    )}
                </div>

                {/* Hot Right Now */}
                <div>
                    <h2 className="text-lg font-bold tracking-widest text-[var(--color-davay-text)] mb-3">HOT RIGHT NOW</h2>
                    <div className="flex flex-col gap-2">
                        {hotLighters.map((lighter, i) => {
                            const { bg, text, icon: Icon } = getEditionStyles(lighter.collection);
                            const rarityStyle = getRarityStyle(lighter.rarity);
                            return (
                                <Link href={`/l/${lighter.id}`} key={lighter.id} className="flex items-center gap-3 bg-[var(--color-davay-card)] p-2 rounded-xl border border-[var(--color-davay-hint)]/20 active:scale-95 transition-transform">
                                    <div className="font-bold text-[var(--color-davay-hint)] w-4 text-center">{i + 1}</div>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                                        <Icon size={18} className={text} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm">{lighter.name}</div>
                                        <div className="text-[10px] text-[var(--color-davay-primary)] font-bold tracking-wide uppercase">{lighter.scan_count} Scans</div>
                                    </div>
                                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rarityStyle}`}>
                                        {lighter.rarity}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
