'use client';

import { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    CreditCard,
    Star,
    Activity
} from 'lucide-react';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const adminData = localStorage.getItem('adminUser');
        if (adminData) {
            try {
                const parsedUser = JSON.parse(adminData);
                // Ensure role is set to ADMIN if not present
                if (!parsedUser.role) parsedUser.role = 'ADMIN';
                if (!parsedUser.userType) parsedUser.userType = 'SUPER ADMIN';
                setUser(parsedUser);
            } catch (e) {
                console.error('Failed to parse admin user', e);
            }
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-gray-500">Loading profile...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-gray-500">No admin profile found. Please log in again.</div>
            </div>
        );
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-800';
            case 'SELLER': return 'bg-green-100 text-green-800';
            case 'USER': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getUserTypeColor = (userType: string) => {
        switch (userType) {
            case 'BUYER': return 'bg-blue-100 text-blue-800';
            case 'SELLER': return 'bg-green-100 text-green-800';
            case 'EMPLOYER': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-5xl">
            {/* Header Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    <div className="flex-shrink-0">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                            <span className="text-4xl font-bold text-white">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                            <p className="text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                <Shield className="h-3 w-3 mr-1" />
                                {user.role}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getUserTypeColor(user.userType || '')}`}>
                                <User className="h-3 w-3 mr-1" />
                                {user.userType}
                            </span>
                            {(user as any).verified && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Verified
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <User className="h-5 w-5 mr-2 text-gray-500" />
                            Personal Information
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                            <div className="text-gray-900 font-medium border-b border-gray-100 pb-2">{user.name}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                            <div className="text-gray-900 font-medium border-b border-gray-100 pb-2">{user.email}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                            <div className="text-gray-900 font-medium border-b border-gray-100 pb-2">
                                <div className="flex items-center">
                                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                    {user.phone || 'N/A'}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Date Joined</label>
                            <div className="text-gray-900 font-medium border-b border-gray-100 pb-2">
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    {new Date((user as any).createdAt || Date.now()).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                            <div className="text-gray-900 font-medium border-b border-gray-100 pb-2">
                                <div className="flex items-start">
                                    <MapPin className="h-4 w-4 mr-2 mt-1 text-gray-400" />
                                    <span>
                                        {user.address ? (
                                            <>
                                                {user.address}
                                                {user.city && <><br />{user.city}, {user.state} {user.zipCode}</>}
                                            </>
                                        ) : 'No address provided'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-gray-500" />
                            Account Activity
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                        <Activity className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Account Status</p>
                                        <p className="text-xs text-gray-500">Your account is currently active</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                </span>
                            </div>

                            {(user as any).lastLogin && (
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Last Login</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date((user as any).lastLogin).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
