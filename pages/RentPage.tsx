import React, { useEffect, useState, memo } from 'react';
import { Header } from '../components/Header';
import { LiquidGlassFilters } from '../components/LiquidGlass';
import { DottedSurface } from '../components/DottedSurface';
import { PropertyCard } from '../components/PropertyCard';
import { Property } from '../types';

const MemoizedFilters = memo(LiquidGlassFilters);
const MemoizedHeader = memo(Header);

export const RentPage: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProperties = async () => {
            try {
                const response = await fetch('/data/properties.json');
                const data = await response.json();
                setProperties(data.properties);
            } catch (error) {
                console.error('Error loading properties:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProperties();
    }, []);

    return (
        <div className="relative z-10 flex flex-col min-h-screen">
            <MemoizedFilters />

            {/* Dotted Surface Background */}
            <DottedSurface />

            <MemoizedHeader />

            <main className="layout-container flex h-full grow flex-col pt-6 pb-12">
                <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center">
                    <div className="layout-content-container flex flex-col max-w-[1400px] flex-1">

                        {/* Page Header */}
                        <div className="mb-10">
                            <h1 className="text-zinc-900 dark:text-white text-5xl font-bold mb-3">Properties for Rent</h1>
                            <p className="text-zinc-600 dark:text-zinc-400 text-lg">Discover your perfect rental home</p>
                        </div>

                        {/* Properties Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="glass-panel rounded-2xl h-[400px] animate-pulse bg-zinc-200 dark:bg-zinc-900/50"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {properties.map((property) => (
                                    <PropertyCard
                                        key={property.id}
                                        property={property}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && properties.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64">
                                <span className="material-symbols-outlined text-zinc-400 dark:text-zinc-600 text-6xl mb-4">home</span>
                                <p className="text-zinc-500 dark:text-zinc-400 text-lg">No properties available at the moment</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
