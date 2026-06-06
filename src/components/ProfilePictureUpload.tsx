"use client";

import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePictureUpload({
    username,
    initialAvatar,
    isOwnProfile
}: {
    username: string;
    initialAvatar: string | null;
    isOwnProfile: boolean;
}) {
    const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Data = reader.result as string;

            try {
                const res = await fetch('/api/user/avatar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ avatarData: base64Data }),
                });

                if (!res.ok) throw new Error("Upload failed");
                const data = await res.json();

                setAvatarUrl(data.avatar_url);
                router.refresh(); // Refresh page data
            } catch (err) {
                alert("Failed to upload avatar. Try a smaller image.");
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="relative group cursor-pointer" onClick={() => isOwnProfile && fileInputRef.current?.click()}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center font-extrabold text-2xl shadow-inner border-2 border-white overflow-hidden transition-opacity ${uploading ? 'opacity-50' : 'opacity-100'} ${avatarUrl ? 'bg-black' : 'bg-[#D85A30] text-white'}`}>
                {avatarUrl ? (
                    <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                ) : (
                    username.substring(0, 2).toUpperCase()
                )}
            </div>

            {isOwnProfile && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} color="white" />
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
            />
        </div>
    );
}
