"use client";

import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';

export default function DailyStats() {
    const [stats, setStats] = useState<any>({ todayCaptures: 0, activeHunters: 0, legendaryFound: 0, myMissionProgress: 0 });

    useEffect(() => {
        fetch('/api/feed?today=true')
            .then(res => res.json())
            .then(data => {
                if (data.stats) setStats(data.stats);
            })
            .catch(() => { });
    }, []);

    const { todayCaptures, activeHunters, legendaryFound, myMissionProgress } = stats;
    const missionPct = Math.min(100, Math.floor((myMissionProgress / 3) * 100));

    return (
        <div style={{ marginBottom: 24, marginTop: 16 }}>
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
            <div style={{ background: 'var(--bg-sub)', padding: '16px', borderRadius: 16, border: '1px solid rgba(255, 214, 10, 0.3)', boxShadow: '0 4px 16px rgba(255, 214, 10, 0.05)' }}>
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
        </div>
    );
}
