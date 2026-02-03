import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { LiquidGlass } from '../components/LiquidGlass';
import { DottedSurface } from '../components/DottedSurface';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../services/ThemeContext';

export const ProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'details' | 'identity' | 'security' | 'properties' | 'media' | 'rentals'>('details');

    const [profileData, setProfileData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1 (555) 000-0000',
        address: '123 Luxury Ave, Beverly Hills, CA',
        bio: 'Real estate enthusiast and luxury property seeker.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });

    const [idVerification, setIdVerification] = useState({
        status: 'Verified',
        idType: 'Passport',
        idNumber: '********89',
        expiryDate: '2028-12-31',
        issueDate: '2018-01-01'
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        // Logic to update global user context could go here if needed
        alert('Profile updated successfully!');
    };

    const tabs = [
        { id: 'details', label: 'Personal Details', icon: 'person' },
        { id: 'identity', label: 'Identity & ID', icon: 'badge' },
        { id: 'rentals', label: 'My Rentals', icon: 'key' },
        { id: 'media', label: 'Media & Files', icon: 'perm_media' },
        { id: 'security', label: 'Security', icon: 'security' },
        { id: 'properties', label: 'My Properties', icon: 'home_work' },
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-500 pb-20 overflow-x-hidden">
            <Header />

            <main className="max-w-7xl mx-auto px-4 md:px-10 pt-32 relative z-10">
                <DottedSurface className="opacity-20 pointer-events-none" animated={true} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar / Profile Summary */}
                    <div className="lg:col-span-4 space-y-6">
                        <LiquidGlass contentClassName="p-8 text-center flex flex-col items-center">
                            <div className="relative group mb-6">
                                <div className="size-32 rounded-full overflow-hidden border-4 border-white/50 dark:border-white/10 shadow-2xl relative">
                                    <img
                                        src={profileData.avatar}
                                        alt="Profile"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                    />
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10"
                                    >
                                        <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setProfileData(prev => ({ ...prev, avatar: reader.result as string }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 size-8 bg-green-500 border-4 border-white dark:border-zinc-900 rounded-full shadow-lg" title="Online"></div>
                            </div>

                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                                {profileData.firstName && profileData.lastName ? `${profileData.firstName} ${profileData.lastName}` : user?.username}
                            </h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">{user?.email}</p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-[11px] mb-6 font-medium">{profileData.phone}</p>

                            <div className="flex gap-2 w-full">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                    Edit Profile
                                </button>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-all active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-[20px]">logout</span>
                                </button>
                            </div>

                            <div className="mt-8 w-full space-y-4 text-left border-t border-zinc-100 dark:border-white/5 pt-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500 dark:text-zinc-400">Account Status</span>
                                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold">
                                        <span className="material-symbols-outlined text-[16px] filled">verified</span>
                                        ACTIVE
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500 dark:text-zinc-400">Member Since</span>
                                    <span className="text-zinc-900 dark:text-white font-medium">Jan 2024</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500 dark:text-zinc-400">Trust Score</span>
                                    <span className="text-blue-600 dark:text-blue-400 font-black">98/100</span>
                                </div>
                            </div>
                        </LiquidGlass>

                        {/* Navigation Tabs (Mobile visible as pills, Desktop as side menu) */}
                        <LiquidGlass contentClassName="p-2">
                            <nav className="flex flex-col space-y-1">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined text-[22px] ${activeTab === tab.id ? 'filled' : ''}`}>
                                            {tab.icon}
                                        </span>
                                        <span className="font-semibold">{tab.label}</span>
                                        {activeTab === tab.id && (
                                            <span className="material-symbols-outlined ml-auto text-[18px]">chevron_right</span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </LiquidGlass>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8">
                        <LiquidGlass className="min-h-[600px] overflow-hidden" contentClassName="p-0">
                            {/* Tab Header */}
                            <div className="px-8 py-6 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                                        {tabs.find(t => t.id === activeTab)?.label}
                                    </h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        Manage your {activeTab} and preferences
                                    </p>
                                </div>
                                <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                    <span className="material-symbols-outlined">{tabs.find(t => t.id === activeTab)?.icon}</span>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="p-8">
                                {activeTab === 'details' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400 ml-1">First Name</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={profileData.firstName}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-5 py-3.5 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400 ml-1">Last Name</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={profileData.lastName}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-5 py-3.5 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400 ml-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={user?.email}
                                                    readOnly
                                                    className="w-full px-5 py-3.5 rounded-2xl bg-zinc-100/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-500 cursor-not-allowed font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400 ml-1">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={profileData.phone}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-5 py-3.5 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400 ml-1">Short Bio</label>
                                            <textarea
                                                rows={4}
                                                name="bio"
                                                value={profileData.bio}
                                                onChange={handleProfileChange}
                                                className="w-full px-5 py-3.5 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium resize-none"
                                            ></textarea>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={isSaving}
                                                className={`px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                                                        Saving...
                                                    </>
                                                ) : 'Save All Changes'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'identity' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/20 flex items-start gap-5">
                                            <div className="size-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                                                <span className="material-symbols-outlined text-3xl filled">verified_user</span>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-zinc-900 dark:text-white">Profile Verified</h4>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                                    Your identity has been successfully verified. You have full access to all Mabiti premium features.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                                            <div className="space-y-6">
                                                <h5 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-blue-500">info</span>
                                                    ID Information
                                                </h5>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between border-b border-zinc-100 dark:border-white/5 pb-3">
                                                        <span className="text-zinc-500">Document Type</span>
                                                        <span className="font-bold text-zinc-900 dark:text-white">{idVerification.idType}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-zinc-100 dark:border-white/5 pb-3">
                                                        <span className="text-zinc-500">ID Number</span>
                                                        <span className="font-bold text-zinc-900 dark:text-white">{idVerification.idNumber}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-zinc-100 dark:border-white/5 pb-3">
                                                        <span className="text-zinc-500">Expiration</span>
                                                        <span className="font-bold text-zinc-900 dark:text-white">{idVerification.expiryDate}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h5 className="font-bold text-zinc-900 dark:text-white mb-4">Identification Image</h5>
                                                <div className="aspect-[16/10] rounded-2xl bg-zinc-100 dark:bg-white/5 border-2 border-dashed border-zinc-200 dark:border-white/10 flex items-center justify-center relative group overflow-hidden">
                                                    <div className="text-center p-6 group-hover:scale-105 transition-transform duration-500">
                                                        <span className="material-symbols-outlined text-4xl text-zinc-400 mb-2">image_search</span>
                                                        <p className="text-sm text-zinc-500 font-medium">Verified ID Document</p>
                                                        <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest">Confidential / Encrypted</p>
                                                    </div>
                                                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button className="px-6 py-2 rounded-xl bg-white text-blue-600 font-bold text-sm shadow-xl">
                                                            View Securely
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-center text-zinc-400 italic">
                                                    To update your ID, please contact the support team for re-verification.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'media' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div>
                                            <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-blue-500">photo_library</span>
                                                My Pictures
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
                                                        <img
                                                            src={`https://images.unsplash.com/photo-${1472099645785 + i}-5658abf4ff4e?auto=format&fit=crop&q=80&w=200`}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            alt="Gallery"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <button className="size-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                                                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                            </button>
                                                            <button className="size-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform">
                                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button className="aspect-square rounded-2xl border-2 border-dashed border-zinc-200 dark:border-white/10 flex flex-col items-center justify-center group hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                                                    <span className="material-symbols-outlined text-3xl text-zinc-400 group-hover:text-blue-500 mb-2">add_a_photo</span>
                                                    <span className="text-xs font-bold text-zinc-400 group-hover:text-blue-500">Upload</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-zinc-100 dark:border-white/5">
                                            <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-purple-500">folder_open</span>
                                                Official Documents
                                            </h4>
                                            <div className="space-y-3">
                                                {[
                                                    { name: 'Passport_Copy.pdf', size: '2.4 MB', date: 'Jan 12, 2024', type: 'picture_as_pdf' },
                                                    { name: 'Proof_of_Address.jpg', size: '1.1 MB', date: 'Jan 15, 2024', type: 'image' },
                                                    { name: 'Tax_Return_2023.pdf', size: '4.8 MB', date: 'Dec 20, 2023', type: 'description' }
                                                ].map((doc, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 hover:border-blue-500/30 transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-10 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-blue-500 transition-colors">
                                                                <span className="material-symbols-outlined">{doc.type}</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-zinc-900 dark:text-white text-sm">{doc.name}</p>
                                                                <p className="text-[11px] text-zinc-500">{doc.size} • Uploaded {doc.date}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button className="size-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-blue-500/10 hover:text-blue-500 transition-all">
                                                                <span className="material-symbols-outlined text-[20px]">download</span>
                                                            </button>
                                                            <button className="size-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all">
                                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button className="w-full py-4 rounded-xl border-2 border-dashed border-zinc-200 dark:border-white/10 flex items-center justify-center gap-2 group hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-zinc-400 hover:text-purple-500 font-bold text-sm">
                                                    <span className="material-symbols-outlined">upload_file</span>
                                                    Add New Document
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="space-y-6">
                                            <h4 className="text-lg font-bold text-zinc-900 dark:text-white">Security Settings</h4>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-6 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5">
                                                    <div className="flex items-start gap-4">
                                                        <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                                            <span className="material-symbols-outlined">password</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-zinc-900 dark:text-white">Password</p>
                                                            <p className="text-sm text-zinc-500">Last changed 3 months ago</p>
                                                        </div>
                                                    </div>
                                                    <button className="px-5 py-2 rounded-xl bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/10 text-sm font-bold hover:bg-zinc-50 dark:hover:bg-white/15 transition-all">
                                                        Change
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between p-6 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5">
                                                    <div className="flex items-start gap-4">
                                                        <div className="size-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                                                            <span className="material-symbols-outlined">vibration</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-zinc-900 dark:text-white">Two-Factor Auth</p>
                                                            <p className="text-sm text-zinc-500">Secure your account with 2FA</p>
                                                        </div>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-6 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5">
                                                    <div className="flex items-start gap-4">
                                                        <div className="size-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                                                            <span className="material-symbols-outlined">devices</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-zinc-900 dark:text-white">Active Sessions</p>
                                                            <p className="text-sm text-zinc-500">2 devices currently logged in</p>
                                                        </div>
                                                    </div>
                                                    <button className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline">
                                                        Manage
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-10 border-t border-zinc-100 dark:border-white/5">
                                            <button className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold transition-colors">
                                                <span className="material-symbols-outlined">delete_forever</span>
                                                Delete My Account
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'properties' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {[1, 2].map(i => (
                                                <div key={i} className="group cursor-pointer">
                                                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-3">
                                                        <img
                                                            src={`https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400`}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                            alt="Property"
                                                        />
                                                        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-md text-xs font-black text-black">
                                                            SAVED
                                                        </div>
                                                    </div>
                                                    <h6 className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-500 transition-colors">
                                                        {i === 1 ? 'Luxury Villa in Bel Air' : 'Modern Loft in Downtown'}
                                                    </h6>
                                                    <p className="text-sm text-zinc-500">$ {i === 1 ? '4,500,000' : '850,000'}</p>
                                                </div>
                                            ))}

                                            <div className="aspect-[16/10] rounded-2xl border-2 border-dashed border-zinc-200 dark:border-white/10 flex flex-col items-center justify-center group hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer">
                                                <div className="size-12 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-blue-500 group-hover:text-white transition-all mb-3">
                                                    <span className="material-symbols-outlined">add</span>
                                                </div>
                                                <p className="text-sm font-bold text-zinc-400 group-hover:text-blue-500 transition-colors">Explore Properties</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'rentals' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center py-12 text-center">
                                        <div className="size-20 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6">
                                            <span className="material-symbols-outlined text-4xl">vpn_key</span>
                                        </div>
                                        <h4 className="text-2xl font-bold text-zinc-900 dark:text-white">Active Digital Keys</h4>
                                        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8">
                                            You can manage all your active rentals, unlock doors, and add NFC tags in the dedicated Digital Keys page.
                                        </p>
                                        <Link
                                            to="/my-rentals"
                                            className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20"
                                        >
                                            Open My Rentals
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </LiquidGlass>
                    </div>
                </div>
            </main>

            <style>{`
                .animate-in {
                    animation-duration: 500ms;
                }
                .slide-in-from-bottom-4 {
                    animation-name: slide-in-from-bottom;
                }
                @keyframes slide-in-from-bottom {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .filled {
                    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
            `}</style>
        </div>
    );
};
