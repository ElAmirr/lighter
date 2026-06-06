"use client";

import { useState, useEffect } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

export default function ScanPage() {
    const router = useRouter();
    const [errorString, setErrorString] = useState<string | null>(null);
    const [isHttpWarning, setIsHttpWarning] = useState(false);

    useEffect(() => {
        if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
            setIsHttpWarning(true);
        }
    }, []);

    const handleScan = (result: any) => {
        if (result && result.length > 0) {
            const scannedUrl = result[0].rawValue;
            if (scannedUrl.includes('/l/')) {
                const urlObj = new URL(scannedUrl);
                router.push(urlObj.pathname);
            } else {
                setErrorString("QR code مش صالح - هذا ليس QR ديال ولاعة.");
            }
        }
    };

    return (
        <>
            <TopBar rightLabel="Scanner" />
            <div className="flex flex-col flex-1 items-center justify-start p-6 bg-zinc-900 text-white min-h-[85vh]">

                <h1 className="text-2xl font-bold mb-2 tracking-tighter mt-4 text-center">Scan Lighter</h1>
                <p className="text-center text-xs text-[var(--color-davay-hint)] max-w-[280px] leading-relaxed mb-6">
                    قابل ولاعة هات شعول فيزيائية وسدد الكاميرا على QR ديالها.
                </p>

                {isHttpWarning && (
                    <div className="w-full bg-red-900/50 border border-red-500/50 text-red-200 text-xs p-4 rounded-xl flex items-start gap-3 mb-6">
                        <AlertCircle className="shrink-0 text-red-400 mt-0.5" size={16} />
                        <div>
                            <p className="font-bold mb-1">Camera Blocked by Your Phone</p>
                            <p>For security, iOS and Android only allow camera access on HTTPS or localhost. Because you are on {typeof window !== 'undefined' ? window.location.host : 'this site'}, the camera will not open.</p>
                        </div>
                    </div>
                )}

                <div className="w-full max-w-[300px] aspect-square rounded-3xl overflow-hidden bg-black/50 border-4 border-[var(--color-davay-primary)] shadow-[0_0_30px_rgba(240,84,35,0.3)] relative">
                    <Scanner
                        onScan={handleScan}
                        onError={(err) => setErrorString(err instanceof Error ? err.message : 'Camera blocked or unavailable')}
                    />
                </div>

                {errorString && (
                    <div className="mt-6 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm rounded-lg text-center">
                        {errorString}
                    </div>
                )}

            </div>
        </>
    );
}
