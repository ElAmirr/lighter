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
    const [xpConfig, setXpConfig] = useState<any>(null); // kept for safe removal
    const [dailyMission, setDailyMission] = useState<any>(null);
    const [levels, setLevels] = useState<any[]>([]);
    const [newLevel, setNewLevel] = useState({ level: '', xp_required: '', title: '' });
    const [editingLevelId, setEditingLevelId] = useState<number | null>(null);
    const [editingLevel, setEditingLevel] = useState({ level: '', xp_required: '', title: '' });

    const [achievements, setAchievements] = useState<any[]>([]);
    const [newAchievement, setNewAchievement] = useState({ title: '', icon: 'Zap', color: '#FFD60A', goal_type: 'captures', goal_count: '1', goal_string: '' });
    const [editingAchievementId, setEditingAchievementId] = useState<number | null>(null);
    const [editingAchievement, setEditingAchievement] = useState({ title: '', icon: 'Zap', color: '#FFD60A', goal_type: 'captures', goal_count: '1', goal_string: '' });

    // Users editing state
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState({ username: '', email: '', newPassword: '' });

    // Form states
    const [loading, setLoading] = useState(false);

    // Lighter Form
    const [editLighterId, setEditLighterId] = useState<string | null>(null);
    const [lName, setLName] = useState('');
    const [lColl, setLColl] = useState('');
    const [lRar, setLRar] = useState('');
    const [lImage, setLImage] = useState('');

    // Collection Form
    const [editCollectionId, setEditCollectionId] = useState<string | null>(null);
    const [cName, setCName] = useState('');
    const [cImage, setCImage] = useState('');

    // Rarity Form
    const [editRarityId, setEditRarityId] = useState<string | null>(null);
    const [rName, setRName] = useState('');
    const [rXp, setRXp] = useState<number>(0);

    // Utils
    const [qrCodeData, setQrCodeData] = useState<{ id: string, encodedUrl: string } | null>(null);

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin') {
            setIsAuthenticated(true);
            fetchData();
            fetchDailyMission();
            fetchLevels();
            fetchAchievements();
        } else alert("Wrong password. Hint: admin");
    };

    const fetchAchievements = async () => {
        const res = await fetch('/api/admin/achievements?pw=davay_admin_2026');
        if (res.ok) setAchievements(await res.json());
    };

    const fetchLevels = async () => {
        const res = await fetch('/api/admin/levels?pw=davay_admin_2026');
        if (res.ok) setLevels(await res.json());
    };

    const fetchDailyMission = async () => {
        const res = await fetch('/api/admin/daily-mission?pw=davay_admin_2026');
        if (res.ok) setDailyMission(await res.json());
    };


    const fetchData = async () => {
        const res = await fetch('/api/admin/data?pw=' + password);
        if (res.ok) {
            const data = await res.json();
            setLighters(data.lighters);
            setUsers(data.users);
            setCollections(data.collections);
            setRarities(data.rarities);
            if (data.collections.length > 0 && !editLighterId) setLColl(data.collections[0].id);
            if (data.rarities.length > 0 && !editLighterId) setLRar(data.rarities[0].id);
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
    const resetLighterForm = () => { setEditLighterId(null); setLName(''); setLImage(''); };
    const createOrUpdateLighter = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/lighters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: 'davay_admin_2026', action: editLighterId ? 'edit' : 'create', id: editLighterId, name: lName, collection_id: lColl, rarity_id: lRar, image_url: lImage })
            });
            if (res.ok) {
                alert(editLighterId ? "Lighter updated!" : "Lighter minted!");
                resetLighterForm();
                fetchData();
            } else alert("Failed to mint/update.");
        } finally { setLoading(false); }
    };
    const deleteLighter = async (id: string) => {
        if (!confirm('Are you sure you want to delete this lighter?')) return;
        await fetch('/api/admin/lighters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'davay_admin_2026', action: 'delete', id }) });
        fetchData();
    };
    const editLighter = (l: any) => {
        setEditLighterId(l.id); setLName(l.name); setLColl(l.collection_id); setLRar(l.rarity_id); setLImage('');
    };

    // --- COLLECTIONS CRUD ---
    const resetCollectionForm = () => { setEditCollectionId(null); setCName(''); setCImage(''); };
    const createOrUpdateCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/collections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: 'davay_admin_2026', action: editCollectionId ? 'edit' : 'create', id: editCollectionId, name: cName, ...(cImage ? { image_url: cImage } : {}) })
            });
            if (res.ok) { resetCollectionForm(); fetchData(); }
        } finally { setLoading(false); }
    };
    const editCollection = (c: any) => { setEditCollectionId(c.id); setCName(c.name); setCImage(c.image_url || ''); };
    const deleteCollection = async (id: string) => {
        if (!confirm('Are you sure you want to delete this collection?')) return;
        await fetch('/api/admin/collections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'davay_admin_2026', action: 'delete', id }) });
        fetchData();
    };

    // --- RARITIES CRUD ---
    const resetRarityForm = () => { setEditRarityId(null); setRName(''); setRXp(0); };
    const createOrUpdateRarity = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/rarities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: 'davay_admin_2026', action: editRarityId ? 'edit' : 'create', id: editRarityId, name: rName, xp_reward: rXp })
            });
            if (res.ok) { resetRarityForm(); fetchData(); }
        } finally { setLoading(false); }
    };
    const editRarity = (r: any) => { setEditRarityId(r.id); setRName(r.name); setRXp(r.xp_reward || 0); };
    const deleteRarity = async (id: string) => {
        if (!confirm('Are you sure you want to delete this rarity?')) return;
        await fetch('/api/admin/rarities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'davay_admin_2026', action: 'delete', id }) });
        fetchData();
    };

    const generateQr = async (id: string) => {
        const url = `https://davay.tn/l/${id}`;
        const encodedUrl = await QRCode.toDataURL(url);
        setQrCodeData({ id, encodedUrl });
    };

    const handleAddLevel = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('/api/admin/levels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'davay_admin_2026', ...newLevel }) });
            setNewLevel({ level: '', xp_required: '', title: '' });
            fetchLevels();
        } finally { setLoading(false); }
    };

    const handleUpdateLevel = async (id: number) => {
        setLoading(true);
        try {
            await fetch('/api/admin/levels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'davay_admin_2026', action: 'update', id, ...editingLevel }) });
            setEditingLevelId(null);
            fetchLevels();
        } finally { setLoading(false); }
    };

    const handleDeleteLevel = async (id: number) => {
        if (!confirm('Delete this level?')) return;
        await fetch('/api/admin/levels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'davay_admin_2026', action: 'delete', id }) });
        fetchLevels();
    };

    const handleAddAchievement = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('/api/admin/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'davay_admin_2026', ...newAchievement }) });
            setNewAchievement({ title: '', icon: 'Zap', color: '#FFD60A', goal_type: 'captures', goal_count: '1', goal_string: '' });
            fetchAchievements();
        } finally { setLoading(false); }
    };

    const handleUpdateAchievement = async (id: number) => {
        setLoading(true);
        try {
            await fetch('/api/admin/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'davay_admin_2026', action: 'update', id, ...editingAchievement }) });
            setEditingAchievementId(null);
            fetchAchievements();
        } finally { setLoading(false); }
    };

    const handleDeleteAchievement = async (id: number) => {
        if (!confirm('Delete this achievement?')) return;
        await fetch('/api/admin/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'davay_admin_2026', action: 'delete', id }) });
        fetchAchievements();
    };

    // --- USERS CRUD ---
    const handleUpdateUser = async (id: string) => {
        setLoading(true);
        try {
            await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: 'davay_admin_2026', action: 'update', id, ...editingUser })
            });
            setEditingUserId(null);
            fetchData(); // refresh full users list from initial data endpoint
        } finally { setLoading(false); }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('CAUTION: This deletes the user and all their footprints. Proceed?')) return;
        await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'davay_admin_2026', action: 'delete', id })
        });
        fetchData();
    };

    const handleUpdateMission = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('/api/admin/daily-mission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: 'davay_admin_2026', ...dailyMission })
            });
            alert("Weekly Mission Updated!");
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) return (
        <div className="fixed inset-0 z-[9999] w-screen h-screen flex flex-col items-center justify-center bg-[#0F1014] font-sans">
            <form onSubmit={handleAuth} className="w-full max-w-sm flex flex-col gap-4 p-8 bg-[#1B1B1F] border border-[rgba(255,255,255,0.08)] rounded-3xl shadow-2xl">
                <h1 className="text-white text-2xl font-black tracking-widest text-center mb-2">DAVAY <span className="text-[#FFD60A]">ADMIN</span></h1>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-4 bg-[#0F1014] border border-[rgba(255,255,255,0.1)] rounded-2xl text-white font-bold placeholder:text-zinc-600 focus:outline-none focus:border-[#FFD60A]" placeholder="Enter Admin Password" />
            </form>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[9999] w-screen h-screen overflow-y-auto bg-[#0F1014] p-4 lg:p-8 flex flex-col font-sans text-zinc-100">
            <h1 className="text-3xl font-black mb-6 tracking-widest border-b border-[rgba(255,255,255,0.05)] pb-4">DAVAY <span className="text-[#FFD60A]">ADMIN DASHBOARD</span></h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* COLLECTIONS MANAGER */}
                <div className="bg-[#1B1B1F] p-5 rounded-3xl shadow-lg border border-[rgba(255,255,255,0.08)]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold tracking-wide">Manage Collections</h2>
                        {editCollectionId && <button onClick={resetCollectionForm} className="text-xs text-red-500 font-bold hover:underline">Cancel Edit</button>}
                    </div>
                    <form onSubmit={createOrUpdateCollection} className="flex flex-col gap-3 mb-5 p-4 bg-[#0F1014] rounded-2xl border border-[rgba(255,255,255,0.03)]">
                        <input type="text" value={cName} onChange={e => setCName(e.target.value)} placeholder="Collection Name (e.g. Tunis)" className="p-3 bg-[#1B1B1F] border border-[rgba(255,255,255,0.08)] rounded-xl font-bold focus:outline-none focus:border-[#FFD60A]" required />
                        <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                            Collection Logo / Image {editCollectionId ? '— click to replace' : ''}
                        </label>
                        {cImage && (
                            <div className="relative self-start">
                                <img src={cImage} className="h-14 w-14 object-cover border border-[#FFD60A] rounded-xl p-1" />
                                {editCollectionId && <span className="absolute -top-2 -right-2 bg-[#FFD60A] text-[#121212] text-[9px] font-black px-1.5 py-0.5 rounded-sm">CURRENT</span>}
                            </div>
                        )}
                        <input type="file" onChange={e => handleImageChange(e, setCImage)} accept="image/*" className="text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#FFD60A]/10 file:text-[#FFD60A] hover:file:bg-[#FFD60A]/20" />
                        <button disabled={loading} type="submit" className="bg-[#FFD60A] text-[#121212] font-black tracking-widest p-3 rounded-xl mt-2 active:scale-95 transition-transform">
                            {editCollectionId ? 'UPDATE COLLECTION' : 'ADD COLLECTION'}
                        </button>
                    </form>
                    <ul className="text-sm flex flex-col gap-2 max-h-48 overflow-auto pr-2 custom-scrollbar">
                        {collections.map(c => (
                            <li key={c.id} className="flex justify-between items-center p-3 bg-[#0F1014] border border-[rgba(255,255,255,0.03)] rounded-xl hover:border-[#FFD60A]/30 transition-colors">
                                <span className="font-bold flex items-center gap-3">
                                    {c.image_url ? <img src={c.image_url} className="h-8 w-8 object-cover rounded-md" /> : <div className="h-8 w-8 rounded-md bg-zinc-800" />}
                                    {c.name}
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => editCollection(c)} className="text-[#FFD60A] text-[10px] font-black tracking-widest px-2 py-1 bg-[#FFD60A]/10 rounded-md">EDIT</button>
                                    <button onClick={() => deleteCollection(c.id)} className="text-red-500 text-[10px] font-black tracking-widest px-2 py-1 bg-red-500/10 rounded-md">DEL</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* RARITIES MANAGER */}
                <div className="bg-[#1B1B1F] p-5 rounded-3xl shadow-lg border border-[rgba(255,255,255,0.08)]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold tracking-wide">Manage Rarities</h2>
                        {editRarityId && <button onClick={resetRarityForm} className="text-xs text-red-500 font-bold hover:underline">Cancel Edit</button>}
                    </div>
                    <form onSubmit={createOrUpdateRarity} className="flex flex-col gap-3 mb-5 p-4 bg-[#0F1014] rounded-2xl border border-[rgba(255,255,255,0.03)]">
                        <input type="text" value={rName} onChange={e => setRName(e.target.value)} placeholder="Rarity (e.g. Legendary)" className="p-3 bg-[#1B1B1F] border border-[rgba(255,255,255,0.08)] rounded-xl font-bold focus:outline-none focus:border-[#FFD60A]" required />
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] uppercase font-black text-zinc-500 whitespace-nowrap">XP REWARD:</label>
                            <input type="number" value={rXp} onChange={e => setRXp(parseInt(e.target.value) || 0)} className="w-full p-3 bg-[#1B1B1F] border border-[rgba(255,255,255,0.08)] rounded-xl font-bold focus:outline-none focus:border-[#FFD60A]" required />
                        </div>
                        <button disabled={loading} type="submit" className="bg-[#FFD60A] text-[#121212] font-black tracking-widest p-3 rounded-xl mt-2 active:scale-95 transition-transform">
                            {editRarityId ? 'UPDATE RARITY' : 'ADD RARITY'}
                        </button>
                    </form>
                    <ul className="text-sm flex flex-col gap-2 max-h-48 overflow-auto pr-2 custom-scrollbar">
                        {rarities.map(r => (
                            <li key={r.id} className="flex justify-between items-center p-3 bg-[#0F1014] border border-[rgba(255,255,255,0.03)] rounded-xl hover:border-[#FFD60A]/30 transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-bold">{r.name}</span>
                                    <span className="text-[9px] text-[#FFD60A] font-black tracking-widest mt-0.5">+{r.xp_reward || 0} XP</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => editRarity(r)} className="text-[#FFD60A] text-[10px] font-black tracking-widest px-2 py-1 bg-[#FFD60A]/10 rounded-md">EDIT</button>
                                    <button onClick={() => deleteRarity(r.id)} className="text-red-500 text-[10px] font-black tracking-widest px-2 py-1 bg-red-500/10 rounded-md">DEL</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* QR GENERATOR  */}
                <div className="bg-[#1B1B1F] p-5 rounded-3xl shadow-lg border border-[rgba(255,255,255,0.08)] flex flex-col items-center justify-center">
                    <h2 className="text-lg font-bold mb-5 self-start tracking-wide">QR Generator</h2>
                    {qrCodeData ? (
                        <div className="flex flex-col items-center p-4 bg-[#0F1014] rounded-2xl border border-[rgba(255,255,255,0.05)] w-full">
                            <img src={qrCodeData.encodedUrl} alt="QR Code" className="w-40 h-40 border-4 border-white rounded-xl mb-4" />
                            <a href={qrCodeData.encodedUrl} download={`qr-${qrCodeData.id}.png`} className="text-xs font-black tracking-widest bg-zinc-800 text-white px-6 py-2.5 rounded-full hover:bg-zinc-700 active:scale-95 transition-all">DOWNLOAD</a>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 w-full border-2 border-dashed border-[rgba(255,255,255,0.05)] rounded-2xl opacity-50">
                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Select an item below</p>
                        </div>
                    )}
                </div>

                {/* LEVEL SCHEDULE */}
                <div className="bg-[#1B1B1F] p-6 rounded-3xl shadow-lg border border-[rgba(255,255,255,0.08)] col-span-1 lg:col-span-3">
                    <h2 className="text-lg font-bold mb-4 tracking-wide text-[#FFD60A]">🏆 LEVEL SCHEDULE</h2>
                    <p className="text-xs text-zinc-500 mb-4">Define XP thresholds per level. Users advance when their total rarity XP reaches the threshold.</p>

                    {/* Add new level form */}
                    <form onSubmit={handleAddLevel} className="grid grid-cols-3 gap-3 mb-5">
                        <div className="flex flex-col bg-[#0F1014] p-3 rounded-xl border border-[rgba(255,255,255,0.03)]">
                            <label className="text-[9px] uppercase font-black tracking-widest text-[#FFD60A] mb-1">Level #</label>
                            <input type="number" min={1} value={newLevel.level} onChange={e => setNewLevel({ ...newLevel, level: e.target.value })} placeholder="1" className="p-1 bg-transparent font-black text-lg focus:outline-none border-b border-[rgba(255,255,255,0.1)] focus:border-[#FFD60A]" required />
                        </div>
                        <div className="flex flex-col bg-[#0F1014] p-3 rounded-xl border border-[rgba(255,255,255,0.03)]">
                            <label className="text-[9px] uppercase font-black tracking-widest text-[#FFD60A] mb-1">XP Required</label>
                            <input type="number" min={0} value={newLevel.xp_required} onChange={e => setNewLevel({ ...newLevel, xp_required: e.target.value })} placeholder="500" className="p-1 bg-transparent font-black text-lg focus:outline-none border-b border-[rgba(255,255,255,0.1)] focus:border-[#FFD60A]" required />
                        </div>
                        <div className="flex flex-col bg-[#0F1014] p-3 rounded-xl border border-[rgba(255,255,255,0.03)]">
                            <label className="text-[9px] uppercase font-black tracking-widest text-[#FFD60A] mb-1">Title</label>
                            <input type="text" value={newLevel.title} onChange={e => setNewLevel({ ...newLevel, title: e.target.value })} placeholder="Street Hunter" className="p-1 bg-transparent font-bold text-sm focus:outline-none border-b border-[rgba(255,255,255,0.1)] focus:border-[#FFD60A]" />
                        </div>
                        <div className="col-span-3 flex justify-end">
                            <button disabled={loading} type="submit" className="bg-[#FFD60A] text-[#121212] font-black tracking-widest px-6 py-2 rounded-xl text-sm active:scale-95 transition-transform">+ ADD LEVEL</button>
                        </div>
                    </form>

                    {/* Existing levels table */}
                    {levels.length === 0 ? (
                        <p className="text-xs text-zinc-600 text-center py-4">No levels configured yet. Add your first level above.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {levels.map(lv => (
                                <div key={lv.id} className="flex items-center gap-3 bg-[#0F1014] px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.04)]">
                                    {editingLevelId === lv.id ? (
                                        <>
                                            <input type="number" value={editingLevel.level} onChange={e => setEditingLevel({ ...editingLevel, level: e.target.value })} className="w-12 bg-transparent border-b border-[#FFD60A] font-black text-sm focus:outline-none text-center" />
                                            <input type="number" value={editingLevel.xp_required} onChange={e => setEditingLevel({ ...editingLevel, xp_required: e.target.value })} className="w-20 bg-transparent border-b border-[#FFD60A] font-bold text-sm focus:outline-none" />
                                            <input type="text" value={editingLevel.title} onChange={e => setEditingLevel({ ...editingLevel, title: e.target.value })} className="flex-1 bg-transparent border-b border-[#FFD60A] font-bold text-sm focus:outline-none" />
                                            <button onClick={() => handleUpdateLevel(lv.id)} className="text-[#FFD60A] font-black text-xs hover:underline">SAVE</button>
                                            <button onClick={() => setEditingLevelId(null)} className="text-zinc-500 font-bold text-xs hover:underline">CANCEL</button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-12 text-center font-black text-[#FFD60A] text-sm">LVL {lv.level}</span>
                                            <span className="w-20 font-bold text-white text-sm">{lv.xp_required.toLocaleString()} XP</span>
                                            <span className="flex-1 text-zinc-400 text-sm font-medium">{lv.title}</span>
                                            <button onClick={() => { setEditingLevelId(lv.id); setEditingLevel({ level: String(lv.level), xp_required: String(lv.xp_required), title: lv.title }); }} className="text-zinc-400 font-bold text-xs hover:text-[#FFD60A]">EDIT</button>
                                            <button onClick={() => handleDeleteLevel(lv.id)} className="text-red-500 font-bold text-xs hover:underline">DEL</button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ACHIEVEMENTS */}
                <div className="bg-[#1B1B1F] p-6 rounded-3xl shadow-lg border border-[rgba(255,255,255,0.08)] col-span-1 lg:col-span-3">
                    <h2 className="text-lg font-bold mb-4 tracking-wide text-[#FFD60A]">🌟 ACHIEVEMENTS</h2>

                    {/* Add new achievement form */}
                    <form onSubmit={handleAddAchievement} className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
                        <div className="flex flex-col bg-[#0F1014] p-3 rounded-xl border border-[rgba(255,255,255,0.03)] lg:col-span-2">
                            <label className="text-[9px] uppercase font-black tracking-widest text-[#FFD60A] mb-1">Title</label>
                            <input type="text" value={newAchievement.title} onChange={e => setNewAchievement({ ...newAchievement, title: e.target.value })} placeholder="First Capture" className="p-1 bg-transparent font-bold text-sm focus:outline-none border-b border-[rgba(255,255,255,0.1)] focus:border-[#FFD60A]" required />
                        </div>
                        <div className="flex flex-col bg-[#0F1014] p-3 rounded-xl border border-[rgba(255,255,255,0.03)]">
                            <label className="text-[9px] uppercase font-black tracking-widest text-[#FFD60A] mb-1">Icon</label>
                            <select value={newAchievement.icon} onChange={e => setNewAchievement({ ...newAchievement, icon: e.target.value })} className="p-1 bg-transparent font-bold text-sm focus:outline-none border-b border-[rgba(255,255,255,0.1)] focus:border-[#FFD60A] text-white">
                                <option value="Zap" className="text-black">Zap ⚡️</option>
                                <option value="Flame" className="text-black">Flame 🔥</option>
                                <option value="MapPin" className="text-black">MapPin 📍</option>
                                <option value="Star" className="text-black">Star ⭐️</option>
                                <option value="Crown" className="text-black">Crown 👑</option>
                                <option value="Globe" className="text-black">Globe 🌍</option>
                                <option value="Award" className="text-black">Award 🥇</option>
                            </select>
                        </div>
                        <div className="flex flex-col bg-[#0F1014] p-3 rounded-xl border border-[rgba(255,255,255,0.03)]">
                            <label className="text-[9px] uppercase font-black tracking-widest text-[#FFD60A] mb-1">Color (Hex/CSS)</label>
                            <input type="text" value={newAchievement.color} onChange={e => setNewAchievement({ ...newAchievement, color: e.target.value })} placeholder="#FFD60A" className="p-1 bg-transparent font-bold text-sm focus:outline-none border-b border-[rgba(255,255,255,0.1)] focus:border-[#FFD60A]" required />
                        </div>
                        <div className="flex flex-col bg-[#0F1014] p-3 rounded-xl border border-[rgba(255,255,255,0.03)]">
                            <label className="text-[9px] uppercase font-black tracking-widest text-[#FFD60A] mb-1">Type</label>
                            <select value={newAchievement.goal_type} onChange={e => setNewAchievement({ ...newAchievement, goal_type: e.target.value })} className="p-1 bg-transparent font-bold text-sm focus:outline-none border-b border-[rgba(255,255,255,0.1)] focus:border-[#FFD60A] text-white">
                                <option value="captures" className="text-black">Captures</option>
                                <option value="cities" className="text-black">Cities</option>
                                <option value="rarity" className="text-black">Rarity Rank</option>
                            </select>
                        </div>
                        {newAchievement.goal_type === 'rarity' ? (
                            <div className="flex flex-col bg-[#0F1014] p-3 rounded-xl border border-[rgba(255,255,255,0.03)]">
                                <label className="text-[9px] uppercase font-black tracking-widest text-[#FFD60A] mb-1">Rarity Name</label>
                                <input type="text" value={newAchievement.goal_string} onChange={e => setNewAchievement({ ...newAchievement, goal_string: e.target.value })} placeholder="Legendary" className="p-1 bg-transparent font-bold text-sm focus:outline-none border-b border-[rgba(255,255,255,0.1)] focus:border-[#FFD60A]" required />
                            </div>
                        ) : (
                            <div className="flex flex-col bg-[#0F1014] p-3 rounded-xl border border-[rgba(255,255,255,0.03)]">
                                <label className="text-[9px] uppercase font-black tracking-widest text-[#FFD60A] mb-1">Required Count</label>
                                <input type="number" min={1} value={newAchievement.goal_count} onChange={e => setNewAchievement({ ...newAchievement, goal_count: e.target.value })} className="p-1 bg-transparent font-bold text-sm focus:outline-none border-b border-[rgba(255,255,255,0.1)] focus:border-[#FFD60A]" required />
                            </div>
                        )}
                        <div className="col-span-2 lg:col-span-6 flex justify-end">
                            <button disabled={loading} type="submit" className="bg-[#FFD60A] text-[#121212] font-black tracking-widest px-6 py-2 rounded-xl text-sm active:scale-95 transition-transform">+ ADD ACHV</button>
                        </div>
                    </form>

                    {/* Existing achievements table */}
                    {achievements.length === 0 ? (
                        <p className="text-xs text-zinc-600 text-center py-4">No achievements configured yet.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {achievements.map(achv => (
                                <div key={achv.id} className="flex items-center gap-3 bg-[#0F1014] px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.04)] text-sm">
                                    {editingAchievementId === achv.id ? (
                                        <>
                                            <input type="text" value={editingAchievement.title} onChange={e => setEditingAchievement({ ...editingAchievement, title: e.target.value })} className="flex-1 bg-transparent border-b border-[#FFD60A] font-bold focus:outline-none" />
                                            <input type="text" value={editingAchievement.icon} onChange={e => setEditingAchievement({ ...editingAchievement, icon: e.target.value })} className="w-16 bg-transparent border-b border-[#FFD60A] font-bold focus:outline-none" />
                                            <input type="text" value={editingAchievement.color} onChange={e => setEditingAchievement({ ...editingAchievement, color: e.target.value })} className="w-20 bg-transparent border-b border-[#FFD60A] font-bold focus:outline-none" />
                                            <select value={editingAchievement.goal_type} onChange={e => setEditingAchievement({ ...editingAchievement, goal_type: e.target.value })} className="w-20 bg-transparent border-b border-[#FFD60A] font-bold focus:outline-none text-white">
                                                <option value="captures" className="text-black">Cap</option>
                                                <option value="cities" className="text-black">Cit</option>
                                                <option value="rarity" className="text-black">Rar</option>
                                            </select>
                                            {editingAchievement.goal_type === 'rarity' ? (
                                                <input type="text" value={editingAchievement.goal_string} onChange={e => setEditingAchievement({ ...editingAchievement, goal_string: e.target.value })} className="w-20 bg-transparent border-b border-[#FFD60A] font-bold focus:outline-none" />
                                            ) : (
                                                <input type="number" value={editingAchievement.goal_count} onChange={e => setEditingAchievement({ ...editingAchievement, goal_count: e.target.value })} className="w-12 bg-transparent border-b border-[#FFD60A] font-bold focus:outline-none text-center" />
                                            )}
                                            <button onClick={() => handleUpdateAchievement(achv.id)} className="text-[#FFD60A] font-black text-xs hover:underline">SAVE</button>
                                            <button onClick={() => setEditingAchievementId(null)} className="text-zinc-500 font-bold text-xs hover:underline">CANCEL</button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-6 text-center font-black" style={{ color: achv.color }}>★</span>
                                            <span className="flex-1 font-bold text-white max-w-[200px] truncate">{achv.title}</span>
                                            <span className="w-16 text-zinc-400">{achv.icon}</span>
                                            <span className="w-20 font-mono text-xs" style={{ color: achv.color }}>{achv.color}</span>
                                            <span className="w-24 text-zinc-400 font-bold">
                                                {achv.goal_type === 'rarity' ? `Rarity: ${achv.goal_string}` : `${achv.goal_type}: ${achv.goal_count}`}
                                            </span>
                                            <span className="flex-1"></span>
                                            <button onClick={() => { setEditingAchievementId(achv.id); setEditingAchievement({ title: achv.title, icon: achv.icon, color: achv.color, goal_type: achv.goal_type, goal_count: String(achv.goal_count), goal_string: achv.goal_string || '' }); }} className="text-zinc-400 font-bold text-xs hover:text-[#FFD60A]">EDIT</button>
                                            <button onClick={() => handleDeleteAchievement(achv.id)} className="text-red-500 font-bold text-xs hover:underline">DEL</button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* WEEKLY MISSION CONFIGURATOR */}
                {dailyMission && (
                    <div className="bg-[#1B1B1F] p-6 rounded-3xl shadow-lg border border-[rgba(255,255,255,0.08)] col-span-1 lg:col-span-3">
                        <h2 className="text-lg font-bold mb-4 tracking-wide text-[#FFD60A]">🎯 WEEKLY MISSION</h2>
                        <form onSubmit={handleUpdateMission} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex flex-col bg-[#0F1014] p-3 rounded-xl border border-[rgba(255,255,255,0.03)] md:col-span-2 lg:col-span-2">
                                <label className="text-[9px] uppercase font-black tracking-widest text-[#FFD60A] mb-2">Mission Title</label>
                                <input type="text" value={dailyMission.title} onChange={e => setDailyMission({ ...dailyMission, title: e.target.value })} className="p-2 border-b-2 border-[rgba(255,255,255,0.1)] bg-transparent font-black text-base focus:outline-none focus:border-[#FFD60A] transition-colors" required />
                            </div>
                            <div className="flex flex-col bg-[#0F1014] p-3 rounded-xl border border-[rgba(255,255,255,0.03)]">
                                <label className="text-[9px] uppercase font-black tracking-widest text-[#FFD60A] mb-2">Reward Label</label>
                                <input type="text" value={dailyMission.reward_label} onChange={e => setDailyMission({ ...dailyMission, reward_label: e.target.value })} className="p-2 border-b-2 border-[rgba(255,255,255,0.1)] bg-transparent font-bold text-base focus:outline-none focus:border-[#FFD60A] transition-colors" required />
                            </div>
                            <div className="flex flex-col bg-[#0F1014] p-3 rounded-xl border border-[rgba(255,255,255,0.03)] md:col-span-2 lg:col-span-3">
                                <label className="text-[9px] uppercase font-black tracking-widest text-[#FFD60A] mb-2">Description</label>
                                <input type="text" value={dailyMission.description} onChange={e => setDailyMission({ ...dailyMission, description: e.target.value })} className="p-2 border-b-2 border-[rgba(255,255,255,0.1)] bg-transparent font-bold text-sm focus:outline-none focus:border-[#FFD60A] transition-colors" required />
                            </div>
                            <div className="flex flex-col bg-[#0F1014] p-3 rounded-xl border border-[rgba(255,255,255,0.03)]">
                                <label className="text-[9px] uppercase font-black tracking-widest text-[#FFD60A] mb-2">Goal Type</label>
                                <select value={dailyMission.goal_type} onChange={e => setDailyMission({ ...dailyMission, goal_type: e.target.value })} className="p-2 border-b-2 border-[rgba(255,255,255,0.1)] bg-[#0F1014] font-bold text-base focus:outline-none focus:border-[#FFD60A] transition-colors">
                                    <option value="captures">Captures (unique lighters found)</option>
                                    <option value="scans">Scans (total QR scans)</option>
                                    <option value="cities">Cities (distinct cities)</option>
                                </select>
                            </div>
                            <div className="flex flex-col bg-[#0F1014] p-3 rounded-xl border border-[rgba(255,255,255,0.03)]">
                                <label className="text-[9px] uppercase font-black tracking-widest text-[#FFD60A] mb-2">Goal Count</label>
                                <input type="number" min={1} value={dailyMission.goal_count} onChange={e => setDailyMission({ ...dailyMission, goal_count: parseInt(e.target.value) || 1 })} className="p-2 border-b-2 border-[rgba(255,255,255,0.1)] bg-transparent font-black text-lg focus:outline-none focus:border-[#FFD60A] transition-colors" required />
                            </div>
                            <div className="flex flex-col bg-[#0F1014] p-3 rounded-xl border border-[rgba(255,255,255,0.03)]">
                                <label className="text-[9px] uppercase font-black tracking-widest text-[#FFD60A] mb-2">XP Reward</label>
                                <input type="number" min={0} value={dailyMission.xp_reward} onChange={e => setDailyMission({ ...dailyMission, xp_reward: parseInt(e.target.value) || 0 })} className="p-2 border-b-2 border-[rgba(255,255,255,0.1)] bg-transparent font-black text-lg focus:outline-none focus:border-[#FFD60A] transition-colors" required />
                            </div>
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                                <button disabled={loading} type="submit" className="bg-[#FFD60A] text-[#121212] font-black tracking-widest px-8 py-3 rounded-xl active:scale-95 transition-transform hover:bg-[#FFE866]">SAVE MISSION</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <div className="flex gap-6 w-full flex-col lg:flex-row pb-12">
                {/* Lighter Creation Form */}
                <div className="bg-[#1B1B1F] p-6 rounded-3xl shadow-lg border border-[rgba(255,255,255,0.08)] lg:w-1/3">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold tracking-wide">{editLighterId ? '📦 Edit Lighter' : '📦 Mint Lighter'}</h2>
                        {editLighterId && <button onClick={resetLighterForm} className="text-xs text-red-500 font-bold hover:underline bg-red-500/10 px-2 py-1 rounded">Cancel Edit</button>}
                    </div>
                    <form onSubmit={createOrUpdateLighter} className="flex flex-col gap-5">
                        <div>
                            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-1.5 block">Lighter Name</label>
                            <input type="text" value={lName} onChange={e => setLName(e.target.value)} placeholder="e.g. Neon Tiger #01" className="w-full p-4 bg-[#0F1014] border border-[rgba(255,255,255,0.08)] rounded-2xl font-bold focus:outline-none focus:border-[#FFD60A]" required />
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-1.5 block">Collection</label>
                                <select value={lColl} onChange={e => setLColl(e.target.value)} className="w-full p-4 bg-[#0F1014] border border-[rgba(255,255,255,0.08)] rounded-2xl font-bold focus:outline-none focus:border-[#FFD60A]" required>
                                    <option value="">Select...</option>
                                    {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-1.5 block">Rarity</label>
                                <select value={lRar} onChange={e => setLRar(e.target.value)} className="w-full p-4 bg-[#0F1014] border border-[rgba(255,255,255,0.08)] rounded-2xl font-bold focus:outline-none focus:border-[#FFD60A]" required>
                                    <option value="">Select...</option>
                                    {rarities.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col p-4 bg-[#0F1014] rounded-2xl border border-[rgba(255,255,255,0.03)]">
                            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-2">Item Photography {editLighterId && '(Leaves existing if empty)'}</label>
                            <input type="file" accept="image/*" onChange={e => handleImageChange(e, setLImage)} className="text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-white" />
                            {lImage && <div className="mt-3 text-[10px] text-[#FFD60A] font-black tracking-widest border border-[#FFD60A]/30 bg-[#FFD60A]/10 p-2 rounded-lg text-center uppercase">Upload Queued ({Math.round(lImage.length / 1024)}kb)</div>}
                        </div>
                        <button disabled={loading} type="submit" className={`w-full py-4 text-[#121212] font-black rounded-2xl tracking-widest mt-2 active:scale-95 transition-transform ${editLighterId ? 'bg-orange-500 hover:bg-orange-400 text-white' : 'bg-[#FFD60A] hover:bg-[#FFE866]'}`}>
                            {editLighterId ? 'UPDATE ITEM' : 'MINT ITEM'}
                        </button>
                    </form>
                </div>

                {/* Databases */}
                <div className="flex flex-col gap-6 pb-20">
                    <div className="bg-[#1B1B1F] p-6 rounded-3xl shadow-lg border border-[rgba(255,255,255,0.08)] h-[600px] flex flex-col">
                        <h2 className="text-xl font-bold mb-4 tracking-wide">📦 Lighters Vault</h2>
                        <div className="flex-1 overflow-auto rounded-xl border border-[rgba(255,255,255,0.05)] custom-scrollbar">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#0F1014] sticky top-0 z-10 shadow-md">
                                    <tr>
                                        <th className="p-4 border-b border-[rgba(255,255,255,0.05)] text-[10px] tracking-widest text-zinc-500 uppercase">Object ID / Name</th>
                                        <th className="p-4 border-b border-[rgba(255,255,255,0.05)] text-[10px] tracking-widest text-zinc-500 uppercase hidden md:table-cell">Asset Col.</th>
                                        <th className="p-4 border-b border-[rgba(255,255,255,0.05)] text-[10px] tracking-widest text-zinc-500 uppercase hidden md:table-cell">Tier</th>
                                        <th className="p-4 border-b border-[rgba(255,255,255,0.05)] text-[10px] tracking-widest text-zinc-500 uppercase text-center">Owner Auth</th>
                                        <th className="p-4 border-b border-[rgba(255,255,255,0.05)] text-[10px] tracking-widest text-zinc-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lighters.map(l => (
                                        <tr key={l.id} className={`border-b border-[rgba(255,255,255,0.02)] last:border-b-0 hover:bg-[#0F1014] transition-colors ${editLighterId === l.id ? 'bg-[#FFD60A]/5' : ''}`}>
                                            <td className="p-3">
                                                <div className="font-bold flex gap-3 items-center text-zinc-100">
                                                    {l.image_url ? <img src={l.image_url} className="w-8 h-8 rounded-lg border border-[rgba(255,255,255,0.1)] object-cover" /> : <div className="w-8 h-8 rounded-lg bg-zinc-800" />}
                                                    {l.name}
                                                </div>
                                                <div className="text-[10px] font-mono text-zinc-500 mt-1 ml-11">#{l.id.slice(0, 8)}</div>
                                            </td>
                                            <td className="p-3 font-semibold text-zinc-300 hidden md:table-cell">{l.collection?.name || 'Err'}</td>
                                            <td className="p-3 hidden md:table-cell">
                                                <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">{l.rarity?.name || 'Err'}</span>
                                            </td>
                                            <td className="p-3 text-center font-bold">
                                                {l.current_owner?.username ? <span className="text-[#FFD60A]">{l.current_owner.username}</span> : <span className="text-zinc-600">—</span>}
                                            </td>
                                            <td className="p-3 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => generateQr(l.id)} className="px-3 py-1.5 bg-zinc-800 text-white text-[10px] font-black tracking-widest rounded-lg hover:bg-zinc-700 transition-colors">QR</button>
                                                    <button onClick={() => editLighter(l)} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 text-[10px] font-black tracking-widest rounded-lg hover:bg-blue-500/20 transition-colors">EDIT</button>
                                                    <button onClick={() => deleteLighter(l.id)} className="px-3 py-1.5 bg-red-500/10 text-red-500 text-[10px] font-black tracking-widest rounded-lg hover:bg-red-500/20 transition-colors">DEL</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Members Database - full width */}
                    <div className="bg-[#1B1B1F] p-6 rounded-3xl shadow-lg border border-[rgba(255,255,255,0.08)] h-[600px] flex flex-col w-full">
                        <h2 className="text-xl font-bold mb-4 tracking-wide text-blue-400">👤 Members Database</h2>
                        <div className="flex-1 overflow-auto rounded-xl border border-[rgba(255,255,255,0.05)] custom-scrollbar">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#0F1014] sticky top-0 z-10 shadow-md">
                                    <tr>
                                        <th className="p-4 border-b border-[rgba(255,255,255,0.05)] text-[10px] tracking-widest text-zinc-500 uppercase">Username / ID</th>
                                        <th className="p-4 border-b border-[rgba(255,255,255,0.05)] text-[10px] tracking-widest text-zinc-500 uppercase hidden md:table-cell">Email / Password</th>
                                        <th className="p-4 border-b border-[rgba(255,255,255,0.05)] text-[10px] tracking-widest text-zinc-500 uppercase text-center hidden md:table-cell">Events</th>
                                        <th className="p-4 border-b border-[rgba(255,255,255,0.05)] text-[10px] tracking-widest text-zinc-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u: any) => {
                                        const isEditing = editingUserId === u.id;
                                        return (
                                            <tr key={u.id} className={`border-b border-[rgba(255,255,255,0.02)] last:border-b-0 hover:bg-[#0F1014] transition-colors ${isEditing ? 'bg-blue-500/5' : ''}`}>
                                                <td className="p-3">
                                                    {isEditing ? (
                                                        <div className="flex flex-col gap-1">
                                                            <input type="text" value={editingUser.username} onChange={e => setEditingUser({ ...editingUser, username: e.target.value })} className="w-full bg-transparent border-b border-blue-500 font-bold text-white text-sm focus:outline-none" placeholder="Username" />
                                                            <div className="text-[10px] font-mono text-zinc-500 mt-1">#{u.id.slice(0, 8)}</div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="font-bold flex gap-3 items-center text-zinc-100">
                                                                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-[rgba(255,255,255,0.1)] overflow-hidden bg-cover bg-center text-[10px] flex items-center justify-center" style={u.avatar_url ? { backgroundImage: 'url(' + u.avatar_url + ')' } : {}}>{!u.avatar_url && u.username.slice(0, 2).toUpperCase()}</div>
                                                                {u.username}
                                                            </div>
                                                            <div className="text-[10px] font-mono text-zinc-500 mt-1 ml-11">#{u.id.slice(0, 8)}</div>
                                                        </>
                                                    )}
                                                </td>
                                                <td className="p-3 font-semibold text-zinc-300 hidden md:table-cell">
                                                    {isEditing ? (
                                                        <div className="flex flex-col gap-2">
                                                            <input type="email" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full bg-transparent border-b border-blue-500 font-bold text-white text-sm focus:outline-none" placeholder="Email" />
                                                            <input type="password" value={editingUser.newPassword} onChange={e => setEditingUser({ ...editingUser, newPassword: e.target.value })} className="w-full bg-transparent border-b border-blue-500 font-bold text-zinc-500 text-xs focus:outline-none" placeholder="New Password (optional)" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            <span>{u.email}</span>
                                                            <span className="text-[10px] text-zinc-500">*******</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3 text-center hidden md:table-cell">
                                                    <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded-sm">{u.history_entries?.length || 0} Captures</span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    {isEditing ? (
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => handleUpdateUser(u.id)} className="text-blue-400 font-black text-xs hover:underline">SAVE</button>
                                                            <button onClick={() => setEditingUserId(null)} className="text-zinc-500 font-bold text-xs hover:underline">CANCEL</button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => { setEditingUserId(u.id); setEditingUser({ username: u.username, email: u.email, newPassword: '' }) }} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 text-[10px] font-black tracking-widest rounded-lg hover:bg-blue-500/20 transition-colors">EDIT</button>
                                                            <button onClick={() => handleDeleteUser(u.id)} className="px-3 py-1.5 bg-red-500/10 text-red-500 text-[10px] font-black tracking-widest rounded-lg hover:bg-red-500/20 transition-colors">DEL</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
