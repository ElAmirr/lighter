"use client";

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState<'lighters' | 'collections' | 'rarities' | 'users'>('lighters');
    const [loading, setLoading] = useState(false);

    // Data records
    const [lighters, setLighters] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [rarities, setRarities] = useState<any[]>([]);

    // Forms State
    const [lighterForm, setLighterForm] = useState({ name: '', collection_id: '', rarity_id: '', image_url: '' });
    const [collectionForm, setCollectionForm] = useState({ name: '', image_url: '' });
    const [rarityForm, setRarityForm] = useState({ name: '' });

    const [qrCodeData, setQrCodeData] = useState<{ id: string, encodedUrl: string } | null>(null);

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
        const res = await fetch('/api/admin/data?pw=' + password);
        if (res.ok) {
            const data = await res.json();
            setLighters(data.lighters);
            setUsers(data.users);
            setCollections(data.collections);
            setRarities(data.rarities);
        }
    };

    const handleLighterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const b64 = await convertToBase64(e.target.files[0]);
        setLighterForm({ ...lighterForm, image_url: b64 });
    };

    const handleCollectionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const b64 = await convertToBase64(e.target.files[0]);
        setCollectionForm({ ...collectionForm, image_url: b64 });
    };

    const createLighter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lighterForm.collection_id || !lighterForm.rarity_id) return alert("Select collection and rarity!");
        setLoading(true);
        try {
            const res = await fetch('/api/admin/lighters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: 'davay_admin_2026', ...lighterForm })
            });
            if (res.ok) {
                alert("Lighter created!");
                setLighterForm({ name: '', collection_id: '', rarity_id: '', image_url: '' });
                fetchData();
            }
        } finally { setLoading(false); }
    };

    const createCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/collections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: 'davay_admin_2026', ...collectionForm })
            });
            if (res.ok) {
                alert("Collection created!");
                setCollectionForm({ name: '', image_url: '' });
                fetchData();
            }
        } finally { setLoading(false); }
    };

    const deleteCollection = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await fetch(`/api/admin/collections?pw=davay_admin_2026&id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    const createRarity = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/rarities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: 'davay_admin_2026', ...rarityForm })
            });
            if (res.ok) {
                alert("Rarity created!");
                setRarityForm({ name: '' });
                fetchData();
            }
        } finally { setLoading(false); }
    };

    const deleteRarity = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await fetch(`/api/admin/rarities?pw=davay_admin_2026&id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    const generateQr = async (id: string) => {
        try {
            const url = `https://davay.tn/l/${id}`;
            const encodedUrl = await QRCode.toDataURL(url);
            setQrCodeData({ id, encodedUrl });
        } catch (err) { console.error(err); }
    };

    if (!isAuthenticated) return (
        <div className="fixed inset-0 z-[9999] w-screen h-screen flex flex-col items-center justify-center p-6 bg-zinc-900 text-white">
            <h1 className="text-2xl font-bold mb-6">ADMIN PORTAL</h1>
            <form onSubmit={handleAuth} className="w-full max-w-sm flex flex-col gap-4">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-zinc-800 rounded text-white" placeholder="Master password" />
                <button type="submit" className="w-full py-3 bg-orange-600 font-bold rounded">Enter</button>
            </form>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[9999] w-screen h-screen overflow-y-auto bg-gray-50 p-6 font-sans">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-orange-600">DAVAY ADMIN</h1>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('lighters')} className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'lighters' ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>Lighters</button>
                    <button onClick={() => setActiveTab('collections')} className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'collections' ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>Collections</button>
                    <button onClick={() => setActiveTab('rarities')} className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'rarities' ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>Rarities</button>
                    <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'users' ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>Users</button>
                </div>
            </div>

            {/* TAB: LIGHTERS */}
            {activeTab === 'lighters' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
                        <h2 className="text-xl font-bold mb-4">Mint Lighter</h2>
                        <form onSubmit={createLighter} className="flex flex-col gap-4 overflow-y-auto pr-2">
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Name</label><input type="text" value={lighterForm.name} onChange={e => setLighterForm({ ...lighterForm, name: e.target.value })} required className="w-full mt-1 p-2 border rounded" placeholder="Lighter Name" /></div>

                            <div className="flex gap-4">
                                <div className="flex-1"><label className="text-xs font-bold text-gray-500 uppercase">Collection</label>
                                    <select required value={lighterForm.collection_id} onChange={e => setLighterForm({ ...lighterForm, collection_id: e.target.value })} className="w-full mt-1 p-2 border rounded bg-white">
                                        <option value="" disabled>Select</option>
                                        {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select></div>
                                <div className="flex-1"><label className="text-xs font-bold text-gray-500 uppercase">Rarity</label>
                                    <select required value={lighterForm.rarity_id} onChange={e => setLighterForm({ ...lighterForm, rarity_id: e.target.value })} className="w-full mt-1 p-2 border rounded bg-white">
                                        <option value="" disabled>Select</option>
                                        {rarities.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select></div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Photo Upload</label>
                                <input type="file" accept="image/*" onChange={handleLighterImageUpload} className="w-full mt-1 p-2 border rounded text-sm" />
                                {lighterForm.image_url && <img src={lighterForm.image_url} className="mt-2 w-16 h-16 object-cover rounded-lg border" />}
                            </div>

                            <button disabled={loading} type="submit" className="w-full py-3 mt-4 bg-black text-white font-bold rounded-lg hover:bg-zinc-800">{loading ? 'Minting...' : 'Mint Lighter'}</button>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[500px] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Lighters Database</h2>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100 sticky top-0"><tr><th className="p-2 border-b">ID/Auth</th><th className="p-2 border-b">Photo/Name</th><th className="p-2 border-b">Stats</th><th className="p-2 border-b">Action</th></tr></thead>
                            <tbody>
                                {lighters.map(l => (
                                    <tr key={l.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2"><div className="text-xs text-gray-500 mb-1 max-w-[80px] truncate" title={l.id}>{l.id}</div><div className="font-bold text-xs">{l.collection?.name} / {l.rarity?.name}</div></td>
                                        <td className="p-2 flex items-center gap-2">
                                            {l.image_url ? <img src={l.image_url} className="w-8 h-8 rounded shrink-0 object-cover" /> : <div className="w-8 h-8 rounded bg-gray-200 shrink-0" />}
                                            <span className="font-bold">{l.name}</span>
                                        </td>
                                        <td className="p-2"><div className="font-bold text-orange-600">{l.scan_count} Scans</div><div className="text-xs text-gray-500">Owner: {l.current_owner?.username || 'None'}</div></td>
                                        <td className="p-2"><button onClick={() => generateQr(l.id)} className="px-3 py-1 bg-black text-white text-xs font-bold rounded">Print QR</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {qrCodeData && (
                        <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center">
                            <h2 className="text-xl font-bold mb-4 self-start">QR Print Tool</h2>
                            <img src={qrCodeData.encodedUrl} alt="QR Code" className="w-48 h-48 border-4 border-gray-100 rounded-xl" />
                            <p className="mt-4 text-sm font-bold text-gray-500">ID: {qrCodeData.id}</p>
                            <a href={qrCodeData.encodedUrl} download={`davay-qr-${qrCodeData.id}.png`} className="mt-4 px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-lg hover:bg-orange-200">Download Tag</a>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: COLLECTIONS */}
            {activeTab === 'collections' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold mb-4">Add Collection</h2>
                        <form onSubmit={createCollection} className="flex flex-col gap-4">
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Collection Name</label><input type="text" value={collectionForm.name} onChange={e => setCollectionForm({ ...collectionForm, name: e.target.value })} required className="w-full mt-1 p-2 border rounded" placeholder="e.g. Origins" /></div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Collection Cover Photo</label>
                                <input type="file" accept="image/*" onChange={handleCollectionImageUpload} className="w-full mt-1 p-2 border rounded text-sm" />
                                {collectionForm.image_url && <img src={collectionForm.image_url} className="mt-2 w-16 h-16 object-cover rounded-lg border" />}
                            </div>
                            <button disabled={loading} type="submit" className="w-full py-3 mt-4 bg-black text-white font-bold rounded-lg hover:bg-zinc-800">Create</button>
                        </form>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold mb-4">Collections Database</h2>
                        <ul className="flex flex-col gap-2">
                            {collections.length === 0 && <p className="text-gray-400 font-medium p-4">No collections exist. Create one!</p>}
                            {collections.map(c => (
                                <li key={c.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        {c.image_url ? <img src={c.image_url} className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded bg-gray-200" />}
                                        <span className="font-bold">{c.name}</span>
                                    </div>
                                    <button onClick={() => deleteCollection(c.id)} className="text-red-500 text-xs font-bold uppercase hover:underline">Delete</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* TAB: RARITIES */}
            {activeTab === 'rarities' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-min">
                        <h2 className="text-xl font-bold mb-4">Add Rarity Level</h2>
                        <form onSubmit={createRarity} className="flex flex-col gap-4">
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Rarity Name</label><input type="text" value={rarityForm.name} onChange={e => setRarityForm({ ...rarityForm, name: e.target.value })} required className="w-full mt-1 p-2 border rounded" placeholder="e.g. Legendary" /></div>
                            <button disabled={loading} type="submit" className="w-full py-3 mt-2 bg-black text-white font-bold rounded-lg hover:bg-zinc-800">Create</button>
                        </form>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-min">
                        <h2 className="text-xl font-bold mb-4">Rarities Database</h2>
                        <ul className="flex flex-col gap-2">
                            {rarities.length === 0 && <p className="text-gray-400 font-medium p-4">No rarities exist. Create them!</p>}
                            {rarities.map(r => (
                                <li key={r.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                                    <span className="font-bold">{r.name}</span>
                                    <button onClick={() => deleteRarity(r.id)} className="text-red-500 text-xs font-bold uppercase hover:underline">Delete</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* TAB: USERS */}
            {activeTab === 'users' && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold mb-4">Users Directory</h2>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100"><tr><th className="p-2 border-b">Username</th><th className="p-2 border-b text-center">Captures</th><th className="p-2 border-b">Joined</th></tr></thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b">
                                    <td className="p-2 font-bold">{u.username}</td>
                                    <td className="p-2 text-center text-orange-500 font-bold">{u.history_entries?.length || 0}</td>
                                    <td className="p-2 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
