import { prisma } from '@/lib/prisma';
import TopBar from '@/components/layout/TopBar';
import { Crown, Flame } from 'lucide-react';
import Link from 'next/link';
import LeaderboardTabs from './LeaderboardTabs';
import { getUserFromRequest } from '@/lib/jwt';
import { cookies } from 'next/headers';

export const revalidate = 60; // 1 minute cache for leaderboard

type LeaderboardEntry = {
    id: string;
    username: string;
    avatar_url: string | null;
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

    if (activeTab === 'captures') {
        const topUsersRaw = await prisma.user.findMany({
            take: 30,
            where: { history_entries: { some: {} } },
            select: { id: true, username: true, avatar_url: true, _count: { select: { history_entries: true } } },
            orderBy: { history_entries: { _count: 'desc' } }
        });
        entries = topUsersRaw.map(u => ({ id: u.id, username: u.username, avatar_url: u.avatar_url, score: u._count.history_entries }));
    } else if (activeTab === 'owned') {
        const topUsersRaw = await prisma.user.findMany({
            take: 30,
            where: { lighters: { some: {} } },
            select: { id: true, username: true, avatar_url: true, _count: { select: { lighters: true } } },
            orderBy: { lighters: { _count: 'desc' } }
        });
        entries = topUsersRaw.map(u => ({ id: u.id, username: u.username, avatar_url: u.avatar_url, score: u._count.lighters }));
    } else if (activeTab === 'scans') {
        const topUsersRaw = await prisma.user.findMany({
            take: 30,
            where: { scans: { some: {} } },
            select: { id: true, username: true, avatar_url: true, _count: { select: { scans: true } } },
            orderBy: { scans: { _count: 'desc' } }
        });
        entries = topUsersRaw.map(u => ({ id: u.id, username: u.username, avatar_url: u.avatar_url, score: u._count.scans }));
    }

    entries = entries.filter(e => e.score > 0);

    // Current user rank
    let myRankIndex = entries.findIndex(e => e.id === currentUser);
    let myRank: number | string = '-';
    let myScore = 0;

    if (currentUser !== "UNKNOWN") {
        if (myRankIndex >= 0) {
            myRank = myRankIndex + 1;
            myScore = entries[myRankIndex].score;
        } else {
            const me = await prisma.user.findUnique({
                where: { id: currentUser },
                select: { _count: { select: { history_entries: true, lighters: true, scans: true } } }
            });
            if (me) {
                if (activeTab === 'captures') {
                    myScore = me._count.history_entries;
                    const r: any = await prisma.$queryRaw`SELECT COUNT(DISTINCT "owner_id")::int as rank FROM (SELECT "owner_id" FROM "OwnershipHistory" GROUP BY "owner_id" HAVING COUNT("id") > ${myScore}) as T;`;
                    myRank = (r[0]?.rank || 0) + 1;
                } else if (activeTab === 'owned') {
                    myScore = me._count.lighters;
                    const r: any = await prisma.$queryRaw`SELECT COUNT(DISTINCT "current_owner_id")::int as rank FROM (SELECT "current_owner_id" FROM "Lighter" WHERE "current_owner_id" IS NOT NULL GROUP BY "current_owner_id" HAVING COUNT("id") > ${myScore}) as T;`;
                    myRank = (r[0]?.rank || 0) + 1;
                } else {
                    myScore = me._count.scans;
                    const r: any = await prisma.$queryRaw`SELECT COUNT(DISTINCT "user_id")::int as rank FROM (SELECT "user_id" FROM "Scan" WHERE "user_id" IS NOT NULL GROUP BY "user_id" HAVING COUNT("id") > ${myScore}) as T;`;
                    myRank = (r[0]?.rank || 0) + 1;
                }
            }
        }
    }

    // Top 3
    const top1 = entries[0];
    const top2 = entries[1];
    const top3 = entries[2];

    // Rest
    const rest = entries.slice(3, 20);

    return (
        <>
            <TopBar rightLabel="Ranks" />
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
                                    <Link href={`/u/${top2.username}`} className="flex flex-col items-center w-full active:scale-95 transition-transform cursor-pointer">
                                        <div className="w-14 h-14 bg-[var(--bg-sub)] rounded-full flex items-center justify-center font-bold text-[var(--accent)] border-2 border-[var(--bg-card)] shadow-md -mb-4 z-10 text-sm overflow-hidden bg-cover bg-center"
                                            style={top2.avatar_url ? { backgroundImage: `url(${top2.avatar_url})`, color: 'transparent' } : {}}>
                                            {!top2.avatar_url && top2.username.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="w-full bg-gradient-to-t from-[var(--bg-card)] to-[#fcfcfc] h-28 rounded-t-xl flex flex-col items-center justify-start pt-7 border border-b-0 border-[var(--border)] shadow-[0_-2px_10px_rgba(0,0,0,0.02)]"
                                            style={{ transformOrigin: 'bottom', animation: 'podium-grow 500ms ease-out 0ms forwards' }}>
                                            <span className="font-extrabold text-[var(--text-2)] text-xs bg-[var(--bg-sub)] px-2 py-0.5 rounded-full mb-1">#2</span>
                                            <span className="font-extrabold text-[var(--accent)] text-lg">{top2.score}</span>
                                            <span className="text-[10px] font-bold text-[var(--text-1)] mt-1 px-1 text-center truncate w-full">{top2.username}</span>
                                        </div>
                                    </Link>
                                </div>
                            )}

                            {/* #1 */}
                            {top1 && (
                                <div className="flex flex-col items-center flex-[1.2]">
                                    <Link href={`/u/${top1.username}`} className="flex flex-col items-center w-full active:scale-95 transition-transform cursor-pointer">
                                        <div className="w-20 h-20 bg-[var(--text-1)] rounded-full flex items-center justify-center font-extrabold text-[var(--accent)] border-[4px] border-[var(--bg-card)] shadow-lg relative -mb-5 z-10 overflow-hidden bg-cover bg-center"
                                            style={top1.avatar_url ? { backgroundImage: `url(${top1.avatar_url})`, color: 'transparent' } : {}}>
                                            <div className="absolute -top-6 text-[var(--accent)] drop-shadow-md z-20" style={{ color: 'var(--accent)' }}>
                                                <Crown fill="var(--accent)" size={28} />
                                            </div>
                                            {!top1.avatar_url && top1.username.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="w-full bg-gradient-to-t from-[var(--accent)] to-[#FFE866] text-[#121212] h-32 rounded-t-xl flex flex-col items-center justify-start pt-8 pb-2 shadow-[0_-8px_20px_rgba(255,214,10,0.15)] border border-b-0 border-[var(--accent)]"
                                            style={{ transformOrigin: 'bottom', animation: 'podium-grow 500ms ease-out 300ms both' }}>
                                            <span className="font-bold text-[10px] opacity-90 bg-black/20 px-2.5 py-0.5 rounded-full mb-1 shadow-sm">#1</span>
                                            <span className="text-2xl font-extrabold mt-1">{top1.score}</span>
                                            <span className="text-[11px] uppercase tracking-wider font-extrabold truncate w-full text-center px-1 mt-auto pb-1 opacity-95">{top1.username}</span>
                                        </div>
                                    </Link>
                                </div>
                            )}

                            {/* #3 */}
                            {top3 && (
                                <div className="flex flex-col items-center flex-1">
                                    <Link href={`/u/${top3.username}`} className="flex flex-col items-center w-full active:scale-95 transition-transform cursor-pointer">
                                        <div className="w-14 h-14 bg-[var(--bg-sub)] rounded-full flex items-center justify-center font-bold text-[var(--text-1)] border-2 border-[var(--bg-card)] shadow-md -mb-4 z-10 text-sm overflow-hidden bg-cover bg-center"
                                            style={top3.avatar_url ? { backgroundImage: `url(${top3.avatar_url})`, color: 'transparent' } : {}}>
                                            {!top3.avatar_url && top3.username.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="w-full bg-gradient-to-t from-[var(--bg-card)] to-[#f9f9f9] h-24 rounded-t-xl flex flex-col items-center justify-start pt-7 border border-b-0 border-[var(--border)] shadow-[0_-2px_10px_rgba(0,0,0,0.02)]"
                                            style={{ transformOrigin: 'bottom', animation: 'podium-grow 500ms ease-out 150ms both' }}>
                                            <span className="font-bold text-[var(--text-3)] text-xs bg-[var(--bg-sub)] px-2 py-0.5 rounded-full mb-1">#3</span>
                                            <span className="font-extrabold text-[var(--text-1)] text-lg">{top3.score}</span>
                                            <span className="text-[10px] font-bold text-[var(--text-2)] mt-1 px-1 text-center truncate w-full">{top3.username}</span>
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
                            <Link href={`/u/${entry.username}`} key={entry.id} className={`flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border active:scale-95 transition-transform ${isMe ? 'border-[var(--accent)] shadow-sm shadow-[var(--accent)]/10' : 'border-[var(--border)]'}`}>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-[var(--text-3)] w-5 text-center text-sm">{rank}</span>
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg-sub)] flex items-center justify-center font-bold text-xs text-[var(--text-2)] overflow-hidden bg-cover bg-center border border-[var(--border)]"
                                        style={entry.avatar_url ? { backgroundImage: `url(${entry.avatar_url})`, color: 'transparent' } : {}}>
                                        {!entry.avatar_url && entry.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className={`font-bold text-sm ${isMe ? 'text-[var(--accent)]' : 'text-[var(--text-1)]'}`}>{entry.username}</span>
                                        {isMe && <span className="text-[9px] text-[#121212] bg-[var(--accent)] px-1.5 py-0.5 rounded-sm font-bold tracking-wider w-fit">YOU</span>}
                                    </div>
                                </div>
                                <div className="font-extrabold text-sm text-[var(--text-1)] bg-[var(--bg-sub)] px-3 py-1 rounded-full">
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
