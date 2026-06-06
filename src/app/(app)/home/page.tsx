"use client";

import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Flame, Leaf, Droplet, Star, Circle, MessageSquare, Share2 } from 'lucide-react';
import PushNotificationManager from '@/components/PushNotificationManager';

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
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, marginBottom: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ width: 80, height: 14, marginBottom: 4 }} />
                    <div className="skeleton" style={{ width: 50, height: 10 }} />
                </div>
            </div>
            <div className="skeleton" style={{ width: '100%', aspectRatio: '4/5' }} />
            <div style={{ padding: '14px' }}>
                <div className="skeleton" style={{ width: '100%', height: 14, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: '60%', height: 14 }} />
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

    // Fallback lighter image
    const fallbackImgs = [
        'https://images.unsplash.com/photo-1596484552993-8ad5fc0b91e9?w=600&q=80',
        'https://images.unsplash.com/photo-1629851609101-72af4d310ea0?w=600&q=80'
    ];
    const lighterImage = item.lighter_image || fallbackImgs[item.lighter_id.charCodeAt(0) % 2];

    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: 16, marginBottom: 20,
            border: '1px solid var(--border)', overflow: 'hidden',
            animation: isNew ? 'slide-down 400ms ease-out' : undefined,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
            {/* Post Header */}
            <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href={`/u/${item.username}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#eee', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        {item.user_avatar ? (
                            <img src={item.user_avatar} alt={item.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: '#D85A30' }}></div>
                        )}
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{item.username}</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-3)' }}>{item.city_name}</p>
                    </div>
                </Link>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, background: rarity.bg, color: rarity.text, borderRadius: 20, padding: '3px 8px', textTransform: 'uppercase' }}>
                        {item.rarity}
                    </span>
                </div>
            </div>

            {/* Post Image Showcase */}
            <div style={{ width: '100%', aspectRatio: '4/5', background: '#f5f5f5', position: 'relative' }}>
                <img src={lighterImage} alt="Lighter" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                {/* Overlay Badge for Owner Number */}
                <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', color: 'white', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Flame size={14} color="#D85A30" />
                    <span>Owner #{item.owner_number}</span>
                </div>
            </div>

            {/* Post Actions & Caption */}
            <div style={{ padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Link href={`/l/${item.lighter_id}`} style={{ border: '2px solid #D85A30', backgroundColor: '#D85A30', color: 'white', padding: '6px 16px', borderRadius: 24, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Flame size={16} fill="white" /> Steal Back
                        </Link>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{timeAgo}</p>
                </div>

                <p style={{ fontSize: 14, margin: '0 0 8px', color: 'var(--text-1)', lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 800 }}>{item.username}</span> captured <span style={{ fontWeight: 800, color: '#D85A30' }}>{item.lighter_name}</span>
                    {item.stolen_from && <span style={{ fontWeight: 600, color: 'var(--text-2)' }}> (stolen from {item.stolen_from} 🛑)</span>}
                </p>

                {item.message && (
                    <div style={{ background: 'var(--bg-sub)', padding: '10px 14px', borderRadius: 12, marginTop: 8, borderLeft: '4px solid #D85A30' }}>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-1)', fontStyle: 'italic' }}>"{item.message}"</p>
                    </div>
                )}

                <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0, fontWeight: 700 }}>
                        {item.scan_count} TOTAL SCANS
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0, fontWeight: 700 }}>
                        EDITION {item.collection.toUpperCase()}
                    </p>
                </div>
            </div>
        </div>
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
    const [loadingMsg, setLoadingMsg] = useState(loadingMessages[0]);
    const latestIdRef = useRef<string | null>(null);

    const loadFeed = async (prepend = false) => {
        try {
            const [feedRes, hotRes] = await Promise.all([fetch('/api/feed?today=true'), fetch('/api/hot-today')]);
            const [feedData, hotData] = await Promise.all([feedRes.json(), hotRes.json()]);

            const safeFeed = Array.isArray(feedData) ? feedData : [];
            const safeHot = Array.isArray(hotData) ? hotData : [];

            if (prepend && latestIdRef.current && safeFeed.length > 0) {
                const latestIdx = safeFeed.findIndex((f: any) => f.id === latestIdRef.current);
                const newItems = latestIdx > 0 ? safeFeed.slice(0, latestIdx) : [];
                if (newItems.length > 0) {
                    const newSet = new Set(newItems.map((i: any) => i.id));
                    setNewIds(newSet);
                    setFeed(prev => [...newItems, ...prev]);
                    setTimeout(() => setNewIds(new Set()), 1000);
                }
            } else {
                setFeed(safeFeed);
            }
            if (safeFeed.length > 0) latestIdRef.current = safeFeed[0].id;
            setHot(safeHot);
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => {
        // Set random loading message on client only (avoids SSR hydration mismatch)
        setLoadingMsg(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
        const timer = setTimeout(() => loadFeed(false), 300);
        const interval = setInterval(() => loadFeed(true), 30000);
        return () => { clearTimeout(timer); clearInterval(interval); };
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--bg)', paddingBottom: 80 }}>
            {/* Header */}
            <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '14px 16px', position: 'sticky', top: 0, zIndex: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-arabic), serif', letterSpacing: '0.04em', color: 'var(--text-1)' }}>
                    DA<span style={{ color: '#D85A30' }}>VAY</span>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-sub)', borderRadius: 20, padding: '4px 10px' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#D85A30', display: 'inline-block', animation: 'pulse-dot 1.5s infinite ease-in-out' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#D85A30', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live</span>
                </div>
            </div>

            <div style={{ padding: '14px 14px 0' }}>
                <PushNotificationManager />

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

                {/* Today's captures */}
                <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Live Feed</p>

                {loading && (
                    <>
                        <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12, fontStyle: 'italic' }}>{loadingMsg}</p>
                        {[1, 2, 3].map(i => <FeedCardSkeleton key={i} />)}
                    </>
                )}
                {!loading && feed.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
                        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-1)', marginBottom: 6 }}>The streets are quiet...</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Be the first one to capture a lighter today!</div>
                    </div>
                )}
                {feed.map((item: any) => <FeedCard key={item.id} item={item} isNew={newIds.has(item.id)} />)}
            </div>
        </div>
    );
}
