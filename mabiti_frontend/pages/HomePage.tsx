import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { DottedSurface } from '../components/DottedSurface';
import { useTheme } from '../services/ThemeContext';
import { propertyService } from '../services/propertyService';
import { Property } from '../types';

export const HomePage: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { theme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const data = await propertyService.getAll();
                setProperties(data);
            } catch (error) {
                console.error('Failed to fetch properties:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    const featuredProperties = properties.slice(0, 3);
    const displayProperties = properties.slice(0, 6);

    // Auto-slide carousel
    useEffect(() => {
        if (featuredProperties.length > 0) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % featuredProperties.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [featuredProperties.length]);

    const formatPrice = (price: number) => {
        if (price < 10000) {
            return `$${price.toLocaleString()}/mo`;
        }
        return `$${(price / 1000000).toFixed(2)}M`;
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % featuredProperties.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + featuredProperties.length) % featuredProperties.length);
    };

    const categories = ['All', 'Luxury', 'Modern', 'Classic', 'Waterfront'];

    return (
        <div className="relative z-10 flex flex-col min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-500 overflow-hidden">
            {/* DottedSurface Background */}
            <DottedSurface />

            <Header />

            {/* Main Content Container */}
            <main className="flex-1 px-4 md:px-8 lg:px-12 xl:px-16 pt-24 pb-8 relative z-10">
                <div className="max-w-[1600px] mx-auto">
                    {/* Hero Carousel Section */}
                    <div className="relative h-[450px] rounded-3xl overflow-hidden mb-8 group">
                        {/* Carousel Images */}
                        {featuredProperties.map((property, index) => (
                            <div
                                key={property.id}
                                className={`absolute inset-0 transition-all duration-700 ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                                    }`}
                            >
                                <img
                                    src={property.images.hero}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                                    <div className="max-w-2xl">
                                        <p className="text-blue-400 font-semibold mb-2 text-sm tracking-wider uppercase">
                                            {property.neighborhood}
                                        </p>
                                        <h1 className="text-white text-4xl md:text-5xl font-bold mb-4 leading-tight">
                                            {property.title}
                                        </h1>
                                        <div className="flex items-center gap-6 mb-6">
                                            <span className="text-white text-3xl font-bold">
                                                {formatPrice(property.price)}
                                            </span>
                                            <div className="flex gap-4 text-white/80">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[20px]">bed</span>
                                                    {property.beds}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[20px]">bathtub</span>
                                                    {property.baths}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[20px]">square_foot</span>
                                                    {property.sqft}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/property/${property.id}`)}
                                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/50"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/20 dark:bg-black/40 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white/30 dark:hover:bg-black/60 transition-all duration-300"
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/20 dark:bg-black/40 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white/30 dark:hover:bg-black/60 transition-all duration-300"
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>

                        {/* Slide Indicators */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                            {featuredProperties.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide
                                        ? 'w-12 bg-blue-500'
                                        : 'w-6 bg-white/40 hover:bg-white/60'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Stats & Categories Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                        {/* Quick Stats */}
                        <div className="lg:col-span-5 grid grid-cols-3 gap-4">
                            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-white/10 hover:scale-105 transition-all duration-300">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                    {properties.length}
                                </div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400">Properties</div>
                            </div>
                            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-white/10 hover:scale-105 transition-all duration-300">
                                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                                    12
                                </div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400">Cities</div>
                            </div>
                            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-white/10 hover:scale-105 transition-all duration-300">
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                                    98%
                                </div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400">Satisfied</div>
                            </div>
                        </div>

                        {/* Category Filters */}
                        <div className="lg:col-span-7 bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-white/10 flex items-center gap-3 overflow-x-auto">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-6 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 ${selectedCategory === category
                                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                                        : 'bg-white/50 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/10'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Featured Properties Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayProperties.map((property, index) => (
                            <div
                                key={property.id}
                                onClick={() => navigate(`/property/${property.id}`)}
                                className="group relative bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 dark:border-white/10 hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer"
                                style={{ animationDelay: `${index * 100}ms` }}
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
                                    <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center gap-2">
                                        View Property
                                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Custom Animations */}
            <style>{`
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
                
                .grid > div {
                    animation: fadeInUp 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
};
