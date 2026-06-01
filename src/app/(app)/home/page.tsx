"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { MapPin, Flame, Leaf, Droplet, Star, Circle } from 'lucide-react';

// ──────────────────────────────────────────────
// Ordinal helper
// ──────────────────────────────────────────────
function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ──────────────────────────────────────────────
// Edition config
// ──────────────────────────────────────────────
const editionMap: Record<string, { bg: string; icon: any; iconColor: string }> = {
    Tunis: { bg: '#FDF0EA', icon: Flame, iconColor: '#D85A30' },
    Sfax: { bg: '#EAF3DE', icon: Leaf, iconColor: '#3B6D11' },
    Sahel: { bg: '#E6F1FB', icon: Droplet, iconColor: '#185FA5' },
    Meme: { bg: '#FBEAF0', icon: Star, iconColor: '#993556' },
    Carthage: { bg: '#EEEDFE', icon: Star, iconColor: '#534AB7' },
    Default: { bg: '#EFEDE8', icon: Circle, iconColor: '#888' },
};
function getEdition(name: string) { return editionMap[name] || editionMap.Default; }

// ──────────────────────────────────────────────
// Rarity badge style
// ──────────────────────────────────────────────
const rarityMap: Record<string, { bg: string; text: string }> = {
    Legendary: { bg: '#FAECE7', text: '#993C1D' },
    Epic: { bg: '#EEEDFE', text: '#534AB7' },
    Rare: { bg: '#E6F1FB', text: '#185FA5' },
    Uncommon: { bg: '#EAF3DE', text: '#3B6D11' },
    Common: { bg: '#EFEDE8', text: '#5F5E5A' },
};
function getRarity(name: string) { return rarityMap[name] || rarityMap.Common; }

// ──────────────────────────────────────────────
// Edition Thumbnail
// ──────────────────────────────────────────────
function EditionThumb({ collection, size = 52, image }: { collection: string; size?: number; image?: string | null }) {
    const { bg, icon: Icon, iconColor } = getEdition(collection);
    if (image) {
        return (
            <div style={{ width: 40, height: size, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                <img src={image} alt={collection} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
        );
    }
    return (
        <div style={{ width: 40, height: size, borderRadius: 10, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={20} color={iconColor} strokeWidth={1.5} />
        </div>
    );
}

// ──────────────────────────────────────────────
// Feed Card
// ──────────────────────────────────────────────
function FeedCard({ item }: { item: any }) {
    const rarity = getRarity(item.rarity);
    const timeAgo = formatDistanceToNow(new Date(item.captured_at), { addSuffix: true });

    return (
        <Link href={`/l/${item.lighter_id}`}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(0,0,0,0.06)', position: 'relative' }}>
                <EditionThumb collection={item.collection} image={item.lighter_image} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, margin: 0 }}>
                        <span style={{ fontWeight: 600 }}>{item.username}</span>
                        {' captured '}
                        <span style={{ fontWeight: 700, color: '#D85A30' }}>{item.lighter_name}</span>
                    </p>
                    <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>
                        {timeAgo} · {item.city_name}
                    </p>
                    <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>
                        {getOrdinal(item.owner_number)} owner · {item.scan_count} scans
                    </p>
                </div>
                <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, background: rarity.bg, color: rarity.text, borderRadius: 20, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {item.rarity}
                </span>
            </div>
        </Link>
    );
}

// ──────────────────────────────────────────────
// Hot Row
// ──────────────────────────────────────────────
function HotRow({ item, rank }: { item: any; rank: number }) {
    const rarity = getRarity(item.rarity);
    return (
        <Link href={`/l/${item.lighter_id}`}>
            <div style={{ background: '#fff', borderRadius: 14, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(0,0,0,0.06)' }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#D85A30', width: 18, flexShrink: 0 }}>{rank}</span>
                <EditionThumb collection={item.collection} size={40} image={item.lighter_image} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.lighter_name}</p>
                    <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{item.scans_today} scans today</p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, background: rarity.bg, color: rarity.text, borderRadius: 20, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
                    {item.rarity}
                </span>
            </div>
        </Link>
    );
}

// ──────────────────────────────────────────────
// Home Page
// ──────────────────────────────────────────────
export default function HomePage() {
    const [feed, setFeed] = useState<any[]>([]);
    const [hot, setHot] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const latestIdRef = useRef<string | null>(null);

    const loadFeed = async (prepend = false) => {
        try {
            const [feedRes, hotRes] = await Promise.all([
                fetch('/api/feed'),
                fetch('/api/hot-today'),
            ]);
            const feedData = await feedRes.json();
            const hotData = await hotRes.json();

            if (prepend && latestIdRef.current && Array.isArray(feedData)) {
                const latestIdx = feedData.findIndex((f: any) => f.id === latestIdRef.current);
                const newItems = latestIdx > 0 ? feedData.slice(0, latestIdx) : [];
                if (newItems.length > 0) {
                    setFeed(prev => [...newItems, ...prev]);
                }
            } else {
                setFeed(feedData || []);
            }

            if (feedData?.length > 0) latestIdRef.current = feedData[0].id;
            setHot(hotData || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFeed(false);
        const interval = setInterval(() => loadFeed(true), 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--color-davay-bg)', paddingBottom: 80 }}>
            {/* Header */}
            <div style={{ background: 'var(--color-davay-card)', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '14px 16px', position: 'sticky', top: 0, zIndex: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href="/home" style={{ fontSize: 18, fontWeight: 900, letterSpacing: '0.12em', textDecoration: 'none', color: 'var(--color-davay-text)' }}>
                    DA<span style={{ color: '#D85A30' }}>V</span>AY
                </a>
                {/* Live indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FEF0EA', borderRadius: 20, padding: '4px 10px' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#D85A30', animation: 'davay-pulse 1.5s ease-in-out infinite' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#D85A30', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live</span>
                </div>
            </div>

            <div style={{ padding: '14px 14px 0' }}>
                {/* Hot right now */}
                {hot.length > 0 && (
                    <div style={{ marginBottom: 18 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Hot right now</p>
                        {hot.map((item, i) => <HotRow key={item.lighter_id} item={item} rank={i + 1} />)}
                    </div>
                )}

                {/* Live feed */}
                <p style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Live captures</p>

                {loading && (
                    <div style={{ textAlign: 'center', padding: 40, color: '#bbb', fontSize: 14 }}>Loading…</div>
                )}
                {!loading && feed.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: '#bbb', fontSize: 14 }}>No captures yet. Scan a lighter!</div>
                )}
                {feed.map((item: any) => <FeedCard key={item.id} item={item} />)}
            </div>

            <style>{`
                @keyframes davay-pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
