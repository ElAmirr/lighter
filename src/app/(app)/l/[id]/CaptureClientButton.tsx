"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface CaptureClientButtonProps {
    lighterId: string;
    isLoggedIn: boolean;
    alreadyOwns: boolean;
    ownerIndex: number;
}

export default function CaptureClientButton({ lighterId, isLoggedIn, alreadyOwns, ownerIndex }: CaptureClientButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [cityName, setCityName] = useState('');

    const handleCapture = async () => {
        if (!isLoggedIn) { router.push('/login'); return; }
        setLoading(true);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    await submitCapture(pos.coords.latitude, pos.coords.longitude);
                },
                async () => {
                    // Denied or error — still capture without coords
                    await submitCapture(null, null);
                },
                { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
            );
        } else {
            await submitCapture(null, null);
        }
    };

    const submitCapture = async (lat: number | null, lon: number | null) => {
        try {
            const res = await fetch('/api/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lighter_id: lighterId, latitude: lat, longitude: lon })
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.detail || body.error || `HTTP ${res.status}`);
            }

            const data = await res.json();
            setCityName(data.city_name || 'Unknown');
            setSuccess(true);
            router.refresh();
        } catch (e: any) {
            alert("Error capturing lighter: " + (e?.message || e));
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-green-50 border border-green-200 rounded-2xl w-full">
                <div className="text-3xl mb-2">🔥</div>
                <h3 className="font-bold text-lg text-green-800">You captured #{lighterId.slice(0, 3)}!</h3>
                <p className="text-green-700 text-sm font-medium">You are the {getOrdinal(ownerIndex)} owner</p>
                <p className="text-green-700/80 text-xs mt-1">Captured in {cityName}</p>
                <button onClick={() => setSuccess(false)} className="mt-4 px-6 py-2 bg-green-600 text-white font-bold rounded-xl active:scale-95 transition-transform text-sm">
                    View Lighter
                </button>
            </div>
        );
    }

    if (alreadyOwns) {
        return (
            <button disabled className="w-full mt-4 bg-gray-200 text-gray-500 font-bold py-4 rounded-xl flex justify-center cursor-not-allowed">
                You own this lighter
            </button>
        );
    }

    return (
        <button
            onClick={handleCapture}
            disabled={loading}
            className="w-full mt-4 bg-[var(--color-davay-primary)] text-white font-bold py-4 rounded-xl shadow-md shadow-[var(--color-davay-primary)]/20 hover:bg-[#c24b23] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100 flex justify-center"
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Securing coordinates...
                </span>
            ) : (
                'Capture this lighter'
            )}
        </button>
    );
}
