"use client";

import React, { useState, useEffect } from 'react';
import { Target, Trophy } from 'lucide-react';

export default function DailyStats() {
    const [mission, setMission] = useState<any>(null);
    const [myProgress, setMyProgress] = useState<number>(0);

    useEffect(() => {
        // Fetch weekly mission + user progress
        fetch('/api/daily-mission')
            .then(res => res.json())
            .then(data => {
                if (data.mission) setMission(data.mission);
                if (typeof data.myProgress === 'number') setMyProgress(data.myProgress);
            })
            .catch(() => { });
    }, []);

    const goalCount = mission?.goal_count ?? 3;
    const missionPct = Math.min(100, Math.floor((myProgress / goalCount) * 100));
    const isComplete = myProgress >= goalCount;

    return (
        <div style={{ marginBottom: 24, marginTop: 16 }}>
            {/* Weekly Mission Card */}
            <div style={{ background: 'var(--bg-sub)', padding: '16px', borderRadius: 16, border: isComplete ? '1px solid rgba(255,214,10,0.6)' : '1px solid rgba(255, 214, 10, 0.3)', boxShadow: isComplete ? '0 4px 20px rgba(255,214,10,0.15)' : '0 4px 16px rgba(255, 214, 10, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isComplete ? <Trophy size={16} color="var(--accent)" /> : <Target size={16} color="var(--accent)" />}
                        <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-1)', letterSpacing: '0.05em' }}>WEEKLY MISSION</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255, 214, 10, 0.2)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 12 }}>
                        +{mission?.xp_reward ?? 250} XP
                    </span>
                </div>

                {mission ? (
                    <>
                        <p style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 800, color: 'var(--text-1)' }}>{mission.title}</p>
                        <p style={{ margin: '0 0 12px 0', fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>{mission.description}</p>
                    </>
                ) : (
                    <div style={{ height: 36, background: 'var(--bg-card)', borderRadius: 8, marginBottom: 12, animation: 'pulse 1.5s infinite' }} />
                )}

                <div style={{ background: '#121212', height: 8, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ width: `${missionPct}%`, height: '100%', background: isComplete ? '#22c55e' : 'var(--accent)', borderRadius: 4, transition: 'width 600ms cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: isComplete ? '#22c55e' : 'var(--text-3)' }}>
                        {isComplete ? '✅ COMPLETED!' : `${myProgress} / ${goalCount}`}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)' }}>{mission?.reward_label ?? 'Rare Sticker'}</span>
                </div>
            </div>
        </div>
    );
}
