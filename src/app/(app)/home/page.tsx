"use client";

import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Flame, Leaf, Droplet, Star, Circle } from 'lucide-react';

// ── Ordinal ───────────────────────────────────────────────
function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ── Edition config ────────────────────────────────────────
const editionMap: Record<string, { bg: string; icon: any; iconColor: string }> = {
    Tunis: { bg: '#FDF0EA', icon: Flame, iconColor: '#D85A30' },
    Sfax: { bg: '#EAF3DE', icon: Leaf, iconColor: '#3B6D11' },
    Sahel: { bg: '#E6F1FB', icon: Droplet, iconColor: '#185FA5' },
    Meme: { bg: '#FBEAF0', icon: Star, iconColor: '#993556' },
    Carthage: { bg: '#EEEDFE', icon: Star, iconColor: '#534AB7' },
    Default: { bg: '#EFEDE8', icon: Circle, iconColor: '#888' },
};
function getEdition(name: string) { return editionMap[name] || editionMap.Default; }

const rarityMap: Record<string, { bg: string; text: string }> = {
    Legendary: { bg: '#FAECE7', text: '#993C1D' },
    Epic: { bg: '#EEEDFE', text: '#534AB7' },
    Rare: { bg: '#E6F1FB', text: '#185FA5' },
    Uncommon: { bg: '#EAF3DE', text: '#3B6D11' },
    Common: { bg: '#EFEDE8', text: '#5F5E5A' },
};
function getRarity(name: string) { return rarityMap[name] || rarityMap.Common; }

// ── Edition Thumbnail ─────────────────────────────────────
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
        <div style={{ width: 40, height: size, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={20} color={iconColor} strokeWidth={1.5} />
        </div>
    );
}

// ── Skeleton card ─────────────────────────────────────────
function FeedCardSkeleton() {
    return (
        <div style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 16, marginBottom: 10, border: '1px solid var(--border)' }}>
            <div className="skeleton" style={{ width: 40, height: 52, borderRadius: 10, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ height: 14, width: '75%' }} />
                <div className="skeleton" style={{ height: 11, width: '50%' }} />
                <div className="skeleton" style={{ height: 11, width: '35%' }} />
            </div>
        </div>
    );
}

function HotRowSkeleton() {
    return (
        <div style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 14, marginBottom: 8, border: '1px solid var(--border)', alignItems: 'center' }}>
            <div className="skeleton" style={{ width: 18, height: 18, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div className="skeleton" style={{ height: 13, width: '60%' }} />
                <div className="skeleton" style={{ height: 11, width: '40%' }} />
            </div>
        </div>
    );
}

// ── Feed Card ─────────────────────────────────────────────
function FeedCard({ item, isNew }: { item: any; isNew?: boolean }) {
    const rarity = getRarity(item.rarity);
    const timeAgo = formatDistanceToNow(new Date(item.captured_at), { addSuffix: true });

    return (
        <Link href={`/l/${item.lighter_id}`}>
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: 16, padding: '12px 14px', marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 12,
                border: '1px solid var(--border)', position: 'relative',
                animation: isNew ? 'slide-down 250ms ease-out' : undefined,
            }}>
                <EditionThumb collection={item.collection} image={item.lighter_image} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, margin: 0, color: 'var(--text-1)' }}>
                        <span style={{ fontWeight: 600 }}>{item.username}</span>
                        {' captured '}
                        <span style={{ fontWeight: 700, color: '#D85A30' }}>{item.lighter_name}</span>
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '2px 0 0' }}>
                        {timeAgo} · {item.city_name}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '2px 0 0' }}>
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

// ── Hot Row ───────────────────────────────────────────────
function HotRow({ item, rank }: { item: any; rank: number }) {
    const rarity = getRarity(item.rarity);
    return (
        <Link href={`/l/${item.lighter_id}`}>
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#D85A30', width: 18, flexShrink: 0 }}>{rank}</span>
                <EditionThumb collection={item.collection} size={40} image={item.lighter_image} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-1)' }}>{item.lighter_name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '2px 0 0' }}>{item.scans_today} scans today</p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, background: rarity.bg, color: rarity.text, borderRadius: 20, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
                    {item.rarity}
                </span>
            </div>
        </Link>
    );
}

// ══════════════════════════════════════════════════════════
// Home Page
// ══════════════════════════════════════════════════════════
const loadingMessages = [
    "Tracking the lighter...",
    "Reading the history...",
    "Loading the story...",
    "Connecting to the streets...",
];

export default function HomePage() {
    const [feed, setFeed] = useState<any[]>([]);
    const [hot, setHot] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newIds, setNewIds] = useState<Set<string>>(new Set());
    const latestIdRef = useRef<string | null>(null);
    const loadingMsg = useRef(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);

    const loadFeed = async (prepend = false) => {
        try {
            const [feedRes, hotRes] = await Promise.all([fetch('/api/feed'), fetch('/api/hot-today')]);
            const [feedData, hotData] = await Promise.all([feedRes.json(), hotRes.json()]);

            if (prepend && latestIdRef.current && Array.isArray(feedData)) {
                const latestIdx = feedData.findIndex((f: any) => f.id === latestIdRef.current);
                const newItems = latestIdx > 0 ? feedData.slice(0, latestIdx) : [];
                if (newItems.length > 0) {
                    const newSet = new Set(newItems.map((i: any) => i.id));
                    setNewIds(newSet);
                    setFeed(prev => [...newItems, ...prev]);
                    setTimeout(() => setNewIds(new Set()), 1000);
                }
            } else {
                setFeed(feedData || []);
            }
            if (feedData?.length > 0) latestIdRef.current = feedData[0].id;
            setHot(hotData || []);
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => {
        const timer = setTimeout(() => loadFeed(false), 300); // min 300ms skeleton
        const interval = setInterval(() => loadFeed(true), 30000);
        return () => { clearTimeout(timer); clearInterval(interval); };
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--bg)', paddingBottom: 80 }}>
            {/* Header */}
            <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '14px 16px', position: 'sticky', top: 0, zIndex: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '0.12em', color: 'var(--text-1)' }}>
                    DA<span style={{ color: '#D85A30' }}>V</span>AY
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-sub)', borderRadius: 20, padding: '4px 10px' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#D85A30', display: 'inline-block', animation: 'pulse-dot 1.5s infinite ease-in-out' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#D85A30', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live</span>
                </div>
            </div>

            <div style={{ padding: '14px 14px 0' }}>
                {/* Hot right now */}
                {loading ? (
                    <>
                        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Hot right now</p>
                        <HotRowSkeleton /><HotRowSkeleton /><HotRowSkeleton />
                    </>
                ) : hot.length > 0 && (
                    <div style={{ marginBottom: 18 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Hot right now</p>
                        {hot.map((item, i) => <HotRow key={item.lighter_id} item={item} rank={i + 1} />)}
                    </div>
                )}

                {/* Live feed */}
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Live captures</p>

                {loading && (
                    <>
                        <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12, fontStyle: 'italic' }}>{loadingMsg.current}</p>
                        {[1, 2, 3, 4].map(i => <FeedCardSkeleton key={i} />)}
                    </>
                )}
                {!loading && feed.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
                        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-1)', marginBottom: 6 }}>The streets are quiet... for now</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Be the first to capture a DAVAY lighter 🔥</div>
                    </div>
                )}
                {feed.map((item: any) => <FeedCard key={item.id} item={item} isNew={newIds.has(item.id)} />)}
            </div>
        </div>
    );
}
