import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../types';

interface AiPropertyCardProps {
    property: Property;
    commute?: string;
}

export const AiPropertyCard: React.FC<AiPropertyCardProps> = ({ property, commute }) => {
    return (
        <Link
            to={`/property/${property.id}`}
            className="flex-shrink-0 w-72 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-xl group"
        >
            <div className="relative h-40 overflow-hidden">
                <img
                    src={property.images.hero}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                <div className="absolute bottom-3 left-3 text-white">
                    <p className="font-bold text-lg">
                        ${property.price.toLocaleString()}
                        {property.listing_type === 'rent' && <span className="text-xs ml-1 opacity-80">/mo</span>}
                    </p>
                    <p className="text-xs opacity-90">{property.beds} Beds • {property.baths} Baths</p>
                </div>

                {commute && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <span className="material-symbols-outlined text-[10px]">commute</span>
                        {commute}
                    </div>
                )}
            </div>

            <div className="p-4">
                <h4 className="text-zinc-900 dark:text-white font-bold text-sm line-clamp-1 mb-1" title={property.title}>
                    {property.title}
                </h4>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-1 mb-3">
                    {property.address}
                </p>

                <div className="flex gap-1 flex-wrap">
                    {property.features.slice(0, 2).map((feat, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-white/5 rounded-full text-zinc-600 dark:text-zinc-400 border border-black/5 dark:border-white/5">
                            {feat}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
};
