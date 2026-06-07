"use client";

import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Flame, ShieldAlert, Zap, MapPin, Users, Star, Crown, Navigation, BookOpen, Share2, Target, Circle, Leaf, Droplet, MessageSquare } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';

const editionMap: Record<string, { bg: string; icon: any; iconColor: string }> = {
    Tunis: { bg: 'rgba(255, 122, 0, 0.1)', icon: Flame, iconColor: '#D85A30' },
    Sfax: { bg: 'rgba(46, 204, 113, 0.1)', icon: Leaf, iconColor: '#3B6D11' },
    Sahel: { bg: 'rgba(59, 130, 246, 0.1)', icon: Droplet, iconColor: '#185FA5' },
    Meme: { bg: 'rgba(155, 89, 182, 0.1)', icon: Star, iconColor: '#993556' },
    Carthage: { bg: '#EEEDFE', icon: Star, iconColor: '#534AB7' },
    Default: { bg: 'rgba(255, 255, 255, 0.05)', icon: Circle, iconColor: '#888' },
};
function getEdition(name: string) { return editionMap[name] || editionMap.Default; }

function FeedCardSkeleton() {
    return (
        <div style={{ background: 'var(--bg-card)', borderRadius: 24, marginBottom: 24, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div className="skeleton" style={{ width: '100%', aspectRatio: '3/4' }} />
        </div>
    );
}

function FeedCard({ item, isNew }: { item: any; isNew?: boolean }) {
    const timeAgo = formatDistanceToNow(new Date(item.captured_at), { addSuffix: true });

    // Fallback lighter image
    const fallbackImgs = [
        'https://images.unsplash.com/photo-1596484552993-8ad5fc0b91e9?w=600&q=80',
        'https://images.unsplash.com/photo-1629851609101-72af4d310ea0?w=600&q=80'
    ];
    const lighterImage = item.lighter_image || fallbackImgs[item.lighter_id.charCodeAt(0) % 2];

    // Derived values from item
    const isStolen = !!item.stolen_from;

    // Mock levels and distance based on ID length to make it look active
    const level = Math.max(1, Math.floor((item.scan_count || 1) * 3 + (item.lighter_id.charCodeAt(2) % 5)));
    const distance = (item.scan_count || 1) * 12 + (item.lighter_id.charCodeAt(1) % 50);

    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: 24, marginBottom: 32,
            border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden',
            animation: isNew ? 'slide-down 400ms ease-out' : undefined
        }}>
            {/* User Strip */}
            <div style={{ padding: '16px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href={`/u/${item.username}`}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-sub)', border: '2px solid var(--border)', overflow: 'hidden' }}>
                        {item.user_avatar ? (
                            <img src={item.user_avatar} alt={item.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: 'var(--accent)' }}></div>
                        )}
                    </div>
                </Link>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <Link href={`/u/${item.username}`} style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-1)' }}>{item.username}</Link>
                        <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-3)' }}>LEVEL {level}</span>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={10} fill="var(--accent)" color="var(--accent)" /> Street Hunter • {item.city_name}
                    </div>
                </div>
            </div>

            {/* Product Image */}
            <Link href={`/l/${item.lighter_id}`} style={{ display: 'block', position: 'relative', width: '100%', aspectRatio: '16/9', background: 'var(--bg-sub)' }}>
                <img src={lighterImage} alt="Lighter" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
                    {item.lighter_name} • {item.rarity}
                </div>
            </Link>

            <div style={{ padding: '16px 16px 20px' }}>

                {/* Story Section */}
                <div style={{ marginBottom: 16 }}>
                    {isStolen ? (
                        <p style={{ margin: 0, fontSize: 15, color: 'var(--text-1)', fontWeight: 600, lineHeight: 1.4 }}>
                            <span style={{ fontWeight: 900 }}>{item.username}</span> just stole <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{item.lighter_name}</span> from <span style={{ fontWeight: 800, color: 'var(--text-3)', textDecoration: 'line-through' }}>{item.stolen_from}</span>!
                        </p>
                    ) : (
                        <p style={{ margin: 0, fontSize: 15, color: 'var(--text-1)', fontWeight: 600, lineHeight: 1.4 }}>
                            <span style={{ fontWeight: 900 }}>{item.username}</span> found <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{item.lighter_name}</span> in the wild!
                        </p>
                    )}
                </div>

                {/* Street Notes */}
                {item.message && (
                    <div style={{ background: 'var(--bg-sub)', padding: '12px 16px', borderRadius: 12, borderLeft: '3px solid var(--accent)', marginBottom: 16 }}>
                        <p style={{ margin: 0, fontSize: 14, fontStyle: 'italic', color: 'var(--text-2)' }}>"{item.message}"</p>
                    </div>
                )}

                {/* Action Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontSize: 12, fontWeight: 800 }}>
                            <Flame size={16} /> {item.scan_count} Scans
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontSize: 12, fontWeight: 800 }}>
                            <MapPin size={16} /> {distance} km
                        </div>
                    </div>

                    <Link href={`/l/${item.lighter_id}`} className="active:scale-95 transition-transform" style={{ background: 'var(--accent)', color: '#121212', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Navigation size={14} /> TRACK
                    </Link>
                </div>
            </div>
        </div>
    );
}

const loadingMessages = [
    "Tracking the lighter...",
    "Reading the history...",
    "Loading the story...",
    "Connecting to the streets...",
];

export default function HomePage() {
    const [feed, setFeed] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ todayCaptures: 0, activeHunters: 0, legendaryFound: 0, myMissionProgress: 0 });
    const [loading, setLoading] = useState(true);
    const [newIds, setNewIds] = useState<Set<string>>(new Set());
    const [loadingMsg, setLoadingMsg] = useState(loadingMessages[0]);
    const latestIdRef = useRef<string | null>(null);

    const loadFeed = async (prepend = false) => {
        try {
            const feedRes = await fetch('/api/feed?today=true');
            const data = await feedRes.json();

            const safeFeed = Array.isArray(data.feed) ? data.feed : Array.isArray(data) ? data : [];
            if (data.stats) setStats(data.stats);

            if (prepend && latestIdRef.current && safeFeed.length > 0) {
                const latestIdx = safeFeed.findIndex((f: any) => f.id === latestIdRef.current);
                const newItems = latestIdx > 0 ? safeFeed.slice(0, latestIdx) : [];
                if (newItems.length > 0) {
                    const newSet = new Set<string>(newItems.map((i: any) => String(i.id)));
                    setNewIds(newSet);
                    setFeed(prev => [...newItems, ...prev]);
                    setTimeout(() => setNewIds(new Set()), 1000);
                }
            } else {
                setFeed(safeFeed);
            }
            if (safeFeed.length > 0) latestIdRef.current = safeFeed[0].id;
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => {
        setLoadingMsg(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
        const timer = setTimeout(() => loadFeed(false), 300);
        return () => { clearTimeout(timer); };
    }, []);

    // Derived stats
    const { todayCaptures, activeHunters, legendaryFound, myMissionProgress } = stats;
    const missionPct = Math.min(100, Math.floor((myMissionProgress / 3) * 100));

    return (
        <div className="bg-asphalt" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', paddingBottom: 80 }}>
            {/* Header */}
            <TopBar rightIcon="pulse" rightLabel="Live" />

            <div style={{ padding: '16px 14px 0' }}>

                {/* Daily Stats Header */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', padding: '16px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 100, height: 100, background: 'var(--accent)', opacity: 0.1, borderRadius: '50%', filter: 'blur(30px)' }}></div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-3)', letterSpacing: '0.15em', marginBottom: 12, borderBottom: '1px dashed var(--border)', paddingBottom: 6 }}>🔥 TODAY IN TUNISIA</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-1)', animation: 'count-up-fade 600ms ease-out' }}>{todayCaptures}</div>
                            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-3)' }}>CAPTURES</div>
                        </div>
                        <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-1)', animation: 'count-up-fade 600ms ease-out 100ms both' }}>{activeHunters}</div>
                            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-3)' }}>HUNTERS</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)', animation: 'count-up-fade 600ms ease-out 200ms both' }}>{legendaryFound}</div>
                            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-3)' }}>LEGENDARY</div>
                        </div>
                    </div>
                </div>

                {/* Daily Challenge Card */}
                <div style={{ background: 'var(--bg-sub)', padding: '16px', borderRadius: 16, border: '1px solid rgba(255, 214, 10, 0.3)', marginBottom: 24, boxShadow: '0 4px 16px rgba(255, 214, 10, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Target size={16} color="var(--accent)" />
                            <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-1)', letterSpacing: '0.05em' }}>DAILY MISSION</span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255, 214, 10, 0.2)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 12 }}>+250 XP</span>
                    </div>
                    <p style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 800, color: 'var(--text-1)' }}>Capture 3 different lighters</p>

                    <div style={{ background: '#121212', height: 8, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ width: `${missionPct}%`, height: '100%', background: 'var(--accent)', borderRadius: 4, transition: 'width 600ms cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)' }}>{myMissionProgress} / 3 Items</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)' }}>Rare Sticker</span>
                    </div>
                </div>

                {/* Trending Collections */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 12, paddingLeft: 4 }}>🔥 TRENDING EDITIONS</div>
                    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }} className="no-scrollbar">
                        <div style={{ minWidth: 120, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 12, flexShrink: 0 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <Flame size={18} color="var(--accent)" />
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-1)' }}>Tunis</div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)' }}>64% Found</div>
                        </div>
                        <div style={{ minWidth: 120, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 12, flexShrink: 0 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(155, 89, 182, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <Star size={18} color="#993556" />
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-1)' }}>Meme</div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)' }}>82% Found</div>
                        </div>
                        <div style={{ minWidth: 120, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 12, flexShrink: 0 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(46, 204, 113, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <Leaf size={18} color="#3B6D11" />
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-1)' }}>Sfax</div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)' }}>12% Found</div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <>
                        <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12, fontStyle: 'italic', textAlign: 'center', fontWeight: 600 }}>{loadingMsg}</p>
                        {[1, 2, 3].map(i => <FeedCardSkeleton key={i} />)}
                    </>
                ) : feed.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-card)', borderRadius: 24, border: '1px dashed var(--border)' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
                        <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-1)', marginBottom: 6 }}>The streets are quiet...</div>
                        <div style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>Be the first one to capture a lighter today!</div>
                    </div>
                ) : (
                    feed.map((item: any) => <FeedCard key={item.id} item={item} isNew={newIds.has(item.id)} />)
                )}
            </div>
        </div>
    );
}
