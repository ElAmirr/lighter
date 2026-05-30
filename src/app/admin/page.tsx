"use client";

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [name, setName] = useState('');
    const [collection, setCollection] = useState('Tunis');
    const [rarity, setRarity] = useState('Common');

    const [lighters, setLighters] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    const [qrCodeData, setQrCodeData] = useState<{ id: string, encodedUrl: string } | null>(null);

    const [loading, setLoading] = useState(false);

    // Authenticate simple
    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin') {
            setIsAuthenticated(true);
            fetchData();
        } else {
            alert("Wrong password. Hint: admin");
        }
    };

    const fetchData = async () => {
        // In a real app we'd fetch via secure endpoints, for MVP we can use server actions
        // But since we just want a working admin, I'll mock the fetch or use a separate API
        const res = await fetch('/api/admin/data?pw=' + password);
        if (res.ok) {
            const data = await res.json();
            setLighters(data.lighters);
            setUsers(data.users);
        }
    };

    const createLighter = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/lighters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: 'davay_admin_2026', name, collection, rarity })
            });
            if (res.ok) {
                alert("Lighter created successfully!");
                fetchData(); // Refresh list
            }
        } catch {
            alert("Error creating lighter");
        } finally {
            setLoading(false);
        }
    };

    const generateQr = async (id: string) => {
        try {
            // Typically it's the absolute URL. Since it's scanned by mobile phones:
            const url = `https://davay.tn/l/${id}`; // production domain
            const encodedUrl = await QRCode.toDataURL(url);
            setQrCodeData({ id, encodedUrl });
        } catch (err) {
            console.error(err);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 z-[9999] w-screen h-screen flex flex-col items-center justify-center p-6 bg-zinc-900 text-white">
                <h1 className="text-2xl font-bold mb-6">ADMIN PORTAL</h1>
                <form onSubmit={handleAuth} className="w-full max-w-sm flex flex-col gap-4">
                    <input
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800 rounded-lg text-white outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Master password"
                    />
                    <button type="submit" className="w-full py-3 bg-orange-600 font-bold rounded-lg hover:bg-orange-700">Enter</button>
                </form>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] w-screen h-screen overflow-y-auto bg-gray-50 p-6 flex flex-col font-sans">
            <h1 className="text-3xl font-black mb-8 text-orange-600">DAVAY ARCHITECTURE</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* CREATE LIGHTER */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold mb-4">Mint New Lighter</h2>
                    <form onSubmit={createLighter} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 p-3 border rounded-lg" placeholder="Tunis Glow #001" />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Collection</label>
                                <select value={collection} onChange={e => setCollection(e.target.value)} className="w-full mt-1 p-3 border rounded-lg bg-white">
                                    <option>Tunis</option>
                                    <option>Sfax</option>
                                    <option>Sahel</option>
                                    <option>Meme</option>
                                    <option>Carthage</option>
                                    <option>Default</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Rarity</label>
                                <select value={rarity} onChange={e => setRarity(e.target.value)} className="w-full mt-1 p-3 border rounded-lg bg-white">
                                    <option>Common</option>
                                    <option>Uncommon</option>
                                    <option>Rare</option>
                                    <option>Epic</option>
                                    <option>Legendary</option>
                                </select>
                            </div>
                        </div>
                        <button disabled={loading} type="submit" className="w-full py-3 mt-2 bg-black text-white font-bold rounded-lg hover:bg-zinc-800">
                            {loading ? 'Minting...' : 'Create Lighter'}
                        </button>
                    </form>
                </div>

                {/* QR CODE VIEWER */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[300px]">
                    <h2 className="text-xl font-bold mb-4 self-start">QR Generator</h2>
                    {qrCodeData ? (
                        <div className="flex flex-col items-center">
                            <img src={qrCodeData.encodedUrl} alt="QR Code" className="w-48 h-48 border-4 border-gray-100 rounded-xl" />
                            <p className="mt-4 text-sm font-bold text-gray-500">ID: {qrCodeData.id}</p>
                            <a href={qrCodeData.encodedUrl} download={`davay-qr-${qrCodeData.id}.png`} className="mt-4 px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-lg hover:bg-orange-200">
                                Download Code
                            </a>
                        </div>
                    ) : (
                        <div className="text-gray-400 font-medium">Select a lighter from the list to generate its QR.</div>
                    )}
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

                {/* LIGHTERS LIST */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[500px] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">Lighters Database</h2>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="p-2 border-b">ID / Name</th>
                                <th className="p-2 border-b text-center">Scans</th>
                                <th className="p-2 border-b">Owner</th>
                                <th className="p-2 border-b">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lighters.map(l => (
                                <tr key={l.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                    <td className="p-2">
                                        <div className="font-bold">{l.name}</div>
                                        <div className="text-xs text-gray-500">#{l.id.slice(0, 6)}</div>
                                    </td>
                                    <td className="p-2 text-center font-bold text-orange-500">{l.scan_count}</td>
                                    <td className="p-2 text-gray-600">{l.current_owner?.username || 'None'}</td>
                                    <td className="p-2">
                                        <button onClick={() => generateQr(l.id)} className="px-3 py-1 bg-black text-white text-xs font-bold rounded hover:bg-zinc-800">
                                            Print QR
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* USERS LIST */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[500px] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">Users Directory</h2>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="p-2 border-b">Username</th>
                                <th className="p-2 border-b text-center">Captures</th>
                                <th className="p-2 border-b">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                    <td className="p-2 font-bold">{u.username}</td>
                                    <td className="p-2 text-center text-orange-500 font-bold">{u.history_entries?.length || 0}</td>
                                    <td className="p-2 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>

        </div>
    );
}
