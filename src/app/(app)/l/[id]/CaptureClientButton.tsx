"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        setLoading(true);

        if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
            submitCapture(null, null, "Unknown");
            return;
        }

        if (!navigator.geolocation) {
            submitCapture(null, null, "Unknown");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                let city = "Unknown";

                try {
                    const geoRes = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`,
                        { headers: { 'User-Agent': 'DAVAY-App/1.0' } }
                    );
                    const geoData = await geoRes.json();
                    city = geoData.address?.city
                        || geoData.address?.town
                        || geoData.address?.village
                        || geoData.address?.municipality
                        || geoData.address?.county
                        || geoData.address?.state
                        || geoData.address?.country
                        || "Unknown";
                } catch (e) {
                    console.error("Geocoding failed", e);
                    // Still have coords even if city lookup failed
                }

                submitCapture(lat, lon, city);
            },
            (error) => {
                console.error("Location error", error.code, error.message);
                submitCapture(null, null, "Unknown");
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
        );
    };

    const submitCapture = async (lat: number | null, lon: number | null, city: string) => {
        try {
            const res = await fetch('/api/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lighter_id: lighterId, latitude: lat, longitude: lon, city_name: city })
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.detail || body.error || `HTTP ${res.status}`);
            }

            setCityName(city);
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
                <p className="text-green-700 text-sm font-medium">You are the {ownerIndex}th owner</p>
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
