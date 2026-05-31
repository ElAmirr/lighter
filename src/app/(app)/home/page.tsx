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
        take: 3,
        include: { collection: true, rarity: true }
    });

    return (
        <>
            <TopBar />
            <div className="flex flex-col p-4 gap-6">
                {/* Feeds Removed Successfully */}

                {/* Hot Right Now */}
                <div>
                    <h2 className="text-lg font-bold tracking-widest text-[var(--color-davay-text)] mb-3">HOT RIGHT NOW</h2>
                    <div className="flex flex-col gap-2">
                        {hotLighters.map((lighter, i) => {
                            const { bg, text, icon: Icon } = getEditionStyles(lighter.collection?.name || 'Default');
                            const rarityStyle = getRarityStyle(lighter.rarity?.name || 'Common');
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
                                        {lighter.rarity?.name || 'Common'}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div >
        </>
    );
}
