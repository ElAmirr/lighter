"use client";

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Data Models
    const [lighters, setLighters] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [rarities, setRarities] = useState<any[]>([]);

    // Form states
    const [loading, setLoading] = useState(false);

    // Lighter Form
    const [lName, setLName] = useState('');
    const [lColl, setLColl] = useState('');
    const [lRar, setLRar] = useState('');
    const [lImage, setLImage] = useState('');

    // Collection Form
    const [cName, setCName] = useState('');
    const [cImage, setCImage] = useState('');

    // Rarity Form
    const [rName, setRName] = useState('');

    // Utils
    const [qrCodeData, setQrCodeData] = useState<{ id: string, encodedUrl: string } | null>(null);

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin') {
            setIsAuthenticated(true);
            fetchData();
        } else alert("Wrong password. Hint: admin");
    };

    const fetchData = async () => {
        const res = await fetch('/api/admin/data?pw=' + password);
        if (res.ok) {
            const data = await res.json();
            setLighters(data.lighters);
            setUsers(data.users);
            setCollections(data.collections);
            setRarities(data.rarities);
            if (data.collections.length > 0) setLColl(data.collections[0].id);
            if (data.rarities.length > 0) setLRar(data.rarities[0].id);
        }
    };

    const uploadImageAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await uploadImageAsBase64(e.target.files[0]);
            setter(base64);
        }
    };

    // --- LIGHTERS CRUD ---
    const createLighter = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/lighters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: 'davay_admin_2026', name: lName, collection_id: lColl, rarity_id: lRar, image_url: lImage })
            });
            if (res.ok) {
                alert("Lighter minted!");
                setLName(''); setLImage('');
                fetchData();
            } else alert("Failed to mint.");
        } finally { setLoading(false); }
    };

    // --- COLLECTIONS CRUD ---
    const createCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/collections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: 'davay_admin_2026', name: cName, image_url: cImage })
            });
            if (res.ok) { setCName(''); setCImage(''); fetchData(); }
        } finally { setLoading(false); }
    };
    const deleteCollection = async (id: string) => {
        await fetch('/api/admin/collections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'davay_admin_2026', action: 'delete', id }) });
        fetchData();
    };

    // --- RARITIES CRUD ---
    const createRarity = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/rarities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: 'davay_admin_2026', name: rName })
            });
            if (res.ok) { setRName(''); fetchData(); }
        } finally { setLoading(false); }
    };
    const deleteRarity = async (id: string) => {
        await fetch('/api/admin/rarities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'davay_admin_2026', action: 'delete', id }) });
        fetchData();
    };

    const generateQr = async (id: string) => {
        const url = `https://davay.tn/l/${id}`;
        const encodedUrl = await QRCode.toDataURL(url);
        setQrCodeData({ id, encodedUrl });
    };

    if (!isAuthenticated) return (
        <div className="fixed inset-0 z-[9999] w-screen h-screen flex flex-col items-center justify-center bg-zinc-900 font-sans">
            <form onSubmit={handleAuth} className="w-full max-w-sm flex flex-col gap-4 p-6">
                <h1 className="text-white text-2xl font-bold">DAVAY ADMIN</h1>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-zinc-800 rounded-lg text-white" placeholder="Password" />
            </form>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[9999] w-screen h-screen overflow-y-auto bg-gray-50 p-4 lg:p-8 flex flex-col font-sans">
            <h1 className="text-3xl font-black mb-6 text-orange-600">DAVAY ADMIN</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* COLLECTIONS MANAGER */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold mb-3">Manage Collections</h2>
                    <form onSubmit={createCollection} className="flex flex-col gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                        <input type="text" value={cName} onChange={e => setCName(e.target.value)} placeholder="Collection Name (e.g. Tunis)" className="p-2 border rounded" required />
                        <label className="text-xs font-bold text-gray-500">Collection Logo / Image</label>
                        <input type="file" onChange={e => handleImageChange(e, setCImage)} accept="image/*" className="text-xs" />
                        {cImage && <img src={cImage} className="h-10 object-contain self-start border bg-white p-1" />}
                        <button disabled={loading} type="submit" className="bg-orange-500 text-white font-bold p-2 rounded">Add Collection</button>
                    </form>
                    <ul className="text-sm flex flex-col gap-2 max-h-40 overflow-auto">
                        {collections.map(c => (
                            <li key={c.id} className="flex justify-between items-center p-2 border rounded">
                                <span className="font-bold flex items-center gap-2">
                                    {c.image_url && <img src={c.image_url} className="h-4 w-4" />} {c.name}
                                </span>
                                <button onClick={() => deleteCollection(c.id)} className="text-red-500 text-xs font-bold">DEL</button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* RARITIES MANAGER */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold mb-3">Manage Rarities</h2>
                    <form onSubmit={createRarity} className="flex flex-col gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                        <input type="text" value={rName} onChange={e => setRName(e.target.value)} placeholder="Rarity (e.g. Legendary)" className="p-2 border rounded" required />
                        <button disabled={loading} type="submit" className="bg-orange-500 text-white font-bold p-2 rounded">Add Rarity</button>
                    </form>
                    <ul className="text-sm flex flex-col gap-2 max-h-40 overflow-auto">
                        {rarities.map(r => (
                            <li key={r.id} className="flex justify-between items-center p-2 border rounded">
                                <span className="font-bold">{r.name}</span>
                                <button onClick={() => deleteRarity(r.id)} className="text-red-500 text-xs font-bold">DEL</button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* QR GENERATOR  */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                    <h2 className="text-lg font-bold mb-3 self-start">QR Generator</h2>
                    {qrCodeData ? (
                        <div className="flex flex-col items-center">
                            <img src={qrCodeData.encodedUrl} alt="QR Code" className="w-32 h-32 border-4 border-gray-100 rounded-xl" />
                            <a href={qrCodeData.encodedUrl} download={`qr-${qrCodeData.id}.png`} className="mt-2 text-xs font-bold bg-zinc-200 p-2 rounded">Download</a>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400">Select an item below.</p>
                    )}
                </div>
            </div>

            <div className="flex gap-6 w-full flex-col lg:flex-row">
                {/* Lighter Creation Form */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 lg:w-1/3">
                    <h2 className="text-xl font-bold mb-4">Mint Lighter</h2>
                    <form onSubmit={createLighter} className="flex flex-col gap-4">
                        <input type="text" value={lName} onChange={e => setLName(e.target.value)} placeholder="Lighter Identifier Name" className="w-full p-3 border rounded-lg" required />
                        <div className="flex gap-3">
                            <select value={lColl} onChange={e => setLColl(e.target.value)} className="w-full p-3 border rounded-lg bg-white" required>
                                <option value="">Select Col...</option>
                                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select value={lRar} onChange={e => setLRar(e.target.value)} className="w-full p-3 border rounded-lg bg-white" required>
                                <option value="">Select Rarity...</option>
                                {rarities.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-gray-500 mb-1">Lighter Specific Photo</label>
                            <input type="file" accept="image/*" onChange={e => handleImageChange(e, setLImage)} className="text-xs border p-2 rounded" />
                            {lImage && <div className="mt-2 text-xs text-green-600 font-bold border border-green-200 bg-green-50 p-2 rounded">Photo queued ({Math.round(lImage.length / 1024)}kb)</div>}
                        </div>
                        <button disabled={loading} type="submit" className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-zinc-800 tracking-wider">MINT</button>
                    </form>
                </div>

                {/* Databases */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex-1 h-[600px] overflow-auto">
                    <h2 className="text-xl font-bold mb-4">Lighters Architecture</h2>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="p-2 border-b">ID / Name</th>
                                <th className="p-2 border-b hidden md:table-cell">Collection</th>
                                <th className="p-2 border-b hidden md:table-cell">Rarity</th>
                                <th className="p-2 border-b text-center">Owner</th>
                                <th className="p-2 border-b">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lighters.map(l => (
                                <tr key={l.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                    <td className="p-2">
                                        <div className="font-bold flex gap-2 items-center">
                                            {l.image_url && <img src={l.image_url} className="w-6 h-6 rounded border object-cover" />}
                                            {l.name}
                                        </div>
                                        <div className="text-xs text-gray-500">#{l.id.slice(0, 6)}</div>
                                    </td>
                                    <td className="p-2 font-medium text-gray-700 hidden md:table-cell">{l.collection?.name || 'Err'}</td>
                                    <td className="p-2 font-medium text-gray-700 hidden md:table-cell">{l.rarity?.name || 'Err'}</td>
                                    <td className="p-2 text-center text-gray-600 font-bold">{l.current_owner?.username || '-'}</td>
                                    <td className="p-2">
                                        <button onClick={() => generateQr(l.id)} className="px-3 py-1 bg-black text-white text-xs font-bold rounded hover:bg-zinc-800">Print QR</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
