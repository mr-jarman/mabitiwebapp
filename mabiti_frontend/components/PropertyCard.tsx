import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../types';

interface PropertyCardProps {
    property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
    return (
        <Link
            to={`/property/${property.id}`}
            className="glass-panel rounded-2xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 block bg-white dark:bg-black/40 border-zinc-200 dark:border-white/10 shadow-lg dark:shadow-none"
        >
            {/* Image */}
            <div className="relative h-64 overflow-hidden">
                <img
                    src={property.images.hero}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* 360 Indicator */}
                {property.panorama_images && property.panorama_images.length > 0 && (
                    <div className="absolute top-12 right-4 z-10">
                        <div className="bg-white/90 dark:bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20">
                            <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">360</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">360° View</span>
                        </div>
                    </div>
                )}
                {/* Price Badge */}
                <div className="absolute top-4 left-4">
                    <div className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                        ${property.price.toLocaleString()}
                    </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 backdrop-blur-sm text-white text-xs font-semibold rounded-full uppercase tracking-wide ${property.listing_type === 'buy' ? 'bg-orange-500/90' : 'bg-green-500/90'
                        }`}>
                        For {property.listing_type === 'buy' ? 'Buy' : 'Rent'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-black dark:text-white text-xl font-bold mb-2 line-clamp-1">
                    {property.title}
                </h3>

                <p className="text-zinc-700 dark:text-zinc-400 text-sm mb-4 flex items-center gap-1">
                    <span className="material-symbols-outlined text-zinc-500 dark:text-zinc-500 text-lg">location_on</span>
                    {property.address}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300 text-sm">
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-zinc-400 dark:text-zinc-500">bed</span>
                        <span>{property.beds} beds</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-zinc-400 dark:text-zinc-500">bathtub</span>
                        <span>{property.baths} baths</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-zinc-400 dark:text-zinc-500">square_foot</span>
                        <span>{property.sqft.toLocaleString()} sqft</span>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {property.features.slice(0, 3).map((feature, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-400 text-xs rounded-full border border-black/5 dark:border-white/10"
                        >
                            {feature}
                        </span>
                    ))}
                    {property.features.length > 3 && (
                        <span className="px-2 py-1 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                            +{property.features.length - 3} more
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};
