"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";

export function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [subscribeError, setSubscribeError] = useState<string | null>(null);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
            registerServiceWorker();
        }
    }, []);

    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
    }

    async function subscribeToPush() {
        if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return;
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
            });
            setSubscription(sub);
            setPermission('granted');

            // Send to our API
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sub)
            });
        } catch (error: any) {
            console.error('Error subscribing to push', error);
            setSubscribeError(error.message || 'Required HTTPS to subscribe');
            setPermission(Notification.permission);
        }
    }

    // HTTP warning helper
    const isHttpOnMobile = typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost';

    if (!isSupported || permission === 'granted' || permission === 'denied') {
        if (!isSupported && isHttpOnMobile) {
            return (
                <div className="bg-orange-500/10 border border-orange-500/50 p-4 rounded-2xl mb-4 shadow-sm text-center">
                    <p className="text-orange-400 font-bold text-sm mb-1">Push Notifications Blocked</p>
                    <p className="text-xs text-orange-400/80">iOS/Android require HTTPS connections to turn on notifications. You are currently on HTTP.</p>
                </div>
            );
        }
        return null; // Don't show anything if already subscribed or denied
    }

    return (
        <div className="bg-[#D85A30] text-white p-4 rounded-2xl mb-4 shadow-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <Bell size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Turn on notifications</p>
                        <p className="text-xs text-white/80">Know exactly who steals your lighter 🔥</p>
                    </div>
                </div>
                <button
                    onClick={subscribeToPush}
                    className="bg-white text-[#D85A30] font-bold text-xs px-4 py-2 rounded-xl shadow-sm hover:scale-95 transition-transform"
                >
                    Turn On
                </button>
            </div>
            {subscribeError && (
                <div className="mt-3 text-[11px] font-bold text-white/90 bg-black/20 p-2 rounded-lg">
                    ⚠️ {subscribeError}
                </div>
            )}
        </div>
    );
}
