import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { LiquidGlass, LiquidGlassFilters } from '../components/LiquidGlass';
import { rentalService, Rental } from '../services/rentalService';
import { useAuth } from '../services/AuthContext';

const MemoizedFilters = memo(LiquidGlassFilters);
const MemoizedHeader = memo(Header);

export const MyRentalsPage: React.FC = () => {
    const { user } = useAuth();
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchRentals = async () => {
            try {
                const data = await rentalService.getAll();
                setRentals(data);
            } catch (error) {
                console.error('Error fetching rentals:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRentals();
    }, []);

    const handleUnlock = (propertyName: string) => {
        setActionMessage(`Unlocking door for ${propertyName}...`);
        setTimeout(() => setActionMessage(null), 3000);
    };

    const handleAddNFC = (propertyName: string) => {
        setActionMessage(`Adding NFC tag/card for ${propertyName}...`);
        setTimeout(() => setActionMessage(null), 3000);
    };

    return (
        <div className="relative z-10 flex flex-col min-h-screen bg-zinc-50 dark:bg-black/90 transition-colors duration-500">
            <MemoizedFilters />

            {/* Background Layer */}
            <div className="fixed inset-0 z-[-1] select-none pointer-events-none">
                <div className="absolute inset-0 bg-white/60 dark:bg-[#050505]/85 backdrop-blur-[2px] z-10 transition-colors duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-transparent to-transparent dark:from-[#050505] z-10 transition-colors duration-500"></div>
            </div>

            <MemoizedHeader />

            <main className="layout-container flex h-full grow flex-col pt-6 pb-12">
                <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center">
                    <div className="layout-content-container flex flex-col max-w-[1280px] flex-1">

                        <header className="mb-10">
                            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white tracking-tight mb-2">
                                My Digital Keys
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                                Manage your active rentals and property access
                            </p>
                        </header>

                        {actionMessage && (
                            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
                                <LiquidGlass variant="nav" className="px-6 py-3 bg-blue-600 text-white font-bold shadow-2xl animate-bounce">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined spin">sync_saved_locally</span>
                                        {actionMessage}
                                    </div>
                                </LiquidGlass>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="animate-pulse glass-panel rounded-3xl h-64 bg-zinc-200 dark:bg-white/5"></div>
                                ))}
                            </div>
                        ) : rentals.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {rentals.map((rental) => (
                                    <RentalCard
                                        key={rental.id}
                                        rental={rental}
                                        onUnlock={() => handleUnlock(rental.property_details.title)}
                                        onAddNFC={() => handleAddNFC(rental.property_details.title)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-white/40 dark:bg-white/5 border-dashed border-2 border-zinc-300 dark:border-white/10">
                                <span className="material-symbols-outlined text-6xl text-zinc-300 dark:text-zinc-700 mb-4">key_off</span>
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">No active rentals found</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md">
                                    You don't have any active digital keys yet. Rent a property to see it here and manage your access.
                                </p>
                                <Link to="/rent" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:scale-105">
                                    Browse Rentals
                                </Link>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
};

interface RentalCardProps {
    rental: Rental;
    onUnlock: () => void;
    onAddNFC: () => void;
}

const RentalCard: React.FC<RentalCardProps> = ({ rental, onUnlock, onAddNFC }) => {
    const { property_details: property } = rental;

    return (
        <div className="group relative">
            {/* Ambient Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>

            <div className="relative glass-panel rounded-3xl overflow-hidden bg-white/70 dark:bg-black/60 border-zinc-200 dark:border-white/10 shadow-xl backdrop-blur-xl flex flex-col h-full">
                {/* Property Image Header */}
                <div className="relative h-44 overflow-hidden">
                    <img
                        src={property.images.hero}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-white font-bold text-xl leading-tight">{property.title}</h3>
                                <p className="text-white/70 text-sm flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                                    {property.address}
                                </p>
                            </div>
                            <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 px-2 py-1 rounded-lg text-green-400 text-[10px] font-bold uppercase tracking-wider">
                                Active
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rental Info */}
                <div className="p-6 flex flex-col flex-1 gap-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Check In</span>
                            <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{new Date(rental.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Check Out</span>
                            <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{new Date(rental.end_date).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Quick Access Actions */}
                    <div className="flex flex-col gap-3 mt-auto">
                        {property.has_online_lock ? (
                            <>
                                <button
                                    onClick={onUnlock}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-blue-500/20"
                                >
                                    <span className="material-symbols-outlined">lock_open</span>
                                    Unlock Door
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={onAddNFC}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white rounded-xl text-sm font-bold transition-all border border-zinc-200 dark:border-white/10"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">nfc</span>
                                        Add NFC
                                    </button>
                                    <Link
                                        to={`/property/${property.id}`}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white rounded-xl text-sm font-bold transition-all border border-zinc-200 dark:border-white/10"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                        Details
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="p-3 bg-zinc-100 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/10 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-zinc-400">key</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Access Method</span>
                                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Physical Key Required</span>
                                    </div>
                                </div>
                                <Link
                                    to={`/property/${property.id}`}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold transition-all hover:scale-[1.02]"
                                >
                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                    View Arrival Instructions
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Bar */}
                <div className="px-6 py-3 bg-zinc-50 dark:bg-white/5 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center text-[11px] font-medium text-zinc-500">
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        Available until 11:00 AM
                    </span>
                    <span className="text-blue-500 font-bold">SMART LOCK ID: SL-2940</span>
                </div>
            </div>
        </div>
    );
};
