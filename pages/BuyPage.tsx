import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { DottedSurface } from '../components/DottedSurface';
import { useTheme } from '../services/ThemeContext';
import { ThreeDViewer } from '../components/ThreeDViewer';
import propertiesData from '../data/properties.json';

interface Property {
    id: string;
    title: string;
    address: string;
    price: number;
    beds: number;
    baths: number;
    sqft: number;
    images: {
        hero: string;
    };
    neighborhood: string;
    type?: string;
    yearBuilt?: number;
}

type SortOption = 'price-low' | 'price-high' | 'newest' | 'beds' | 'sqft';
type ViewMode = 'grid' | 'list';

export const BuyPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
    const [bedroomFilter, setBedroomFilter] = useState('any');
    const [bathroomFilter, setBathroomFilter] = useState('any');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [show3DViewer, setShow3DViewer] = useState(false);
    const [selected3DProperty, setSelected3DProperty] = useState<Property | null>(null);
    const { theme } = useTheme();
    const navigate = useNavigate();

    const properties: Property[] = propertiesData.properties;

    const propertyTypes = ['All', 'House', 'Apartment', 'Condo', 'Villa', 'Townhouse', 'Land'];

    // Filter and sort properties
    const filteredProperties = useMemo(() => {
        let filtered = properties.filter(property => {
            // Search query - search in multiple fields
            const matchesSearch = searchQuery === '' || 
                property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                property.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
                property.price.toString().includes(searchQuery) ||
                property.beds.toString().includes(searchQuery) ||
                property.baths.toString().includes(searchQuery) ||
                property.sqft.toString().includes(searchQuery) ||
                (property.type && property.type.toLowerCase().includes(searchQuery.toLowerCase()));

            // Type filter
            const matchesType = selectedType === 'All' || property.type === selectedType;

            // Price range
            const matchesPrice = property.price >= priceRange[0] && property.price <= priceRange[1];

            // Bedroom filter
            const matchesBeds = bedroomFilter === 'any' || 
                (bedroomFilter === '4+' ? property.beds >= 4 : property.beds === parseInt(bedroomFilter));

            // Bathroom filter
            const matchesBaths = bathroomFilter === 'any' || 
                (bathroomFilter === '3+' ? property.baths >= 3 : property.baths >= parseFloat(bathroomFilter));

            return matchesSearch && matchesType && matchesPrice && matchesBeds && matchesBaths;
        });

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'beds':
                    return b.beds - a.beds;
                case 'sqft':
                    return b.sqft - a.sqft;
                case 'newest':
                default:
                    return (b.yearBuilt || 0) - (a.yearBuilt || 0);
            }
        });

        return filtered;
    }, [properties, searchQuery, selectedType, priceRange, bedroomFilter, bathroomFilter, sortBy]);

    const formatPrice = (price: number) => {
        if (price < 10000) {
            return `$${price.toLocaleString()}/mo`;
        }
        return `$${(price / 1000000).toFixed(2)}M`;
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedType('All');
        setPriceRange([0, 10000000]);
        setBedroomFilter('any');
        setBathroomFilter('any');
        setSortBy('newest');
    };

    const open3DViewer = (property: Property) => {
        setSelected3DProperty(property);
        setShow3DViewer(true);
    };

    const close3DViewer = () => {
        setShow3DViewer(false);
        setSelected3DProperty(null);
    };

    return (
        <div className="relative z-10 flex flex-col min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-500 overflow-hidden">
            <DottedSurface />
            <Header />

            <main className="flex-1 px-4 md:px-8 lg:px-12 xl:px-16 pt-24 pb-16 relative z-10">
                <div className="max-w-[1600px] mx-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
                            Find Your Property
                        </h1>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                            Discover {filteredProperties.length} properties available for sale
                        </p>
                    </div>

                    {/* Search and Quick Filters Bar */}
                    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/20 dark:border-white/10 mb-6 shadow-lg">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1 relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-500">
                                    search
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by location, property name, or neighborhood..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
                                />
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                        viewMode === 'grid'
                                            ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-md'
                                            : 'text-zinc-600 dark:text-zinc-400'
                                    }`}
                                >
                                    <span className="material-symbols-outlined">grid_view</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                        viewMode === 'list'
                                            ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-md'
                                            : 'text-zinc-600 dark:text-zinc-400'
                                    }`}
                                >
                                    <span className="material-symbols-outlined">view_list</span>
                                </button>
                            </div>

                            {/* Filter Toggle Button */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">tune</span>
                                Filters
                            </button>
                        </div>

                        {/* Advanced Filters Panel */}
                        {showFilters && (
                            <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700 space-y-6 animate-fadeIn">
                                {/* Property Type Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                                        Property Type
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {propertyTypes.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedType(type)}
                                                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                                                    selectedType === type
                                                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                                                        : 'bg-white/50 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/10'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Price Range */}
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                                            Price Range
                                        </label>
                                        <div className="space-y-3">
                                            <input
                                                type="range"
                                                min="0"
                                                max="10000000"
                                                step="100000"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                                className="w-full accent-blue-600"
                                            />
                                            <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                                                <span>$0</span>
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                    Up to ${(priceRange[1] / 1000000).toFixed(1)}M
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bedrooms */}
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                                            Bedrooms
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['any', '1', '2', '3', '4+'].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => setBedroomFilter(option)}
                                                    className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                                                        bedroomFilter === option
                                                            ? 'bg-blue-600 text-white shadow-lg'
                                                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                                    }`}
                                                >
                                                    {option === 'any' ? 'Any' : option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bathrooms */}
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                                            Bathrooms
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['any', '1', '2', '3+'].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => setBathroomFilter(option)}
                                                    className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                                                        bathroomFilter === option
                                                            ? 'bg-blue-600 text-white shadow-lg'
                                                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                                    }`}
                                                >
                                                    {option === 'any' ? 'Any' : option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Clear Filters Button */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={clearFilters}
                                        className="px-6 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                                        Clear All Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Results Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="text-zinc-700 dark:text-zinc-300">
                            <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                                {filteredProperties.length}
                            </span>
                            <span className="ml-2">properties found</span>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                Sort by:
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors font-semibold"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="beds">Most Bedrooms</option>
                                <option value="sqft">Largest Size</option>
                            </select>
                        </div>
                    </div>

                    {/* Properties Grid/List */}
                    {filteredProperties.length === 0 ? (
                        <div className="text-center py-20">
                            <span className="material-symbols-outlined text-[120px] text-zinc-300 dark:text-zinc-700 mb-4 block">
                                search_off
                            </span>
                            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                                No properties found
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                                Try adjusting your filters or search criteria
                            </p>
                            <button
                                onClick={clearFilters}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProperties.map((property, index) => (
                                <div
                                    key={property.id}
                                    onClick={() => navigate(`/property/${property.id}`)}
                                    className="group relative bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 dark:border-white/10 hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Property Image */}
                                    <div className="relative h-56 overflow-hidden">
                                        <img
                                            src={property.images.hero}
                                            alt={property.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        {/* Price Badge */}
                                        <div className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg">
                                            {formatPrice(property.price)}
                                        </div>
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>

                                    {/* Property Info */}
                                    <div className="p-5">
                                        <p className="text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                                            {property.neighborhood}
                                        </p>
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {property.title}
                                        </h3>

                                        {/* Property Features */}
                                        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[18px]">bed</span>
                                                <span className="text-sm font-medium">{property.beds}</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[18px]">bathtub</span>
                                                <span className="text-sm font-medium">{property.baths}</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[18px]">square_foot</span>
                                                <span className="text-sm font-medium">{property.sqft}</span>
                                            </span>
                                        </div>

                                        {/* Address */}
                                        <div className="mt-3 flex items-start gap-2 text-zinc-500 dark:text-zinc-500">
                                            <span className="material-symbols-outlined text-[16px] mt-0.5">location_on</span>
                                            <p className="text-xs line-clamp-1">{property.address}</p>
                                        </div>
                                    </div>

                                    {/* Hover CTA */}
                                    <div className="absolute inset-x-0 bottom-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-white/95 dark:from-black/95 to-transparent">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/property/${property.id}`);
                                                }}
                                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center gap-2"
                                            >
                                                View Details
                                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    open3DViewer(property);
                                                }}
                                                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center"
                                                title="View in 3D"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredProperties.map((property, index) => (
                                <div
                                    key={property.id}
                                    onClick={() => navigate(`/property/${property.id}`)}
                                    className="group bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 dark:border-white/10 hover:shadow-2xl transition-all duration-500 cursor-pointer"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex flex-col md:flex-row">
                                        {/* Property Image */}
                                        <div className="relative md:w-80 h-56 overflow-hidden">
                                            <img
                                                src={property.images.hero}
                                                alt={property.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            {/* Price Badge */}
                                            <div className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg">
                                                {formatPrice(property.price)}
                                            </div>
                                        </div>

                                        {/* Property Info */}
                                        <div className="flex-1 p-6">
                                            <p className="text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                                                {property.neighborhood}
                                            </p>
                                            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {property.title}
                                            </h3>

                                            {/* Property Features */}
                                            <div className="flex items-center gap-6 text-zinc-600 dark:text-zinc-400 mb-4">
                                                <span className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[20px]">bed</span>
                                                    <span className="font-medium">{property.beds} Beds</span>
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[20px]">bathtub</span>
                                                    <span className="font-medium">{property.baths} Baths</span>
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[20px]">square_foot</span>
                                                    <span className="font-medium">{property.sqft} sqft</span>
                                                </span>
                                            </div>

                                            {/* Address */}
                                            <div className="flex items-start gap-2 text-zinc-500 dark:text-zinc-500 mb-4">
                                                <span className="material-symbols-outlined text-[18px] mt-0.5">location_on</span>
                                                <p className="text-sm">{property.address}</p>
                                            </div>

                                            <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2">
                                                View Details
                                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    open3DViewer(property);
                                                }}
                                                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
                                                3D Tour
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* 3D Viewer Modal */}
            <ThreeDViewer 
                isOpen={show3DViewer}
                onClose={close3DViewer}
                propertyTitle={selected3DProperty?.title || 'Property 3D Tour'}
            />

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .grid > div, .space-y-4 > div {
                    animation: fadeInUp 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
};
