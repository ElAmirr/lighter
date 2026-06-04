'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/notifications')
            .then(r => r.json())
            .then(data => {
                if (data.notifications) {
                    setNotifications(data.notifications);
                }
                setLoading(false);
                // Mark as read after a short delay
                if (data.unreadCount > 0) {
                    setTimeout(() => fetch('/api/notifications/read', { method: 'POST' }), 2000);
                }
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div style={{ padding: '24px 20px', paddingBottom: 100 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 24, alignSelf: 'flex-start', fontFamily: 'Lalezar, system-ui' }}>Notifications</h1>

            {loading ? (
                <div style={{ textAlign: 'center', opacity: 0.5, marginTop: 40 }}>Loading...</div>
            ) : notifications.length === 0 ? (
                <div style={{ textAlign: 'center', opacity: 0.3, marginTop: 60, fontWeight: 700 }}>
                    <div style={{ fontSize: 40, filter: 'grayscale(1)', marginBottom: 8 }}>🔕</div>
                    No alerts right now
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {notifications.map(n => (
                        <div key={n.id} style={{
                            padding: '16px', background: n.type === 'REVENGE' ? '#2a0808' : 'var(--bg-card)',
                            borderRadius: 16, border: '1px solid',
                            borderColor: n.type === 'REVENGE' ? '#8B0000' : (n.is_read ? 'var(--border)' : '#D85A30'),
                            position: 'relative'
                        }}>
                            {!n.is_read && (
                                <div style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', background: '#D85A30' }} />
                            )}
                            <div style={{ fontSize: 13, fontWeight: 800, color: n.type === 'REVENGE' ? '#FF4500' : '#D85A30', marginBottom: 4 }}>
                                {n.title}
                            </div>
                            <div style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.4, fontWeight: n.is_read ? 500 : 700 }}>
                                {n.message}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
