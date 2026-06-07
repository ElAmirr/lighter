"use client";

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Flame, Leaf, Droplet, Star, Circle, Sword, Shield } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';

// ── Edition config ────────────────────────────────────────
const editionMap: Record<string, { bg: string; icon: any; iconColor: string }> = {
    Tunis: { bg: 'var(--edition-tunis)', icon: Flame, iconColor: '#D85A30' },
    Sfax: { bg: 'var(--edition-sfax)', icon: Leaf, iconColor: '#3B6D11' },
    Sahel: { bg: 'var(--edition-sahel)', icon: Droplet, iconColor: '#185FA5' },
    Meme: { bg: 'var(--edition-meme)', icon: Star, iconColor: '#993556' },
    Carthage: { bg: '#EEEDFE', icon: Star, iconColor: '#534AB7' },
    Default: { bg: 'var(--bg-sub)', icon: Circle, iconColor: '#888' },
};
function getEdition(name: string) { return editionMap[name] || editionMap.Default; }

const rarityMap: Record<string, { bg: string; text: string }> = {
    Legendary: { bg: 'var(--rarity-legendary-bg)', text: 'var(--rarity-legendary-text)' },
    Epic: { bg: 'var(--rarity-epic-bg)', text: 'var(--rarity-epic-text)' },
    Rare: { bg: 'var(--rarity-rare-bg)', text: 'var(--rarity-rare-text)' },
    Uncommon: { bg: 'var(--rarity-uncommon-bg)', text: 'var(--rarity-uncommon-text)' },
    Common: { bg: 'var(--rarity-common-bg)', text: 'var(--rarity-common-text)' },
};
function getRarity(name: string) { return rarityMap[name] || rarityMap.Common; }

// ── Skeleton ──────────────────────────────────────────────
function CardSkeleton() {
    return (
        <div style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 16, marginBottom: 10, border: '1px solid var(--border)' }}>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ height: 13, width: '70%' }} />
                <div className="skeleton" style={{ height: 11, width: '45%' }} />
                <div className="skeleton" style={{ height: 10, width: '30%' }} />
            </div>
        </div>
    );
}

// ── Lighter thumbnail ─────────────────────────────────────
function LighterThumb({ collection, image }: { collection: string; image?: string | null }) {
    const { bg, icon: Icon, iconColor } = getEdition(collection);
    if (image) {
        return (
            <div style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
        );
    }
    return (
        <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={22} color={iconColor} strokeWidth={1.5} />
        </div>
    );
}

// ── Captured card ─────────────────────────────────────────
function CapturedCard({ item }: { item: any }) {
    const rarity = getRarity(item.rarity);
    return (
        <Link href={`/l/${item.lighter_id}`}>
            <div className="bg-sticker" style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 16, marginBottom: 12, border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center', position: 'relative' }}>
                {/* Green left stripe for captured */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--success)', borderRadius: '16px 0 0 16px' }} />

                <LighterThumb collection={item.collection} image={item.lighter_image} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 900, fontSize: 15, margin: 0, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.lighter_name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '2px 0 0', fontWeight: 600 }}>
                        {item.city_name} · {formatDistanceToNow(new Date(item.captured_at), { addSuffix: true })}
                    </p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, background: rarity.bg, color: rarity.text, borderRadius: 20, padding: '4px 10px', textTransform: 'uppercase' }}>
                    {item.rarity}
                </span>
            </div>
        </Link>
    );
}

// ── Stolen card ───────────────────────────────────────────
function StolenCard({ item }: { item: any }) {
    const rarity = getRarity(item.rarity);
    return (
        <Link href={`/l/${item.lighter_id}`}>
            <div className="bg-sticker" style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'var(--bg-sub)', borderRadius: 16, marginBottom: 12, border: '1px solid rgba(255,77,79,0.2)', alignItems: 'center', position: 'relative' }}>
                {/* Red left stripe for stolen */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--danger)', borderRadius: '16px 0 0 16px' }} />

                <div style={{ paddingLeft: 4, display: 'flex', gap: 12, flex: 1, alignItems: 'center', minWidth: 0 }}>
                    <LighterThumb collection={item.collection} image={item.lighter_image} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 900, fontSize: 15, margin: 0, color: 'var(--text-1)', textDecoration: 'line-through', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.lighter_name}</p>
                        <p style={{ fontSize: 11, color: 'var(--danger)', margin: '2px 0 0', fontWeight: 800 }}>
                            STOLEN BY {item.stolen_by}
                        </p>
                        <p style={{ fontSize: 10, color: 'var(--text-3)', margin: '2px 0 0', fontWeight: 600 }}>
                            {formatDistanceToNow(new Date(item.stolen_at), { addSuffix: true })}
                        </p>
                    </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, background: rarity.bg, color: rarity.text, borderRadius: 20, padding: '4px 10px', textTransform: 'uppercase' }}>
                    {item.rarity}
                </span>
            </div>
        </Link>
    );
}

// ══════════════════════════════════════════════════════════
// War Page
// ══════════════════════════════════════════════════════════
type Tab = 'captured' | 'stolen';

export default function WarPage() {
    const [activeTab, setActiveTab] = useState<Tab>('captured');
    const [captured, setCaptured] = useState<any[]>([]);
    const [stolen, setStolen] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/war')
            .then(r => r.json())
            .then(data => {
                setCaptured(Array.isArray(data.captured) ? data.captured : []);
                setStolen(Array.isArray(data.stolen) ? data.stolen : []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const items = activeTab === 'captured' ? captured : stolen;

    return (
        <div className="bg-asphalt" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', paddingBottom: 90 }}>
            {/* Header */}
            <TopBar rightLabel="War Room" />

            <div style={{ padding: '16px 14px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '0.08em', color: 'var(--text-1)' }}>WAR ROOM</span>
                    <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-2)', fontWeight: 800 }}>
                        <span style={{ color: 'var(--success)' }}>{captured.length} SNAGGED</span>
                        <span>·</span>
                        <span style={{ color: 'var(--danger)' }}>{stolen.length} LOST</span>
                    </div>
                </div>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <button
                        onClick={() => setActiveTab('captured')}
                        style={{
                            flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13,
                            background: activeTab === 'captured' ? 'var(--accent)' : 'var(--bg-sub)',
                            color: activeTab === 'captured' ? '#121212' : 'var(--text-2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            transition: 'all 200ms ease',
                        }}
                    >
                        <Sword size={16} /> Captured {!loading && `(${captured.length})`}
                    </button>
                    <button
                        onClick={() => setActiveTab('stolen')}
                        style={{
                            flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13,
                            background: activeTab === 'stolen' ? 'var(--danger)' : 'var(--bg-sub)',
                            color: activeTab === 'stolen' ? 'white' : 'var(--text-2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            transition: 'all 200ms ease',
                        }}
                    >
                        <Shield size={16} /> Stolen {!loading && `(${stolen.length})`}
                    </button>
                </div>

                {loading && [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}

                {!loading && items.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                        <div style={{ fontSize: 44, marginBottom: 12 }}>
                            {activeTab === 'captured' ? '⚔️' : '🛡️'}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-1)', marginBottom: 8 }}>
                            {activeTab === 'captured' ? 'Nothing captured yet' : 'Nothing stolen yet'}
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
                            {activeTab === 'captured'
                                ? 'امسح QR ديال ولاعة وقبضها 🔥'
                                : 'Your lighters are safe... for now 👀'}
                        </div>
                    </div>
                )}

                {activeTab === 'captured' && items.map((item: any) => (
                    <CapturedCard key={item.id} item={item} />
                ))}
                {activeTab === 'stolen' && items.map((item: any) => (
                    <StolenCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}
