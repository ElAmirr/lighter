import { PrismaClient } from '@prisma/client';
import TopBar from '@/components/layout/TopBar';
import { Crown, Flame } from 'lucide-react';
import Link from 'next/link';
import LeaderboardTabs from './LeaderboardTabs';
import { getUserFromRequest } from '@/lib/jwt';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
export const revalidate = 60; // 1 minute cache for leaderboard

type LeaderboardEntry = {
    id: string;
    username: string;
    score: number;
};

export default async function LeaderboardPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const resolvedParams = await searchParams;
    const activeTab = resolvedParams.tab || 'captures';

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    let currentUser = "UNKNOWN";

    if (token) {
        // Basic decode
        try {
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                currentUser = payload.userId;
            }
        } catch (e) { }
    }

    // Calculate ranks
    let entries: LeaderboardEntry[] = [];

    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: {
                    history_entries: true, // captures
                    lighters: true, // currently owned
                    scans: true, // scans triggered
                }
            }
        }
    });

    if (activeTab === 'captures') {
        entries = users.map(u => ({ id: u.id, username: u.username, score: u._count.history_entries }));
    } else if (activeTab === 'owned') {
        entries = users.map(u => ({ id: u.id, username: u.username, score: u._count.lighters }));
    } else if (activeTab === 'scans') {
        entries = users.map(u => ({ id: u.id, username: u.username, score: u._count.scans }));
    }

    entries.sort((a, b) => b.score - a.score);

    // Top 3
    const top1 = entries[0];
    const top2 = entries[1];
    const top3 = entries[2];

    // Rest
    const rest = entries.slice(3);

    // Current user rank
    const myRankIndex = entries.findIndex(e => e.id === currentUser);
    const myRank = myRankIndex >= 0 ? myRankIndex + 1 : '-';
    const myScore = myRankIndex >= 0 ? entries[myRankIndex].score : 0;

    return (
        <>
            <TopBar rightLabel="This week" />
            <div className="flex flex-col flex-1 p-4">

                <LeaderboardTabs activeTab={activeTab} />

                {/* Podium section */}
                <div className="bg-[var(--bg-card)] rounded-2xl p-4 shadow-sm border border-[var(--border)] mt-6 pt-10">
                    {entries.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                            <div style={{ fontSize: 36, marginBottom: 10 }}>🏆</div>
                            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-1)', marginBottom: 6 }}>The throne is empty</div>
                            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>First capture takes #1. That could be you.</div>
                        </div>
                    ) : (
                        <div className="flex items-end justify-center h-48 gap-3">
                            {/* #2 */}
                            {top2 && (
                                <div className="flex flex-col items-center flex-1">
                                    <Link href={`/u/${top2.username}`} className="flex flex-col items-center w-full">
                                        <div className="w-12 h-12 bg-[var(--bg-sub)] rounded-full flex items-center justify-center font-bold text-[var(--accent)] border-2 border-[var(--bg-card)] shadow-sm -mb-3 z-10 text-sm">
                                            {top2.username.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="w-full bg-[var(--bg-sub)] h-24 rounded-t-xl flex flex-col items-center justify-start pt-6 border border-b-0 border-[var(--border)]"
                                            style={{ transformOrigin: 'bottom', animation: 'podium-grow 500ms ease-out 0ms forwards' }}>
                                            <span className="font-bold text-[var(--text-1)] text-xs">#2</span>
                                            <span className="font-bold text-[var(--accent)] mt-1">{top2.score}</span>
                                            <span className="text-[9px] font-semibold text-[var(--text-2)] mt-1 px-1 text-center truncate w-full">{top2.username}</span>
                                        </div>
                                    </Link>
                                </div>
                            )}

                            {/* #1 */}
                            {top1 && (
                                <div className="flex flex-col items-center flex-[1.2]">
                                    <Link href={`/u/${top1.username}`} className="flex flex-col items-center w-full">
                                        <div className="w-16 h-16 bg-[var(--text-1)] rounded-full flex items-center justify-center font-bold text-[var(--accent)] border-[3px] border-[var(--bg-card)] shadow-md relative -mb-4 z-10">
                                            <div className="absolute -top-5 text-[var(--accent)] drop-shadow-md">
                                                <Crown fill="currentColor" size={24} />
                                            </div>
                                            {top1.username.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="w-full bg-[var(--accent)] text-white h-32 rounded-t-xl flex flex-col items-center justify-start pt-8 pb-2 shadow-[0_-4px_12px_rgba(216,90,48,0.2)] border border-b-0 border-[#c44e26]"
                                            style={{ transformOrigin: 'bottom', animation: 'podium-grow 500ms ease-out 300ms both' }}>
                                            <span className="font-bold text-xs opacity-90">#1</span>
                                            <span className="text-xl font-bold mt-1">{top1.score}</span>
                                            <span className="text-[10px] uppercase tracking-wider font-semibold truncate w-full text-center px-1 mt-auto pb-1 opacity-90">{top1.username}</span>
                                        </div>
                                    </Link>
                                </div>
                            )}

                            {/* #3 */}
                            {top3 && (
                                <div className="flex flex-col items-center flex-1">
                                    <Link href={`/u/${top3.username}`} className="flex flex-col items-center w-full">
                                        <div className="w-12 h-12 bg-[var(--bg-sub)] rounded-full flex items-center justify-center font-bold text-[var(--text-1)] border-2 border-[var(--bg-card)] shadow-sm -mb-3 z-10 text-sm">
                                            {top3.username.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="w-full bg-[var(--bg-sub)] h-20 rounded-t-xl flex flex-col items-center justify-start pt-6 border border-b-0 border-[var(--border)]"
                                            style={{ transformOrigin: 'bottom', animation: 'podium-grow 500ms ease-out 150ms both' }}>
                                            <span className="font-bold text-[var(--text-1)] text-xs">#3</span>
                                            <span className="font-bold text-[var(--accent)] mt-1">{top3.score}</span>
                                            <span className="text-[9px] font-semibold text-[var(--text-2)] mt-1 px-1 text-center truncate w-full">{top3.username}</span>
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Your rank bar */}
                {myRankIndex >= 0 && (
                    <div className="bg-[var(--accent)]/10 border border-[var(--accent)] rounded-xl p-3 flex justify-between items-center mt-4">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-[var(--accent)] w-5 text-center">#{myRank}</span>
                            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center font-bold text-[10px]">YOU</div>
                            <span className="font-bold text-sm text-[var(--text-1)]">Your rank</span>
                        </div>
                        <div className="font-bold text-[var(--accent)]">{myScore} {activeTab}</div>
                    </div>
                )}

                {/* List remaining */}
                <div className="flex flex-col mt-4 gap-2 pb-8">
                    {rest.map((entry, idx) => {
                        const rank = idx + 4;
                        const isMe = entry.id === currentUser;

                        return (
                            <Link href={`/u/${entry.username}`} key={entry.id} className={`flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border ${isMe ? 'border-[var(--accent)] shadow-sm shadow-[var(--accent)]/10' : 'border-[var(--border)]'}`}>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-[var(--text-3)] w-5 text-center text-sm">{rank}</span>
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg-sub)] flex items-center justify-center font-bold text-xs text-[var(--text-2)]">
                                        {entry.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-[var(--text-1)]">{entry.username}</span>
                                        {isMe && <span className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider">You</span>}
                                    </div>
                                </div>
                                <div className="font-bold text-sm">
                                    {entry.score}
                                </div>
                            </Link>
                        )
                    })}
                </div>

            </div>
        </>
    );
}
