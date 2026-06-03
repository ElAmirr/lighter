"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Leaf, Droplet, Star, Circle } from 'lucide-react';

// ── Ordinal helper ────────────────────────────────────────
function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ── Edition config ────────────────────────────────────────
const EDITIONS: Record<string, { bg: string; icon: any; accent: string }> = {
    Tunis: { bg: '#FDF0EA', icon: Flame, accent: '#D85A30' },
    Sfax: { bg: '#EAF3DE', icon: Leaf, accent: '#3B6D11' },
    Sahel: { bg: '#E6F1FB', icon: Droplet, accent: '#185FA5' },
    Meme: { bg: '#FBEAF0', icon: Star, accent: '#993556' },
    Carthage: { bg: '#EEEDFE', icon: Star, accent: '#534AB7' },
    Default: { bg: '#EFEDE8', icon: Circle, accent: '#888' },
};

// ── Count-up hook ─────────────────────────────────────────
function useCountUp(target: number, duration = 1200, start = false) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!start || target === 0) return;
        let startTime: number | null = null;
        const step = (ts: number) => {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
            setVal(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [start, target, duration]);
    return val;
}

// ── Confetti launcher ─────────────────────────────────────
async function launchConfetti() {
    // Dynamically load canvas-confetti from CDN
    if (typeof window === 'undefined') return;
    try {
        const confettiModule = await import('https://cdn.skypack.dev/canvas-confetti@1.6.0' as any);
        const confetti = confettiModule.default || confettiModule;
        confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.4 },
            colors: ['#D85A30', '#F0997B', '#FAECE7', '#1A1A1A'],
        });
    } catch {
        // Ignore if CDN not available
    }
}

// ── Share card generator ──────────────────────────────────
async function generateShareCard(opts: {
    ownerNumber: number;
    lighterName: string;
    lighterId: string;
    collection: string;
    cityName: string;
}) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d')!;
    const ed = EDITIONS[opts.collection] || EDITIONS.Default;

    // Background
    ctx.fillStyle = ed.bg;
    ctx.fillRect(0, 0, 1080, 1080);

    // Logo
    ctx.font = 'bold 64px Arial';
    ctx.fillStyle = '#1A1A1A';
    ctx.textAlign = 'center';
    ctx.fillText('DA', 440, 120);
    ctx.fillStyle = '#D85A30';
    ctx.fillText('V', 540 + 28, 120);
    ctx.fillStyle = '#1A1A1A';
    ctx.fillText('AY', 640, 120);

    // Collection label
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = ed.accent;
    ctx.fillText(`${opts.collection.toUpperCase()} COLLECTION`, 540, 180);

    // Big owner number
    ctx.font = 'black 280px Arial';
    ctx.fillStyle = ed.accent;
    ctx.fillText(`#${opts.ownerNumber}`, 540, 560);

    // "owner of" text
    ctx.font = '500 44px Arial';
    ctx.fillStyle = '#1A1A1A';
    ctx.fillText(`owner of ${opts.lighterName}`, 540, 640);

    // City + date
    ctx.font = '32px Arial';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'left';
    ctx.fillText(`📍 ${opts.cityName}  ·  ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`, 80, 980);

    // Watermark
    ctx.textAlign = 'right';
    ctx.fillStyle = ed.accent;
    ctx.font = 'bold 32px Arial';
    ctx.fillText('davay.tn', 1000, 980);

    return canvas;
}

async function shareCapture(opts: Parameters<typeof generateShareCard>[0]) {
    const canvas = await generateShareCard(opts);
    canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `davay-capture-${opts.lighterId.slice(0, 6)}.png`, { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({ files: [file], title: `I captured ${opts.lighterName} on DAVAY!` });
                return;
            } catch { }
        }
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
    }, 'image/png');
}

// ══════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════
interface Props {
    lighterId: string;
    lighterName?: string;
    collection?: string;
    isLoggedIn: boolean;
    alreadyOwns: boolean;
    ownerIndex: number;
}

export default function CaptureClientButton({ lighterId, lighterName = 'Lighter', collection = 'Default', isLoggedIn, alreadyOwns, ownerIndex }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [cityName, setCityName] = useState('');
    const [finalOwner, setFinalOwner] = useState(ownerIndex);
    const animVal = useCountUp(finalOwner, 1200, success);
    const ed = EDITIONS[collection] || EDITIONS.Default;
    const EdIcon = ed.icon;

    const handleCapture = async () => {
        if (!isLoggedIn) { router.push('/login'); return; }
        setLoading(true);

        const doSubmit = (lat: number | null, lon: number | null) =>
            submitCapture(lat, lon);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => doSubmit(pos.coords.latitude, pos.coords.longitude),
                () => doSubmit(null, null),
                { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
            );
        } else {
            doSubmit(null, null);
        }
    };

    const submitCapture = async (lat: number | null, lon: number | null) => {
        try {
            const res = await fetch('/api/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lighter_id: lighterId, latitude: lat, longitude: lon }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.detail || body.error || `HTTP ${res.status}`);
            }
            const data = await res.json();
            setCityName(data.city_name || 'Unknown');
            setFinalOwner(data.capture ? ownerIndex : ownerIndex);
            setSuccess(true);
            router.refresh();
            // Fire confetti after slight delay
            setTimeout(launchConfetti, 200);
        } catch (e: any) {
            alert("Something broke. Try again — the lighter isn't going anywhere.\n\n" + (e?.message || e));
            setLoading(false);
        }
    };

    // ── Cinematic success screen ──────────────────────────
    if (success) {
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9990,
                background: 'var(--bg-card)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '32px 24px', textAlign: 'center',
                animation: 'fade-scale-in 300ms ease-out forwards',
            }}>
                {/* Edition circle */}
                <div style={{
                    width: 120, height: 120, borderRadius: '50%',
                    background: ed.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 28,
                    boxShadow: `0 0 0 12px ${ed.bg}80, 0 8px 40px ${ed.accent}30`,
                }}>
                    <EdIcon size={56} color={ed.accent} strokeWidth={1.5} />
                </div>

                {/* Count-up owner number */}
                <div style={{ fontSize: 80, fontWeight: 900, color: '#D85A30', lineHeight: 1, marginBottom: 8 }}>
                    {getOrdinal(animVal || 1)}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>
                    owner
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>
                    Captured in <strong>{cityName}</strong>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#D85A30', marginBottom: 4 }}>
                    {lighterName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 40 }}>
                    #{lighterId.slice(0, 6)}
                </div>

                {/* Share button */}
                <button
                    onClick={() => shareCapture({ ownerNumber: finalOwner, lighterName, lighterId, collection, cityName })}
                    style={{
                        width: '100%', maxWidth: 320, padding: '16px 0',
                        background: '#D85A30', color: 'white',
                        fontWeight: 700, fontSize: 16, borderRadius: 16,
                        border: 'none', cursor: 'pointer', marginBottom: 12,
                        boxShadow: '0 4px 24px rgba(216,90,48,0.3)',
                    }}
                >
                    Share this capture
                </button>

                {/* View lighter */}
                <button
                    onClick={() => setSuccess(false)}
                    style={{
                        width: '100%', maxWidth: 320, padding: '14px 0',
                        background: 'transparent', color: 'var(--text-2)',
                        fontWeight: 600, fontSize: 15, borderRadius: 16,
                        border: '2px solid var(--border)', cursor: 'pointer',
                    }}
                >
                    View lighter
                </button>
            </div>
        );
    }

    if (alreadyOwns) {
        return (
            <button disabled style={{
                width: '100%', marginTop: 16,
                padding: '18px 0', borderRadius: 16,
                background: 'var(--bg-sub)', color: 'var(--text-2)',
                fontWeight: 700, fontSize: 15, border: 'none', cursor: 'default',
            }}>
                This lighter is yours 🔥 — for now
            </button>
        );
    }

    return (
        <button
            onClick={handleCapture}
            disabled={loading}
            style={{
                width: '100%', marginTop: 16, padding: '18px 0',
                background: 'var(--accent)', color: 'white',
                fontWeight: 700, fontSize: 16, borderRadius: 16, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
                boxShadow: '0 4px 24px rgba(216,90,48,0.25)',
                transition: 'transform 100ms ease, opacity 200ms',
                transform: 'scale(1)',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
            {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{
                        width: 16, height: 16, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        display: 'inline-block',
                        animation: 'spin 0.7s linear infinite',
                    }} />
                    Connecting to the streets...
                </span>
            ) : isLoggedIn ? 'Capture this lighter' : 'Login to claim this lighter'}
        </button>
    );
}
