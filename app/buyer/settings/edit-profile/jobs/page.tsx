"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { FiArrowLeft, FiUser, FiSave, FiBriefcase, FiMapPin, FiGlobe, FiLinkedin, FiGithub, FiCamera, FiCrop, FiX, FiTrash2 } from "react-icons/fi";

export default function EditJobProfilePage() {
    // Initial state mirroring basic job seeker fields
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        headline: "",
        summary: "",
        currentRole: "",
        currentCompany: "",
        totalExperience: "",
        linkedIn: "",
        github: "",
        resume: "",
        status: "AVAILABLE",
        image: ""
    });

    const [saving, setSaving] = useState(false);

    // Image Upload State
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result as string);
                setIsCropModalOpen(true);
                setZoom(1);
                setPan({ x: 0, y: 0 });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); };
    const handleMouseMove = (e: React.MouseEvent) => { if (isDragging) { e.preventDefault(); setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); } };
    const handleMouseUp = () => { setIsDragging(false); };

    const handleCropSave = () => {
        if (!imageRef.current || !containerRef.current) return;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        const image = imageRef.current;
        const scale = size / 256;
        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.translate(size / 2, size / 2);
        ctx.scale(zoom * scale, zoom * scale);
        ctx.translate(pan.x / scale, pan.y / scale);
        ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
        ctx.restore();
        const croppedUrl = canvas.toDataURL('image/jpeg');
        setProfile(prev => ({ ...prev, image: croppedUrl }));
        setIsCropModalOpen(false);
        setSelectedImage(null);
    };

    const handleDeleteImage = () => {
        if (window.confirm("Are you sure you want to delete your profile photo?")) {
            setProfile(prev => ({ ...prev, image: "" }));
        }
    };

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            alert("Job Profile updated successfully!");
        }, 1000);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/buyer/settings" className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <FiArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Edit Job Seeker Profile</h1>
                    <p className="text-gray-500 text-sm">Manage your resume, experience, and skills</p>
                </div>
            </div>

            {/* Profile Photo */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Photo</h2>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden border-2 border-white shadow-md">
                            {profile.image ? <img src={profile.image} alt="Profile" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
                        </div>
                        <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                            <FiCamera className="w-4 h-4 text-gray-600" />
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </label>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">Upload Photo</button>
                            <button onClick={handleDeleteImage} disabled={!profile.image} className={`p-2 rounded-lg transition-colors border ${profile.image ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-100' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`} title={profile.image ? "Delete Photo" : "No photo to delete"}><FiTrash2 className="w-5 h-5" /></button>
                        </div>
                        <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB</p>
                    </div>
                </div>
            </div>

            {isCropModalOpen && selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><FiCrop className="text-blue-500" />Adjust Profile Picture</h3>
                            <button onClick={() => setIsCropModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"><FiX className="w-6 h-6" /></button>
                        </div>
                        <div className="p-8 bg-gray-50 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden select-none">
                            <div className="w-64 h-64 rounded-full border-4 border-white shadow-2xl overflow-hidden relative flex items-center justify-center active:cursor-grabbing cursor-grab" ref={containerRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                                <img ref={imageRef} src={selectedImage} alt="Crop Preview" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transition: isDragging ? 'none' : 'transform 0.1s ease-out' }} className="max-w-none max-h-none pointer-events-none select-none" draggable={false} />
                                <div className="absolute inset-0 border-[40px] border-black/10 pointer-events-none rounded-full" />
                            </div>
                            <div className="mt-8 w-full max-w-xs">
                                <div className="flex items-center justify-between mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest"><span>Zoom</span><span>{Math.round(zoom * 100)}%</span></div>
                                <input type="range" min="0.1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            </div>
                            <p className="mt-4 text-xs text-gray-400 font-medium">Drag the image to reposition</p>
                        </div>
                        <div className="p-6 bg-white border-t border-gray-100 flex gap-3 justify-end">
                            <button onClick={() => setIsCropModalOpen(false)} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-all">Cancel</button>
                            <button onClick={handleCropSave} className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md">Set</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-blue-600" />
                    Basic Info
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
                        <input type="text" value={profile.headline} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none" placeholder="e.g. Senior Software Engineer" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                        <textarea value={profile.summary} onChange={(e) => setProfile({ ...profile, summary: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none h-32 resize-none" placeholder="Brief professional summary..." />
                    </div>
                </div>
            </div>

            {/* Current Role */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiBriefcase className="w-5 h-5 text-blue-600" />
                    Professional Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Role</label>
                        <input type="text" value={profile.currentRole} onChange={(e) => setProfile({ ...profile, currentRole: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Company</label>
                        <input type="text" value={profile.currentCompany} onChange={(e) => setProfile({ ...profile, currentCompany: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Experience</label>
                        <input type="text" value={profile.totalExperience} onChange={(e) => setProfile({ ...profile, totalExperience: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select value={profile.status} onChange={(e) => setProfile({ ...profile, status: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none">
                            <option value="AVAILABLE">Actively Looking</option>
                            <option value="OPEN_TO_OFFERS">Open to Offers</option>
                            <option value="NOT_LOOKING">Not Looking</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiGlobe className="w-5 h-5 text-blue-600" />
                    Social Links
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><FiLinkedin className="text-blue-700" /> LinkedIn</label>
                        <input type="text" value={profile.linkedIn} onChange={(e) => setProfile({ ...profile, linkedIn: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><FiGithub className="text-gray-900" /> GitHub</label>
                        <input type="text" value={profile.github} onChange={(e) => setProfile({ ...profile, github: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <Link href="/buyer/settings" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">Cancel</Link>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all font-semibold text-sm disabled:opacity-50"><FiSave className="w-4 h-4" />{saving ? "Saving..." : "Save Changes"}</button>
            </div>
        </div>
    );
}
