"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiCamera, FiCrop, FiX, FiTrash2, FiTruck, FiBox, FiMessageSquare, FiPlusCircle, FiShoppingCart, FiTag, FiPackage, FiSmartphone } from "react-icons/fi";

export default function EditProfilePage() {
    const [profile, setProfile] = useState({
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+91 98765 43210",
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
        image: "" // Store the cropped image URL here
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

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            e.preventDefault();
            setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleCropSave = () => {
        if (!imageRef.current || !containerRef.current) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set desired output size (e.g., 300x300 for profile picture)
        const size = 300;
        canvas.width = size;
        canvas.height = size;

        // Calculate source rectangle
        const image = imageRef.current;
        const container = containerRef.current;

        // The container is the "viewport". We need to map the viewport back to the image coordinates.
        // Simplified logic: 
        // 1. Image is scaled by `zoom`.
        // 2. Image is translated by `pan`.
        // 3. We want to capture the center 200px of the container (or whatever the crop area is).
        // Let's assume the visual crop area is the center 200px of the 300px container for display,
        // but for actual crop we want what's visible in the "circle".

        // Better approach for custom crop:
        // Draw image to canvas with transformations.

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Draw image centered and transformed
        // We need to map the pan/zoom from the UI to the canvas.
        // In UI: image is displayed with transform: translate(pan.x, pan.y) scale(zoom)
        // Center of container is (containerWidth/2, containerHeight/2)

        // Let's try a simpler approach: Draw the image onto the canvas exactly as it appears in the center crop zone.
        // We'll map the crop zone (e.g., center 200x200 of the UI) to the full 300x300 canvas.

        const scale = size / 256; // Scale up from the 256px (w-64) visual crop area

        ctx.save();
        ctx.translate(size / 2, size / 2); // Center of canvas
        ctx.scale(zoom * scale, zoom * scale);
        ctx.translate(pan.x / scale, pan.y / scale); // Apply pan (adjusted for scale)
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

    // State for preferences and additional data
    const [userId, setUserId] = useState<string | null>(null);
    const [shippingAddresses, setShippingAddresses] = useState<any[]>([]);
    const [deliveryInstructions, setDeliveryInstructions] = useState("");
    const [communicationPreferences, setCommunicationPreferences] = useState({
        email: true,
        sms: false,
        whatsapp: true
    });
    const [shoppingPreferences, setShoppingPreferences] = useState({
        priceDrop: true,
        restock: true,
        cartSync: true,
        newsletter: false
    });

    // Fetch profile data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) return;

                const user = JSON.parse(userStr);
                setUserId(user.id);

                // Fetch user core details
                const userResponse = await fetch(`/api/users/${user.id}`);
                const userData = await userResponse.json();

                // Fetch preferences
                const prefResponse = await fetch(`/api/users/preferences?userId=${user.id}`);
                const prefData = await prefResponse.json();

                if (userData.success && userData.user) {
                    const u = userData.user;

                    setProfile(prev => ({
                        ...prev,
                        name: u.name || '',
                        email: u.email || '',
                        phone: u.phone || '',
                        street: u.address || '',
                        city: u.city || '',
                        state: u.state || '',
                        zip: u.zipCode || '',
                        image: u.image || ''
                    }));
                }

                if (prefData.success && prefData.preferences) {
                    const p = prefData.preferences;

                    if (p.deliveryInstructions) setDeliveryInstructions(p.deliveryInstructions);
                    if (p.communicationPreferences) setCommunicationPreferences(prev => ({ ...prev, ...p.communicationPreferences }));
                    if (p.shoppingPreferences) setShoppingPreferences(prev => ({ ...prev, ...p.shoppingPreferences }));
                    if (p.shippingAddresses) {
                        try {
                            const addrs = typeof p.shippingAddresses === 'string' ? JSON.parse(p.shippingAddresses) : p.shippingAddresses;
                            setShippingAddresses(addrs);
                        } catch (e) { console.error('Error parsing addresses', e); }
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (!userId) throw new Error('User ID not found');

            // 1. Update Core User Details
            const userUpdate = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profile.name,
                    phone: profile.phone,
                    address: profile.street,
                    image: profile.image,
                    city: profile.city,
                    state: profile.state,
                    zipCode: profile.zip
                })
            });

            // 2. Update Preferences
            const prefUpdate = await fetch('/api/users/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    preferences: {
                        deliveryInstructions,
                        communicationPreferences,
                        shoppingPreferences,
                        shippingAddresses
                    }
                })
            });

            if (userUpdate.ok && prefUpdate.ok) {
                // Update local storage
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.name = profile.name;
                    user.phone = profile.phone;
                    user.image = profile.image;
                    user.city = profile.city;
                    user.state = profile.state;
                    localStorage.setItem('user', JSON.stringify(user));
                    window.dispatchEvent(new Event('storage'));
                }
                alert("Profile updated successfully!");
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/buyer/settings"
                    className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Edit Buyer Profile</h1>
                    <p className="text-gray-500 text-sm">Manage your shipping details and shopping preferences</p>
                </div>
            </div>

            {/* Profile Photo */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Photo</h2>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden border-2 border-white shadow-md">
                            {profile.image ? (
                                <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                profile.name.charAt(0)
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                            <FiCamera className="w-4 h-4 text-gray-600" />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </label>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                            >
                                Upload Photo
                            </button>
                            <button
                                onClick={handleDeleteImage}
                                disabled={!profile.image}
                                className={`p-2 rounded-lg transition-colors border ${profile.image
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-100'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    }`}
                                title={profile.image ? "Delete Photo" : "No photo to delete"}
                            >
                                <FiTrash2 className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB</p>
                    </div>
                </div>
            </div>

            {isCropModalOpen && selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FiCrop className="text-blue-500" />
                                Adjust Profile Picture
                            </h3>
                            <button onClick={() => setIsCropModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600">
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 bg-gray-50 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden select-none">
                            <div
                                className="w-64 h-64 rounded-full border-4 border-white shadow-2xl overflow-hidden relative flex items-center justify-center active:cursor-grabbing cursor-grab"
                                ref={containerRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                <img
                                    ref={imageRef}
                                    src={selectedImage}
                                    alt="Crop Preview"
                                    style={{
                                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                                    }}
                                    className="max-w-none max-h-none pointer-events-none select-none"
                                    draggable={false}
                                />
                                <div className="absolute inset-0 border-[40px] border-black/10 pointer-events-none rounded-full" />
                            </div>

                            <div className="mt-8 w-full max-w-xs">
                                <div className="flex items-center justify-between mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <span>Zoom</span>
                                    <span>{Math.round(zoom * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="3"
                                    step="0.01"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>

                            <p className="mt-4 text-xs text-gray-400 font-medium">Drag the image to reposition</p>
                        </div>

                        <div className="p-6 bg-white border-t border-gray-100 flex gap-3 justify-end">
                            <button
                                onClick={() => setIsCropModalOpen(false)}
                                className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCropSave}
                                className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md"
                            >
                                Set
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-blue-600" />
                    Contact Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Primary Phone
                        </label>
                        <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Shipping Addresses */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FiTruck className="w-5 h-5 text-blue-600" />
                        Shipping Addresses
                    </h2>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
                        <FiPlusCircle className="w-4 h-4" />
                        Add New Address
                    </button>
                </div>

                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No addresses saved yet.
                </div>
            </div>

            {/* Delivery Instructions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiBox className="w-5 h-5 text-blue-600" />
                    Delivery Instructions
                </h2>
                <textarea
                    placeholder="Leave at front desk, code is 1234..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none resize-none h-32"
                ></textarea>
            </div>

            {/* Communication Preferences */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiMessageSquare className="w-5 h-5 text-blue-600" />
                    Communication Preferences
                </h2>
                <p className="text-gray-500 text-sm mb-4">Choose how you want to receive order updates and notifications.</p>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                        <span className="text-gray-700 font-medium">Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                        <span className="text-gray-700 font-medium">SMS</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                        <span className="text-gray-700 font-medium">WhatsApp</span>
                    </label>
                </div>
            </div>

            {/* Shopping & Communication Hub */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FiShoppingCart className="w-5 h-5 text-blue-600" />
                    Shopping & Communication Hub
                </h2>
                <p className="text-gray-500 text-sm mb-6">Manage order alerts and sync settings</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                                <FiTag className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Price Drop Alerts</h4>
                                <p className="text-xs text-gray-500">Notify when wishlist items go on sale</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                                <FiPackage className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Restock Notifications</h4>
                                <p className="text-xs text-gray-500">Get alerts for out-of-stock items</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                                <FiSmartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Cross-Device Cart Sync</h4>
                                <p className="text-xs text-gray-500">Keep cart updated across all devices</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                                <FiMail className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Exclusive Newsletter</h4>
                                <p className="text-xs text-gray-500">Early access to deals and new products</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <Link
                    href="/buyer/settings"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                    Cancel
                </Link>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all font-semibold text-sm disabled:opacity-50"
                >
                    <FiSave className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div >
    );
}
