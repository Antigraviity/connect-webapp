"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FiMail,
    FiPhone,
    FiBell,
    FiBriefcase,
    FiArrowLeft,
    FiSave,
    FiLoader,
    FiCheck
} from "react-icons/fi";

export default function JobNotifications() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true,
        jobAlerts: true,
        applicationStatus: true
    });

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) return;
                const user = JSON.parse(userStr);

                const response = await fetch(`/api/users/preferences?userId=${user.id}`);
                const data = await response.json();

                if (data.success && data.preferences?.jobNotifications) {
                    setNotifications(data.preferences.jobNotifications);
                }
            } catch (error) {
                console.error("Error fetching preferences:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            // Fetch current preferences first to avoid overwriting other areas
            const getRes = await fetch(`/api/users/preferences?userId=${user.id}`);
            const getData = await getRes.json();
            const currentPrefs = getData.success ? getData.preferences : {};

            const updatedPrefs = {
                ...currentPrefs,
                jobNotifications: notifications
            };

            const response = await fetch('/api/users/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, preferences: updatedPrefs })
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Error saving preferences:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <FiLoader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="text-gray-500 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                        aria-label="Go back"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-primary">Career Notification Preferences</h1>
                        <p className="text-sm text-gray-500 mt-1">Control how you stay connected for job alerts and applications.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all font-bold disabled:opacity-70"
                >
                    {saving ? <FiLoader className="animate-spin" /> : (success ? <FiCheck /> : <FiSave />)}
                    {saving ? "Saving..." : (success ? "Saved!" : "Save Changes")}
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 font-primary">Universal Notifications</h2>
                    <p className="text-sm text-gray-500 mb-8">Control how you stay connected across all zones.</p>

                    <div className="space-y-10">
                        {/* Channel Toggles */}
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Contact Channels</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { key: 'email', label: 'Email Alerts', icon: FiMail, color: "blue" },
                                    { key: 'sms', label: 'SMS Notifications', icon: FiPhone, color: "emerald" },
                                    { key: 'push', label: 'Native Push', icon: FiBell, color: "orange" }
                                ].map(channel => (
                                    <div key={channel.key} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <channel.icon className={`w-5 h-5 text-${channel.color}-600`} />
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notifications[channel.key as keyof typeof notifications]}
                                                    onChange={(e) => setNotifications({ ...notifications, [channel.key]: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                                            </label>
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">{channel.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Area Specific */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Career Zone Alerts</h3>

                            <div className="space-y-4">
                                {[
                                    { key: 'jobAlerts', label: 'Job Alerts', icon: FiBell, desc: "New job matches based on your preferences" },
                                    { key: 'applicationStatus', label: 'Application Status', icon: FiBriefcase, desc: "Recruiter feedback and interview invites" }
                                ].map(alert => (
                                    <div key={alert.key} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 group hover:border-blue-200 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <alert.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{alert.label}</h4>
                                                <p className="text-xs text-gray-500">{alert.desc}</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={notifications[alert.key as keyof typeof notifications]}
                                                onChange={(e) => setNotifications({ ...notifications, [alert.key]: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
